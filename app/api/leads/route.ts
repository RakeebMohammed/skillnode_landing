import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp, parseUserAgent } from "@/lib/request";
import { lookupGeo } from "@/lib/geo";
import { classifyTraffic } from "@/lib/traffic";
import Lead from "@/models/Lead";
import Session from "@/models/Session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const fields: Record<string, string> = {};
    if (name.length < 2 || name.length > 100) fields.name = "Please enter a valid name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fields.email = "Please enter a valid email address.";
    if (!/^[+()\-\s.\d]{7,25}$/.test(phone) || phone.replace(/\D/g, "").length < 7) fields.phone = "Please enter a valid phone number.";
    if (message.length < 10 || message.length > 2000) fields.message = "Please enter a message between 10 and 2,000 characters.";
    if (Object.keys(fields).length) return NextResponse.json({ error: "Please correct the highlighted fields.", fields }, { status: 400 });

    await connectDB();
    const ip = await getClientIp(req);
    const ua = req.headers.get("user-agent");
    const { device, browser, os } = parseUserAgent(ua);
    const geo = await lookupGeo(ip);
    let session: any = null;
    // document.referrer retains the external platform; the request Referer is normally this landing page.
    const traffic = classifyTraffic(body.pageUrl, body.referrer || req.headers.get("referer"));
    if (body.sessionId) session = await Session.findOne({ sessionId: body.sessionId }).lean();
    const lead = await Lead.create({
      visitorId: body.visitorId, sessionId: body.sessionId, name, email, phone, message,
      source: session?.source || traffic.source, medium: session?.medium || traffic.medium, channel: session?.channel || traffic.channel, campaign: session?.campaign || traffic.campaign, content: session?.content || traffic.content, referrer: session?.referrer || traffic.referrer,
      ip, ...geo, device, browser, os,
    });
    if (body.sessionId) await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: new Date() }, $inc: { eventCount: 1 } });
    return NextResponse.json({ ok: true, id: String(lead._id) });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to submit lead" }, { status: 500 }); }
}
