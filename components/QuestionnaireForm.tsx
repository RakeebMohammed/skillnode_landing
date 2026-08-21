"use client";

import { useMemo, useRef, useState } from "react";
import { FREELANCER_CATEGORIES } from "@/lib/freelancer-categories";
import FreelancerDropdown from "@/components/FreelancerDropdown";

type Experience = "starting" | "under-1" | "1-3" | "3-5" | "5-plus" | "";
type WorkMode = "remote" | "onsite" | "both" | "";
type Availability = "immediate" | "within-month" | "part-time" | "project-basis" | "";

type FormState = {
  freelancerCategory: string;
  freelancerSubcategory: string;
  services: string;
  experience: Experience;
  workMode: WorkMode;
  serviceLocation: string;
  availability: Availability;
  name: string;
  email: string;
  phone: string;
};

const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: "starting", label: "Just starting" },
  { value: "under-1", label: "Under 1 year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-plus", label: "5+ years" },
];

const WORK_MODE_OPTIONS: { value: WorkMode; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "On-site" },
  { value: "both", label: "Both" },
];

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "immediate", label: "Available immediately" },
  { value: "within-month", label: "Available within a month" },
  { value: "part-time", label: "Part-time availability" },
  { value: "project-basis", label: "Project-by-project" },
];

const CATEGORY_OPTIONS = FREELANCER_CATEGORIES.map((category) => ({
  value: category.label,
  label: category.label,
}));

const initialForm: FormState = {
  freelancerCategory: "",
  freelancerSubcategory: "",
  services: "",
  experience: "",
  workMode: "",
  serviceLocation: "",
  availability: "",
  name: "",
  email: "",
  phone: "",
};

export default function QuestionnaireForm() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedHeight, setSubmittedHeight] = useState<number | null>(null);
  const [error, setError] = useState("");

  const subcategories = useMemo(
    () => FREELANCER_CATEGORIES.find((category) => category.label === form.freelancerCategory)?.subcategories || [],
    [form.freelancerCategory],
  );
  const subcategoryOptions = useMemo(
    () => subcategories.map((subcategory) => ({ value: subcategory, label: subcategory })),
    [subcategories],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError("");
  };

  const updateCategory = (freelancerCategory: string) => {
    setForm((current) => ({ ...current, freelancerCategory, freelancerSubcategory: "" }));
    if (error) setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.freelancerCategory || !form.freelancerSubcategory) {
      setError("Select your main category and service specialisation.");
      return;
    }
    if (form.services.trim().length < 2) {
      setError("Tell us which services or skills you offer.");
      return;
    }
    if (!form.experience || !form.workMode || !form.availability) {
      setError("Select your experience, work preference, and availability.");
      return;
    }
    if (form.serviceLocation.trim().length < 2) {
      setError("Enter the city or area you serve.");
      return;
    }
    if (form.name.trim().length < 2) {
      setError("Enter your full name.");
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
          formType: "freelancer",
          ...form,
          visitorId: localStorage.getItem("skillnode_visitor_id"),
          sessionId: sessionStorage.getItem("skillnode_session_id"),
          pageUrl: window.location.href,
          referrer: document.referrer || null,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to submit your freelancer profile.");

      if (window.matchMedia("(max-width: 720px)").matches) {
        const heroCopy = cardRef.current?.previousElementSibling as HTMLElement | null;
        const heroCopyHeight = heroCopy?.getBoundingClientRect().height;
        if (heroCopyHeight) setSubmittedHeight(Math.ceil(heroCopyHeight));
      }
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your freelancer profile. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        ref={cardRef}
        className="qform-card qform-card-submitted"
        style={submittedHeight ? { minHeight: submittedHeight } : undefined}
      >
        <div className="qform-success">
          <div className="check">✓</div>
          <h3>Your freelancer profile is registered!</h3>
          <p>
            Thanks, {form.name.split(" ")[0] || "there"}. We&apos;ll contact you when suitable SkillNode opportunities become available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="qform-card freelancer-qform-card">
      <div className="qform-head">
        <span className="qform-audience">For freelancers</span>
        <h2>Tell us what you do</h2>
        <p>Join SkillNode&apos;s global and hyperlocal professional network.</p>
      </div>

      <form className="qform-body" onSubmit={handleSubmit} noValidate>
        <div className="field-row">
          <FreelancerDropdown
            id="freelancer-category"
            label="Main service category"
            note="6 available"
            placeholder="Choose your category"
            options={CATEGORY_OPTIONS}
            value={form.freelancerCategory}
            onChange={updateCategory}
          />
          <FreelancerDropdown
            id="freelancer-subcategory"
            label="Specialisation"
            note="Based on category"
            placeholder="Choose your specialisation"
            options={subcategoryOptions}
            value={form.freelancerSubcategory}
            disabled={!form.freelancerCategory}
            onChange={(value) => update("freelancerSubcategory", value)}
          />
        </div>

        <div className="field">
          <label htmlFor="freelancer-services">Services and skills you offer</label>
          <textarea
            id="freelancer-services"
            rows={2}
            maxLength={800}
            placeholder="e.g. logo design, Shopify setup, bookkeeping, event photography…"
            value={form.services}
            onChange={(event) => update("services", event.target.value)}
          />
        </div>

        <fieldset className="qform-question">
          <legend>Your experience</legend>
          <div className="qform-options qform-experience-options">
            {EXPERIENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`qform-option ${form.experience === option.value ? "selected" : ""}`}
                data-analytics-ignore="true"
                aria-pressed={form.experience === option.value}
                onClick={() => update("experience", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="qform-question">
          <legend>How do you prefer to work?</legend>
          <div className="qform-options qform-workmode-options">
            {WORK_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`qform-option ${form.workMode === option.value ? "selected" : ""}`}
                data-analytics-ignore="true"
                aria-pressed={form.workMode === option.value}
                onClick={() => update("workMode", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          <div className="field">
            <label htmlFor="service-location">City or service area</label>
            <input
              id="service-location"
              type="text"
              maxLength={160}
              placeholder="e.g. Bengaluru or Remote"
              value={form.serviceLocation}
              onChange={(event) => update("serviceLocation", event.target.value)}
            />
          </div>
          <FreelancerDropdown
            id="availability"
            label="Availability"
            note="Required"
            placeholder="Choose availability"
            options={AVAILABILITY_OPTIONS}
            value={form.availability}
            onChange={(value) => update("availability", value as Availability)}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              maxLength={100}
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
              maxLength={40}
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
            maxLength={254}
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </div>

        {error && <div className="qform-error" role="alert">{error}</div>}

        <div className="qform-actions">
          <button type="submit" className="btn btn-primary qform-next" disabled={submitting}>
            {submitting ? "Submitting…" : "Join as a freelancer"}
          </button>
        </div>
      </form>
    </div>
  );
}
