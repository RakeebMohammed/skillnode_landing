"use client";

import { useEffect, useMemo, useState } from "react";
import TableFilters from "@/components/admin/TableFilters";

type LeadRow = {
  _id: string;
  visitorId?: string;
  sessionId?: string;
  name: string;
  email: string;
  phone?: string;
  freelancerCategory?: string;
  freelancerSubcategory?: string;
  services?: string;
  experience?: string;
  workMode?: string;
  serviceLocation?: string;
  availability?: string;
  source?: string;
  medium?: string;
  channel?: string;
  campaign?: string;
  content?: string;
  referrer?: string;
  city?: string;
  region?: string;
  country?: string;
  ip?: string;
  device?: string;
  browser?: string;
  os?: string;
  createdAt: string;
};

const EMPTY = "\u2014";

const EXPERIENCE_LABELS: Record<string, string> = {
  starting: "Just starting",
  "under-1": "Under 1 year",
  "1-3": "1–3 years",
  "3-5": "3–5 years",
  "5-plus": "5+ years",
};

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  both: "Remote & on-site",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  immediate: "Available immediately",
  "within-month": "Available within a month",
  "part-time": "Part-time availability",
  "project-basis": "Project-by-project",
};

function RequirementDetails({ lead }: { lead: LeadRow }) {
  return (
    <div className="lead-answer-stack">
      <b>{lead.freelancerCategory || EMPTY}</b>
      {lead.freelancerSubcategory && <small>{lead.freelancerSubcategory}</small>}
      {lead.services && <span>{lead.services}</span>}
    </div>
  );
}

function WorkDetails({ lead }: { lead: LeadRow }) {
  return (
    <div className="lead-answer-stack">
      <b>{(lead.experience && EXPERIENCE_LABELS[lead.experience]) || "Experience not provided"}</b>
      <small>
        {[
          lead.workMode && WORK_MODE_LABELS[lead.workMode],
          lead.availability && AVAILABILITY_LABELS[lead.availability],
        ].filter(Boolean).join(" · ") || "Work preference not provided"}
      </small>
      {lead.serviceLocation && <span>{lead.serviceLocation}</span>}
    </div>
  );
}

function exportValue(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function LeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [campaign, setCampaign] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/leads", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (active) setRows(data.leads || []);
      })
      .catch(() => {
        if (active) setRows([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const sources = useMemo(
    () => [...new Set(rows.map((row) => row.source || "Direct"))].sort(),
    [rows],
  );

  const campaigns = useMemo(
    () => [...new Set(rows.map((row) => row.campaign).filter((item): item is string => Boolean(item)))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (source && (row.source || "Direct") !== source) return false;
      if (campaign && row.campaign !== campaign) return false;
      if (!normalizedQuery) return true;

      return [
        row.name,
        row.email,
        row.phone,
        row.freelancerCategory,
        row.freelancerSubcategory,
        row.services,
        row.experience,
        row.workMode,
        row.serviceLocation,
        row.availability,
        row.experience && EXPERIENCE_LABELS[row.experience],
        row.workMode && WORK_MODE_LABELS[row.workMode],
        row.availability && AVAILABILITY_LABELS[row.availability],
        row.source,
        row.campaign,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [rows, query, source, campaign]);

  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Freelancer category",
      "Freelancer specialisation",
      "Freelancer services",
      "Experience",
      "Work mode",
      "Service location",
      "Availability",
      "Source",
      "Medium",
      "Channel",
      "Campaign",
      "Content",
      "Referrer",
      "City",
      "Region",
      "Country",
      "IP",
      "Device",
      "Browser",
      "OS",
      "Visitor ID",
      "Session ID",
      "Submitted",
    ];
    const data = filtered.map((row) => [
      row.name,
      row.email,
      row.phone || "",
      row.freelancerCategory || "",
      row.freelancerSubcategory || "",
      row.services || "",
      (row.experience && EXPERIENCE_LABELS[row.experience]) || "",
      (row.workMode && WORK_MODE_LABELS[row.workMode]) || "",
      row.serviceLocation || "",
      (row.availability && AVAILABILITY_LABELS[row.availability]) || "",
      row.source || "Direct",
      row.medium || "none",
      row.channel || "Direct",
      row.campaign || "",
      row.content || "",
      row.referrer || "",
      row.city || "",
      row.region || "",
      row.country || "",
      row.ip || "",
      row.device || "",
      row.browser || "",
      row.os || "",
      row.visitorId || "",
      row.sessionId || "",
      new Date(row.createdAt).toISOString(),
    ]);
    const csv = [headers, ...data]
      .map((csvRow) => csvRow.map(exportValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "skillnode-questionnaire-responses.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main>
      <div className="admin-top">
        <div>
          <div className="crumb">Home / Analytics / Leads</div>
          <h1>Freelancer leads</h1>
          <p>Every response submitted through the current freelancer questionnaire.</p>
        </div>
        <button className="primary-btn" onClick={exportCsv} disabled={!filtered.length}>
          Export CSV
        </button>
      </div>

      <div className="panel table-wrap leads-table-wrap">
        <TableFilters
          query={query}
          onQueryChange={setQuery}
          placeholder="Search name, email, phone, skills, location or campaign..."
        >
          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            aria-label="Filter by source"
          >
            <option value="">All sources</option>
            {sources.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={campaign}
            onChange={(event) => setCampaign(event.target.value)}
            aria-label="Filter by campaign"
          >
            <option value="">All campaigns</option>
            {campaigns.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </TableFilters>

        <p className="leads-export-note">
          Questionnaire details are shown below. IP, device, visitor IDs, location metadata, and complete attribution are included in Export CSV.
        </p>

        <table className="leads-table">
          <thead>
            <tr>
              <th className="lead-col-contact">Contact</th>
              <th className="lead-col-requirement">Category / services</th>
              <th className="lead-col-budget">Work details</th>
              <th className="lead-col-attribution">Campaign / source</th>
              <th className="lead-col-submitted">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row._id}>
                <td className="lead-col-contact" data-label="Contact">
                  <b>{row.name}</b>
                  <br />
                  <a href={`mailto:${row.email}`}>{row.email}</a>
                  <br />
                  <small>{row.phone || "No phone provided"}</small>
                </td>
                <td className="lead-col-requirement" data-label="Category / services"><RequirementDetails lead={row} /></td>
                <td className="lead-col-budget" data-label="Work details"><WorkDetails lead={row} /></td>
                <td className="lead-col-attribution" data-label="Campaign / source">
                  <b>{row.source || "Direct"}</b>
                  <br />
                  <small>{row.channel || "Direct"} / {row.medium || "none"}</small>
                  {row.campaign && <><br /><small>Campaign: {row.campaign}</small></>}
                </td>
                <td className="lead-col-submitted" data-label="Submitted">{new Date(row.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filtered.length && (
          <div className="empty">
            {loading ? "Loading questionnaire responses..." : "No responses match these filters."}
          </div>
        )}
      </div>
    </main>
  );
}
