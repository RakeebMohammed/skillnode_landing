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
    if (!body.name || !body.email) return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    await connectDB();
    const ip = await getClientIp(req);
    const ua = req.headers.get("user-agent");
    const { device, browser, os } = parseUserAgent(ua);
    const geo = await lookupGeo(ip);
    let session: any = null;
    const traffic = classifyTraffic(body.pageUrl, req.headers.get("referer"));
    if (body.sessionId) session = await Session.findOne({ sessionId: body.sessionId }).lean();
    const lead = await Lead.create({
      visitorId: body.visitorId, sessionId: body.sessionId, name: body.name, email: body.email, phone: body.phone, message: body.message,
      source: session?.source || traffic.source, medium: session?.medium || traffic.medium, channel: session?.channel || traffic.channel, campaign: session?.campaign || traffic.campaign, content: session?.content || traffic.content, referrer: session?.referrer || traffic.referrer,
      ip, ...geo, device, browser, os,
    });
    if (body.sessionId) await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: new Date() }, $inc: { eventCount: 1 } });
    return NextResponse.json({ ok: true, id: String(lead._id) });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to submit lead" }, { status: 500 }); }
}
