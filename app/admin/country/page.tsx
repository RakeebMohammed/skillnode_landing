"use client";
import { useEffect, useMemo, useState } from "react";
import TableFilters from "@/components/admin/TableFilters";

export default function CountryPage() {
  const [rows, setRows] = useState<any[]>([]); const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/admin/insights?kind=countries").then(r => r.json()).then(x => setRows(x.rows || [])); }, []);
  const filtered = useMemo(() => rows.filter(row => JSON.stringify([row.country, ...(row.ips || [])]).toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const total = useMemo(() => filtered.reduce((sum, row) => sum + row.visitors, 0), [filtered]);
  return <main><div className="admin-top"><div><div className="crumb">Analytics workspace / Country</div><h1>Visitors by country</h1><p>Location, IP addresses and engagement by country.</p></div></div><div className="stat-grid"><div className="stat-card"><span>Countries</span><strong>{filtered.length}</strong><small>Matching locations</small></div><div className="stat-card"><span>Visitors</span><strong>{total}</strong><small>Across visible countries</small></div><div className="stat-card"><span>Top country</span><strong>{filtered[0]?.country || "—"}</strong><small>By unique visitors</small></div></div><div className="panel table-wrap"><TableFilters query={query} onQueryChange={setQuery} placeholder="Search country or IP address..." /><table><thead><tr><th>Country</th><th>Visitors</th><th>Sessions</th><th>Views</th><th>IP addresses</th><th>Last seen</th></tr></thead><tbody>{filtered.map(row => <tr key={row.country || "direct"}><td><b>{row.country || "Unavailable"}</b></td><td>{row.visitors}</td><td>{row.sessions}</td><td>{row.views}</td><td className="mono truncate-cell" title={(row.ips || []).join(", ")}>{(row.ips || []).filter(Boolean).join(", ") || "Unavailable"}</td><td>{new Date(row.last).toLocaleString()}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty">{rows.length ? "No countries match this filter." : "Country data is populated when a public IP address is available."}</div>}</div></main>;
}
