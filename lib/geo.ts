export type Geo = { country: string | null; region: string | null; city: string | null; latitude: number | null; longitude: number | null };

const fallback: Geo = { country: null, region: null, city: null, latitude: null, longitude: null };

function numberOrNull(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Vercel provides these headers at the edge, without requiring a third-party geo lookup. */
export function geoFromHeaders(headers: Headers): Geo {
  const countryCode = headers.get("x-vercel-ip-country");
  if (!countryCode) return fallback;
  let country = countryCode;
  try { country = new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || countryCode; } catch {}
  const cityValue = headers.get("x-vercel-ip-city");
  let city: string | null = cityValue;
  try { if (cityValue) city = decodeURIComponent(cityValue); } catch {}
  return {
    country,
    region: headers.get("x-vercel-ip-country-region"),
    city,
    latitude: numberOrNull(headers.get("x-vercel-ip-latitude")),
    longitude: numberOrNull(headers.get("x-vercel-ip-longitude")),
  };
}

export async function lookupGeo(ip: string): Promise<Geo> {
  if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.")) return fallback;
  const base = process.env.GEOIP_API_URL || "https://ipapi.co";
  const fetchGeo = async (url: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try { return await fetch(url, { cache: "no-store", signal: controller.signal }); } finally { clearTimeout(timeout); }
  };
  try {
    let response = await fetchGeo(`${base.replace(/\/$/, "")}/${encodeURIComponent(ip)}/json/`);
    if (!response.ok && base.includes("ipapi.co")) response = await fetchGeo(`https://ipwho.is/${encodeURIComponent(ip)}`);
    if (!response.ok) return fallback;
    const data = await response.json();
    if (data.success === false) return fallback;
    return {
      country: data.country_name || data.country || data.countryName || null,
      region: data.region || data.regionName || null,
      city: data.city || null,
      latitude: typeof data.latitude === "number" ? data.latitude : Number.isFinite(Number(data.lat)) ? Number(data.lat) : null,
      longitude: typeof data.longitude === "number" ? data.longitude : Number.isFinite(Number(data.lon)) ? Number(data.lon) : null,
    };
  } catch {
    // ipapi.co may rate-limit anonymous requests; keep analytics working with a fallback.
    try {
      const response = await fetchGeo(`https://ipwho.is/${encodeURIComponent(ip)}`);
      if (!response.ok) return fallback;
      const data = await response.json();
      if (data.success === false) return fallback;
      return { country: data.country || null, region: data.region || null, city: data.city || null, latitude: Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : null, longitude: Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : null };
    } catch { return fallback; }
  }
}
