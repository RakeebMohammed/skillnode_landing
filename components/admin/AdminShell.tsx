"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const links = [
  ["/admin", "Overview"], ["/admin/activity", "Recent Activity"], ["/admin/organic-ai", "Organic & AI Traffic"], ["/admin/live-users", "Live Users"], ["/admin/pages", "Page & Post Views"], ["/admin/clicks", "Link Clicks"], ["/admin/traffic", "Traffic Sources"], ["/admin/devices", "Devices"], ["/admin/country", "Country"], ["/admin/sessions", "Sessions"], ["/admin/user-flow", "User Flow"], ["/admin/booking", "Booking Views"], ["/admin/leads", "Leads"],
];

export default function AdminShell({ children, email }: { children: ReactNode; email: string }) {
  const path = usePathname(); const router = useRouter();
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  return <div className="admin-app">
    <aside className="admin-sidebar">
      <div className="admin-logo">SKILLNODE <span>ANALYTICS</span></div>
      <nav>{links.map(([href, label]) => <Link className={path === href ? "active" : ""} href={href} key={href}>{label}</Link>)}</nav>
      <div className="sidebar-bottom"><small>{email}</small><button onClick={logout}>Sign out</button></div>
    </aside>
    <section className="admin-content">{children}</section>
  </div>;
}
