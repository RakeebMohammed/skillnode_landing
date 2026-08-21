"use client";
import { useEffect, useMemo, useState } from "react";
import TableFilters from "@/components/admin/TableFilters";

export default function ClicksPage() {
  const [rows, setRows] = useState<any[]>([]); const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/admin/insights?kind=clicks").then(r => r.json()).then(x => setRows(x.rows || [])); }, []);
  const filtered = useMemo(() => rows.filter(row => JSON.stringify([row.label, row.href, row.placement]).toLowerCase().includes(query.toLowerCase())), [rows, query]);
  return <main><div className="admin-top"><div><div className="crumb">Analytics workspace / Link Clicks</div><h1>Header & footer link clicks</h1><p>See which navigation and footer links people choose.</p></div></div><div className="panel table-wrap"><TableFilters query={query} onQueryChange={setQuery} placeholder="Search label, destination or placement..." /><table><thead><tr><th>Label</th><th>Destination</th><th>Placement</th><th>Clicks</th><th>Visitors</th><th>Last click</th></tr></thead><tbody>{filtered.map((row, index) => <tr key={`${row.href}-${row.placement}-${index}`}><td><b>{row.label || "Unlabelled link"}</b></td><td className="truncate-cell" title={row.href}>{row.href || "—"}</td><td>{row.placement === "header" ? "Header" : "Footer"}</td><td>{row.clicks}</td><td>{row.visitors}</td><td>{new Date(row.last).toLocaleString()}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty">{rows.length ? "No clicks match this filter." : "Header and footer link clicks will appear here."}</div>}</div></main>;
}
