"use client";
import { useEffect, useState } from "react";
type FilterOptions = { events: string[]; countries: string[]; devices: string[]; sources: string[]; campaigns: string[] };
const emptyOptions: FilterOptions = { events: [], countries: [], devices: [], sources: [], campaigns: [] };

export default function ActivityPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [options, setOptions] = useState<FilterOptions>(emptyOptions);
  const [filters, setFilters] = useState({ search: "", event: "", country: "", device: "", source: "", campaign: "", period: "180" });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
      fetch(`/api/admin/activity?${params}`, { cache: "no-store" }).then(response => response.json()).then(data => { setRows(data.rows || []); setSessionCount(data.sessionCount || 0); setOptions(data.filters || emptyOptions); }).finally(() => setLoading(false));
    }, filters.search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [filters]);
  const set = (name: string, value: string) => setFilters(current => ({ ...current, [name]: value }));
  const Select = ({ name, label, choices }: { name: keyof typeof filters; label: string; choices: string[] }) => <select value={filters[name]} onChange={event => set(name, event.target.value)} aria-label={label}><option value="">All {label.toLowerCase()}</option>{choices.map(choice => <option value={choice} key={choice}>{choice}</option>)}</select>;
  return <main><div className="admin-top"><div><div className="crumb">Analytics workspace / Recent Activity</div><h1>Recent activity</h1><p>Every tracked visit and interaction, searchable and filterable by its available fields.</p></div></div><section className="panel activity-panel"><div className="activity-filters"><label className="activity-search"><span>Search</span><input value={filters.search} onChange={event => set("search", event.target.value)} placeholder="Search page, campaign, source, IP, city, device..." /></label><Select name="event" label="Events" choices={options.events} /><Select name="country" label="Countries" choices={options.countries} /><Select name="device" label="Devices" choices={options.devices} /><Select name="source" label="Sources" choices={options.sources} /><Select name="campaign" label="Campaigns" choices={options.campaigns} /><select value={filters.period} onChange={event => set("period", event.target.value)} aria-label="Date range"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 3 months</option><option value="180">Last 6 months</option><option value="365">Last year</option></select></div><div className="activity-count">{loading ? "Loading activity..." : `${sessionCount} matching sessions · ${rows.length} matching events`}</div><div className="activity-table-wrap"><table className="activity-table"><thead><tr><th>Time</th><th>Event</th><th>Page / link</th><th>Source / campaign</th><th>Location</th><th>IP address</th><th>Device</th></tr></thead><tbody>{rows.map(row => <tr key={String(row._id)}><td>{new Date(row.createdAt).toLocaleString()}</td><td><span className="event-pill">{String(row.type).replaceAll("_", " ")}</span></td><td><b>{row.page || "/"}</b>{row.metadata?.label && <small>{row.metadata.label}</small>}{row.metadata?.href && <small>{row.metadata.href}</small>}</td><td><b>{row.source || "Direct"}</b>{row.campaign && <small>Campaign: {row.campaign}</small>}</td><td>{[row.city, row.country].filter(Boolean).join(", ") || "Unknown"}</td><td className="mono">{row.ip || "-"}</td><td>{[row.device, row.browser, row.os].filter(Boolean).join(" / ") || "Unknown"}</td></tr>)}{!loading && !rows.length && <tr><td colSpan={7} className="empty">No activity matches these filters.</td></tr>}</tbody></table></div></section></main>;
}
