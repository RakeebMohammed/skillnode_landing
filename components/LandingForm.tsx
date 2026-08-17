"use client";

import { FormEvent, useState } from "react";

export default function LandingForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setStatus("");
    const form = new FormData(event.currentTarget);
    const visitorId = localStorage.getItem("skillnode_visitor_id");
    const sessionId = sessionStorage.getItem("skillnode_session_id");
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        name: form.get("name"), email: form.get("email"), phone: form.get("phone"), message: form.get("message"), visitorId, sessionId, pageUrl: window.location.href
      }) });
      if (!response.ok) throw new Error();
      event.currentTarget.reset();
      setStatus("Thanks! Your request has been submitted.");
    } catch { setStatus("Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  return <form id="form" className="lead-form" onSubmit={submit}>
    <div><label>Name</label><input name="name" required placeholder="Your name" /></div>
    <div><label>Email</label><input name="email" type="email" required placeholder="you@example.com" /></div>
    <div><label>Phone</label><input name="phone" placeholder="Your phone number" /></div>
    <div className="full"><label>Message</label><textarea name="message" rows={5} placeholder="Tell us what you need..." /></div>
    <button disabled={busy} type="submit">{busy ? "Submitting..." : "Submit Request"}</button>
    {status && <p className="form-status">{status}</p>}
  </form>;
}
