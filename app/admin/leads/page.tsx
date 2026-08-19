"use client";

import { useEffect, useMemo, useState } from "react";
import TableFilters from "@/components/admin/TableFilters";

export default function LeadsPage() {
  const [rows, setRows] = useState<any[]>([]); const [query, setQuery] = useState(""); const [source, setSource] = useState("");
  useEffect(() => { fetch("/api/admin/leads", { cache: "no-store" }).then(r => r.json()).then(x => setRows(x.leads || [])); }, []);
  const sources = useMemo(() => [...new Set(rows.map(row => row.source || "Direct"))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter(row => (!source || (row.source || "Direct") === source) && JSON.stringify([row.name, row.email, row.phone, row.campaign, row.city, row.country]).toLowerCase().includes(query.toLowerCase())), [rows, query, source]);

  function exportCsv() {
    const headers = ["Name", "Email", "Phone", "Source", "Medium", "Channel", "Campaign", "Referrer", "City", "Country", "IP", "Created"];
    const lines = [headers, ...filtered.map(r => [r.name, r.email, r.phone || "", r.source || "Direct", r.medium || "none", r.channel || "Direct", r.campaign || "", r.referrer || "", r.city || "", r.country || "", r.ip || "", new Date(r.createdAt).toISOString()])].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" }); const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = "skillnode-leads.csv"; link.click(); URL.revokeObjectURL(link.href);
  }

  return <div><div className="admin-top"><div><div className="crumb">Home / Analytics / Leads</div><h1>Leads</h1><p>Every submission from your landing page.</p></div><button className="primary-btn" onClick={exportCsv}>Export CSV</button></div><div className="panel table-wrap"><TableFilters query={query} onQueryChange={setQuery} placeholder="Search name, email, campaign or location..."><select value={source} onChange={event => setSource(event.target.value)} aria-label="Filter by source"><option value="">All sources</option>{sources.map(item => <option key={item}>{item}</option>)}</select></TableFilters><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Source</th><th>Campaign</th><th>Location</th><th>Device</th><th>Created</th></tr></thead><tbody>{filtered.map(r => <tr key={r._id}><td><b>{r.name}</b></td><td>{r.email}</td><td>{r.phone || "—"}</td><td><b>{r.source || "Direct"}</b><br /><small>{r.channel || "Direct"} · {r.medium || "none"}</small></td><td>{r.campaign || "—"}</td><td>{r.city || "—"}, {r.country || "—"}</td><td>{r.device || "—"}</td><td>{new Date(r.createdAt).toLocaleString()}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty">No leads match these filters.</div>}</div></div>;
}
