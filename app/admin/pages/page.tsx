"use client";
import { useEffect, useMemo, useState } from "react";
import TableFilters from "@/components/admin/TableFilters";

export default function PagesPage() {
  const [rows, setRows] = useState<any[]>([]); const [query, setQuery] = useState("");
  useEffect(() => { fetch("/api/admin/insights?kind=pages").then(r => r.json()).then(x => setRows(x.rows || [])); }, []);
  const filtered = useMemo(() => rows.filter(row => String(row.page || "/").toLowerCase().includes(query.toLowerCase())), [rows, query]);
  return <main><div className="admin-top"><div><div className="crumb">Analytics workspace / Page & Post Views</div><h1>Page & post views</h1><p>Find the pages that hold your audience’s attention.</p></div></div><div className="panel table-wrap"><TableFilters query={query} onQueryChange={setQuery} placeholder="Search page URL..." /><table><thead><tr><th>Page</th><th>Views</th><th>Unique visitors</th><th>Last viewed</th></tr></thead><tbody>{filtered.map(row => <tr key={row.page}><td><b>{row.page || "/"}</b></td><td>{row.views}</td><td>{row.visitors}</td><td>{new Date(row.last).toLocaleString()}</td></tr>)}</tbody></table>{!filtered.length && <div className="empty">{rows.length ? "No pages match this filter." : "Page-view data will appear as visitors browse your site."}</div>}</div></main>;
}
