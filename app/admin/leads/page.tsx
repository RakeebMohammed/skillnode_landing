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
  intent?: string;
  category?: string;
  budget?: string;
  message?: string;
  profileType?: string;
  interest?: string;
  timeline?: string;
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

const INTENT_LABELS: Record<string, string> = {
  hire: "Hire talent",
  work: "Find work",
  explore: "Just exploring",
};

const BUDGET_LABELS: Record<string, string> = {
  "under-10k": "Under \u20b910,000",
  "10k-50k": "\u20b910,000 \u2013 \u20b950,000",
  "50k-2l": "\u20b950,000 \u2013 \u20b92,00,000",
  "2l-plus": "\u20b92,00,000+",
};

function intentAnswer(lead: LeadRow) {
  return (lead.intent && INTENT_LABELS[lead.intent]) || lead.profileType || EMPTY;
}

function requirementAnswer(lead: LeadRow) {
  return lead.category || lead.interest || EMPTY;
}

function budgetAnswer(lead: LeadRow) {
  return (lead.budget && BUDGET_LABELS[lead.budget]) || lead.timeline || "Not provided";
}

function exportValue(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function LeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
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

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (source && (row.source || "Direct") !== source) return false;
      if (!normalizedQuery) return true;

      return [
        row.name,
        row.email,
        row.phone,
        intentAnswer(row),
        requirementAnswer(row),
        budgetAnswer(row),
        row.message,
        row.source,
        row.medium,
        row.channel,
        row.campaign,
        row.content,
        row.referrer,
        row.city,
        row.region,
        row.country,
        row.ip,
        row.device,
        row.browser,
        row.os,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [rows, query, source]);

  function exportCsv() {
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Intent",
      "Requirement",
      "Budget",
      "Message",
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
      intentAnswer(row),
      requirementAnswer(row),
      budgetAnswer(row),
      row.message || "",
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
          <h1>Questionnaire responses</h1>
          <p>Every submitted answer with its contact and campaign attribution.</p>
        </div>
        <button className="primary-btn" onClick={exportCsv} disabled={!filtered.length}>
          Export CSV
        </button>
      </div>

      <div className="panel table-wrap leads-table-wrap">
        <TableFilters
          query={query}
          onQueryChange={setQuery}
          placeholder="Search contacts, answers, messages or attribution..."
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
        </TableFilters>

        <p className="leads-export-note">
          Compact view shown below. Additional details, location, IP, device, and complete attribution are included in Export CSV.
        </p>

        <table className="leads-table">
          <thead>
            <tr>
              <th className="lead-col-contact">Contact</th>
              <th className="lead-col-intent">Intent</th>
              <th className="lead-col-requirement">Requirement</th>
              <th className="lead-col-budget">Budget / timeline</th>
              <th className="lead-col-attribution">Attribution</th>
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
                <td className="lead-col-intent" data-label="Intent">{intentAnswer(row)}</td>
                <td className="lead-col-requirement" data-label="Requirement">{requirementAnswer(row)}</td>
                <td className="lead-col-budget" data-label="Budget / timeline">{budgetAnswer(row)}</td>
                <td className="lead-col-attribution" data-label="Attribution">
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
