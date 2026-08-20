"use client";

import { useState } from "react";

type Intent = "hire" | "work" | "explore" | "";
type Budget = "under-10k" | "10k-50k" | "50k-2l" | "2l-plus" | "";

interface FormState {
  intent: Intent;
  category: string;
  budget: Budget;
  name: string;
  email: string;
  phone: string;
  message: string;
}

const INTENT_OPTIONS: { value: Intent; label: string; emoji: string }[] = [
  { value: "hire", label: "Hire talent", emoji: "🧑‍💻" },
  { value: "work", label: "Find work", emoji: "💼" },
  { value: "explore", label: "Just exploring", emoji: "🔍" },
];

const BUDGET_OPTIONS: { value: Budget; label: string }[] = [
  { value: "under-10k", label: "Under ₹10,000" },
  { value: "10k-50k", label: "₹10,000 – ₹50,000" },
  { value: "50k-2l", label: "₹50,000 – ₹2,00,000" },
  { value: "2l-plus", label: "₹2,00,000+" },
];

export default function QuestionnaireForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    intent: "",
    category: "",
    budget: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.intent) {
      setError("Pick one option to continue.");
      return;
    }
    if (!form.category.trim()) {
      setError("Tell us what you're looking for.");
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          visitorId: localStorage.getItem("skillnode_visitor_id"),
          sessionId: sessionStorage.getItem("skillnode_session_id"),
          pageUrl: window.location.href,
          referrer: document.referrer || null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Unable to submit your questionnaire.");
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your questionnaire. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="qform-card">
        <div className="qform-success">
          <div className="check">✓</div>
          <h3>You&apos;re on the list!</h3>
          <p>
            Thanks, {form.name.split(" ")[0] || "there"}. Our team will reach
            out within one business day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="qform-card">
      <div className="qform-head">
        <h2>Tell us what you need</h2>
        <p>Two minutes. No spam. We&apos;ll match you with the right people.</p>
      </div>

      <form className="qform-body" onSubmit={handleSubmit} noValidate>
        <fieldset className="qform-question">
          <legend>What brings you to SkillNode?</legend>
          <div className="qform-options qform-intent-options">
            {INTENT_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`qform-option ${form.intent === option.value ? "selected" : ""}`}
                data-analytics-ignore="true"
                aria-pressed={form.intent === option.value}
                onClick={() => update("intent", option.value)}
              >
                <span className="emoji" aria-hidden="true">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="category">
            {form.intent === "work"
              ? "What kind of work are you looking for?"
              : "What do you need done?"}
          </label>
          <input
            id="category"
            type="text"
            placeholder="e.g. Website design, home tutoring, plumbing…"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
          />
        </div>

        <fieldset className="qform-question">
          <legend>Budget range</legend>
          <div className="qform-options">
            {BUDGET_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`qform-option ${form.budget === option.value ? "selected" : ""}`}
                data-analytics-ignore="true"
                aria-pressed={form.budget === option.value}
                onClick={() => update("budget", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="message">Anything else? (optional)</label>
          <textarea
            id="message"
            placeholder="Share timelines, links, or extra context…"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
          />
        </div>

        {error && <div className="qform-error" role="alert">{error}</div>}

        <div className="qform-actions">
          <button
            type="submit"
            className="btn btn-primary qform-next"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Get matched"}
          </button>
        </div>
      </form>
    </div>
  );
}
