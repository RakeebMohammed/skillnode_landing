export type TrafficInfo = {
  source: string;
  medium: string;
  channel: string;
  campaign: string | null;
  content: string | null;
  term: string | null;
  referrer: string | null;
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function classifyTraffic(urlString?: string | null, referrerHeader?: string | null): TrafficInfo {
  let params = new URLSearchParams();
  try {
    if (urlString) params = new URL(urlString).searchParams;
  } catch {}

  const utmSource = normalize(params.get("utm_source"));
  const utmMedium = normalize(params.get("utm_medium"));
  const campaign = params.get("utm_campaign") || null;
  const content = params.get("utm_content") || null;
  const term = params.get("utm_term") || null;
  const referrer = referrerHeader || null;

  if (utmSource) {
    const pretty: Record<string, string> = {
      instagram: "Instagram",
      facebook: "Facebook",
      google: "Google",
      linkedin: "LinkedIn",
      youtube: "YouTube",
      twitter: "X / Twitter",
      x: "X / Twitter",
      whatsapp: "WhatsApp",
    };
    return {
      source: pretty[utmSource] ?? utmSource.charAt(0).toUpperCase() + utmSource.slice(1),
      medium: utmMedium || "referral",
      channel: /paid|cpc|ppc|ad/i.test(utmMedium) ? "Paid " + (pretty[utmSource] ?? "Campaign") : utmMedium === "social" ? "Organic Social" : "Campaign",
      campaign,
      content,
      term,
      referrer,
    };
  }

  if (!referrer) return { source: "Direct", medium: "none", channel: "Direct", campaign: null, content: null, term: null, referrer: null };

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    const matches: Array<[RegExp, string, string]> = [
      [/google\./, "Google", "organic"],
      [/instagram\.com$/, "Instagram", "social"],
      [/facebook\.com$/, "Facebook", "social"],
      [/linkedin\.com$/, "LinkedIn", "social"],
      [/youtube\.com$/, "YouTube", "social"],
      [/tiktok\.com$/, "TikTok", "social"],
      [/twitter\.com$|x\.com$/, "X / Twitter", "social"],
      [/whatsapp\.com$/, "WhatsApp", "social"],
    ];
    for (const [pattern, source, medium] of matches) {
      if (pattern.test(host)) return { source, medium, channel: medium === "social" ? "Organic Social" : "Organic Search", campaign: null, content: null, term: null, referrer };
    }
    return { source: host, medium: "referral", channel: "Referral", campaign: null, content: null, term: null, referrer };
  } catch {
    return { source: "Referral", medium: "referral", channel: "Referral", campaign: null, content: null, term: null, referrer };
  }
}
