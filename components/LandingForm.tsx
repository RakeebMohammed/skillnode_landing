"use client";

import { FormEvent, useState } from "react";

type FieldName = "name" | "email" | "phone" | "interest" | "message";
type Errors = Partial<Record<FieldName, string>>;
const interests = ["Hire talent", "Find work", "Build a project", "Partnership or business", "Something else"];

function validate(values: Record<FieldName, string>): Errors {
  const errors: Errors = {};
  if (values.name.length < 2) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!/^[+()\-\s.\d]{7,25}$/.test(values.phone) || values.phone.replace(/\D/g, "").length < 7) errors.phone = "Please enter a valid phone number.";
  if (!interests.includes(values.interest)) errors.interest = "Please choose what you are interested in.";
  if (values.message.length > 2000) errors.message = "Please keep your message under 2,000 characters.";
  return errors;
}

export default function LandingForm() {
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget, form = new FormData(formElement);
    const values = { name: String(form.get("name") || "").trim(), email: String(form.get("email") || "").trim(), phone: String(form.get("phone") || "").trim(), interest: String(form.get("interest") || "").trim(), message: String(form.get("message") || "").trim() };
    const validationErrors = validate(values); setErrors(validationErrors); setStatus("");
    if (Object.keys(validationErrors).length) return;
    setBusy(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, visitorId: localStorage.getItem("skillnode_visitor_id"), sessionId: sessionStorage.getItem("skillnode_session_id"), pageUrl: window.location.href, referrer: document.referrer || null }) });
      const result = await response.json();
      if (!response.ok) { setErrors(result.fields || {}); throw new Error(result.error || "Unable to submit your request."); }
      formElement.reset(); setStatus("Thanks! Your request has been submitted.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again."); } finally { setBusy(false); }
  }

  return <form id="form" className="lead-form" onSubmit={submit} noValidate>
    <div><label htmlFor="name">Full name</label><input id="name" name="name" required minLength={2} autoComplete="name" placeholder="Your name" aria-invalid={Boolean(errors.name)} />{errors.name && <small className="field-error">{errors.name}</small>}</div>
    <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />{errors.email && <small className="field-error">{errors.email}</small>}</div>
    <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" inputMode="tel" pattern="[+()\-\s.0-9]{7,25}" required minLength={7} maxLength={25} autoComplete="tel" placeholder="Your phone number" aria-invalid={Boolean(errors.phone)} onInput={event => { event.currentTarget.value = event.currentTarget.value.replace(/[^+()\-\s.\d]/g, ""); }} />{errors.phone && <small className="field-error">{errors.phone}</small>}</div>
    <div><label htmlFor="interest">I’m interested in</label><select id="interest" name="interest" required defaultValue="" aria-invalid={Boolean(errors.interest)}><option value="" disabled>Select an option</option>{interests.map(interest => <option key={interest}>{interest}</option>)}</select>{errors.interest && <small className="field-error">{errors.interest}</small>}</div>
    <div className="full"><label htmlFor="message">Message <span className="optional">(optional)</span></label><textarea id="message" name="message" rows={4} maxLength={2000} placeholder="Share any details that would help us assist you." aria-invalid={Boolean(errors.message)} />{errors.message && <small className="field-error">{errors.message}</small>}</div>
    <button disabled={busy} type="submit">{busy ? "Submitting..." : "Submit Request"}</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
