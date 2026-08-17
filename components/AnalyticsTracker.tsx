"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getId(key: string) {
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

function getSessionId() {
  const key = "skillnode_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  sessionStorage.setItem(key, value);
  return value;
}

async function send(url: string, body: unknown, keepalive = false) {
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive });
  } catch {}
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const visitorId = getId("skillnode_visitor_id");
    const sessionId = getSessionId();
    const page = pathname || window.location.pathname;
    const pageUrl = window.location.href;

    send("/api/analytics/session", { visitorId, sessionId, page, pageUrl, referrer: document.referrer || null });
    send("/api/analytics/page-view", { visitorId, sessionId, page, pageUrl, title: document.title });

    const heartbeat = () => send("/api/analytics/heartbeat", { visitorId, sessionId, page, pageUrl });
    heartbeat();
    const timer = window.setInterval(heartbeat, 15000);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const element = target?.closest("a,button") as HTMLElement | null;
      if (!element) return;
      const label = (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 100);
      send("/api/analytics/event", { visitorId, sessionId, type: "click", page, element: element.tagName.toLowerCase(), metadata: { label, href: (element as HTMLAnchorElement).href || null } });
    };

    window.addEventListener("click", onClick, { passive: true });
    const onHide = () => send("/api/analytics/event", { visitorId, sessionId, type: "page_leave", page }, true);
    window.addEventListener("pagehide", onHide);

    return () => {
      clearInterval(timer);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pagehide", onHide);
    };
  }, [pathname]);

  return null;
}
