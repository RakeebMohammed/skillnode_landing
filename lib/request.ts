import { headers } from "next/headers";

export async function getClientIp(request?: Request) {
  const h = request?.headers ?? await headers();
  // Different hosts expose the original visitor IP through different headers.
  const forwarded = h.get("x-forwarded-for") || h.get("x-vercel-forwarded-for");
  const candidate = h.get("cf-connecting-ip") || h.get("true-client-ip") || forwarded?.split(",")[0] || h.get("x-real-ip") || "unknown";
  return candidate.trim().replace(/^::ffff:/, "");
}

export function parseUserAgent(userAgent: string | null) {
  const ua = userAgent || "";
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  const device = /iPad|Tablet/i.test(ua) ? "Tablet" : /Mobile|Android|iPhone|iPod/i.test(ua) ? "Mobile" : "Desktop";
  return { browser, os, device };
}
