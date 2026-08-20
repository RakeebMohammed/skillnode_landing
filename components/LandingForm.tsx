"use client";

import { FormEvent, useState } from "react";

type FieldName = "name" | "email" | "profileType" | "interest" | "timeline" | "message";
type Errors = Partial<Record<FieldName, string>>;
const profileTypes = ["Hiring", "Looking for work", "Business", "Exploring"];
const interests = ["Find talent", "Find projects", "Build a project", "Partnership", "Other"];
const timelines = ["Just exploring", "This week", "This month", "Later"];

function ChoiceGroup({ label, name, options, value, onChange, error }: { label: string; name: FieldName; options: string[]; value: string; onChange: (value: string) => void; error?: string }) {
  return <fieldset className="question-choice full"><legend>{label}</legend><div className="choice-grid" role="radiogroup" aria-invalid={Boolean(error)}>{options.map(option => <button key={option} type="button" role="radio" aria-checked={value === option} className={value === option ? "selected" : ""} onClick={() => onChange(option)}>{option}</button>)}</div>{error && <small className="field-error">{error}</small>}<input type="hidden" name={name} value={value} /></fieldset>;
}

export default function LandingForm() {
  const [status, setStatus] = useState(""); const [errors, setErrors] = useState<Errors>({}); const [busy, setBusy] = useState(false);
  const [profileType, setProfileType] = useState(""); const [interest, setInterest] = useState(""); const [timeline, setTimeline] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const element = event.currentTarget, form = new FormData(element);
    const values = { name: String(form.get("name") || "").trim(), email: String(form.get("email") || "").trim(), profileType, interest, timeline, message: String(form.get("message") || "").trim() };
    const nextErrors: Errors = {};
    if (values.name.length < 2) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Please enter a valid email address.";
    if (!profileTypes.includes(profileType)) nextErrors.profileType = "Select the option that best describes you.";
    if (!interests.includes(interest)) nextErrors.interest = "Select what you need help with.";
    if (!timelines.includes(timeline)) nextErrors.timeline = "Select your preferred timeline.";
    if (values.message.length > 2000) nextErrors.message = "Please keep your details under 2,000 characters.";
    setErrors(nextErrors); setStatus(""); if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, visitorId: localStorage.getItem("skillnode_visitor_id"), sessionId: sessionStorage.getItem("skillnode_session_id"), pageUrl: window.location.href, referrer: document.referrer || null }) });
      const result = await response.json(); if (!response.ok) { setErrors(result.fields || {}); throw new Error(result.error || "Unable to submit your questionnaire."); }
      element.reset(); setProfileType(""); setInterest(""); setTimeline(""); setStatus("Thanks! Your answers have been submitted.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Something went wrong. Please try again."); } finally { setBusy(false); }
  }

  return <form id="form" className="lead-form questionnaire-form" onSubmit={submit} noValidate>
    <div className="questionnaire-heading full"><span>GET STARTED</span><strong>Tell us a little about you.</strong><small>Choose what fits best and we’ll guide you from there.</small></div>
    <div className="full questionnaire-input"><input id="name" name="name" required minLength={2} autoComplete="name" placeholder="Your name" aria-label="Your name" aria-invalid={Boolean(errors.name)} />{errors.name && <small className="field-error">{errors.name}</small>}</div>
    <div className="full questionnaire-input"><input id="email" name="email" type="email" required autoComplete="email" placeholder="Your email" aria-label="Your email" aria-invalid={Boolean(errors.email)} />{errors.email && <small className="field-error">{errors.email}</small>}</div>
    <ChoiceGroup label="I’m here to" name="profileType" options={profileTypes} value={profileType} onChange={setProfileType} error={errors.profileType} />
    <ChoiceGroup label="I need help with" name="interest" options={interests} value={interest} onChange={setInterest} error={errors.interest} />
    <ChoiceGroup label="I’d like to start" name="timeline" options={timelines} value={timeline} onChange={setTimeline} error={errors.timeline} />
    <div className="full questionnaire-input"><textarea id="message" name="message" rows={3} maxLength={2000} placeholder="Anything else you’d like us to know? (optional)" aria-label="Additional details" aria-invalid={Boolean(errors.message)} />{errors.message && <small className="field-error">{errors.message}</small>}</div>
    <button disabled={busy} type="submit">{busy ? "Submitting..." : "Continue"}</button>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
