"use client";
import { useEffect, useMemo, useState } from "react";
import TableFilters from "@/components/admin/TableFilters";

export default function BookingPage() {
  const [rows, setRows] = useState<any[]>([]); const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/admin/insights?kind=booking").then(r => r.json()).then(x => setRows(x.rows || [])); }, []);
  const filtered = useMemo(() => rows.filter(row => JSON.stringify([row.label, row.page]).toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const total = filtered.reduce((sum, row) => sum + row.clicks, 0);
  return <main><div className="admin-top"><div><div className="crumb">Analytics workspace / Booking Views</div><h1>Booking intent</h1><p>Measure clicks on booking, appointment and consultation calls to action.</p></div></div><div className="stat-grid"><div className="stat-card"><span>Booking CTA clicks</span><strong>{total}</strong><small>Visible recorded intent</small></div><div className="stat-card"><span>Unique visitors</span><strong>{filtered.reduce((sum, row) => sum + row.visitors, 0)}</strong><small>Across visible CTA variants</small></div></div><div className="panel table-wrap"><TableFilters query={query} onQueryChange={setQuery} placeholder="Search booking CTA or page..." /><table><thead><tr><th>Booking CTA</th><th>Page</th><th>Clicks</th><th>Visitors</th><th>Last click</th></tr></thead><tbody>{filtered.map((row, index) => <tr key={`${row.label}-${index}`}><td><b>{row.label || "Booking CTA"}</b></td><td>{row.page || "/"}</td><td>{row.clicks}</td><td>{row.visitors}</td><td>{new Date(row.last).toLocaleString()}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty">{rows.length ? "No booking interactions match this filter." : "Use a link or button labelled “Book”, “Booking”, “Appointment” or “Consultation” to track booking intent."}</div>}</div></main>;
}
