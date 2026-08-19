import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp, parseUserAgent } from "@/lib/request";
import { geoFromHeaders, lookupGeo } from "@/lib/geo";
import { classifyTraffic } from "@/lib/traffic";
import Event from "@/models/Event";
import Session from "@/models/Session";
import Visitor from "@/models/Visitor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.visitorId || !body.sessionId) return NextResponse.json({ error: "IDs required" }, { status: 400 });
    await connectDB();
    const now = new Date();
    const ip = await getClientIp(req);
    const { device, browser, os } = parseUserAgent(req.headers.get("user-agent"));
    const edgeGeo = geoFromHeaders(req.headers);
    const geo = edgeGeo.country ? edgeGeo : await lookupGeo(ip);
    const traffic = classifyTraffic(body.pageUrl, body.referrer || req.headers.get("referer"));
    await Event.create({ visitorId: body.visitorId, sessionId: body.sessionId, type: "page_view", page: body.page || "/", metadata: { title: body.title || "" }, createdAt: now });
    await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: now, currentPage: body.page || "/", exitPage: body.page || "/", ip, ...geo, device, browser, os }, $setOnInsert: { sessionId: body.sessionId, visitorId: body.visitorId, startedAt: now, landingPage: body.page || "/", landingPageUrl: body.pageUrl || null, source: traffic.source, medium: traffic.medium, channel: traffic.channel, campaign: traffic.campaign, content: traffic.content, term: traffic.term, referrer: traffic.referrer }, $inc: { pageCount: 1 } }, { upsert: true });
    await Visitor.updateOne({ visitorId: body.visitorId }, { $set: { lastSeen: now, ip, ...geo, device, browser, os }, $setOnInsert: { visitorId: body.visitorId, firstSeen: now } }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to record page view" }, { status: 500 }); }
}
