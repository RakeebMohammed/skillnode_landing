"use client";

import { FormEvent, useState } from "react";

type FieldName = "name" | "email" | "phone" | "message";
type Errors = Partial<Record<FieldName, string>>;

function validate(values: Record<FieldName, string>): Errors {
  const errors: Errors = {};
  if (values.name.length < 2) errors.name = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!/^[+()\-\s.\d]{7,25}$/.test(values.phone) || values.phone.replace(/\D/g, "").length < 7) errors.phone = "Please enter a valid phone number.";
  if (values.message.length < 10) errors.message = "Please enter at least 10 characters.";
  return errors;
}

export default function LandingForm() {
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const values = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      message: String(form.get("message") || "").trim(),
    };
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setStatus("");
    if (Object.keys(validationErrors).length) return;

    setBusy(true);
    const visitorId = localStorage.getItem("skillnode_visitor_id");
    const sessionId = sessionStorage.getItem("skillnode_session_id");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, visitorId, sessionId, pageUrl: window.location.href, referrer: document.referrer || null }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fields || {});
        throw new Error(result.error || "Unable to submit your request.");
      }
      formElement.reset();
      setStatus("Thanks! Your request has been submitted.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form id="form" className="lead-form" onSubmit={submit} noValidate>
    <div><label htmlFor="name">Name</label><input id="name" name="name" required minLength={2} placeholder="Your name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name && <small id="name-error" className="field-error">{errors.name}</small>}</div>
    <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />{errors.email && <small id="email-error" className="field-error">{errors.email}</small>}</div>
    <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" required minLength={7} maxLength={25} placeholder="Your phone number" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} />{errors.phone && <small id="phone-error" className="field-error">{errors.phone}</small>}</div>
    <div className="full"><label htmlFor="message">Message</label><textarea id="message" name="message" rows={5} required minLength={10} placeholder="Tell us what you need..." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} />{errors.message && <small id="message-error" className="field-error">{errors.message}</small>}</div>
    <button disabled={busy} type="submit">{busy ? "Submitting..." : "Submit Request"}</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
