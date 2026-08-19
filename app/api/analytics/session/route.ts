import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp, parseUserAgent } from "@/lib/request";
import { lookupGeo } from "@/lib/geo";
import { classifyTraffic } from "@/lib/traffic";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.visitorId || !body.sessionId) return NextResponse.json({ error: "visitorId and sessionId are required" }, { status: 400 });
    await connectDB();
    const ip = await getClientIp(req);
    const ua = req.headers.get("user-agent");
    const { device, browser, os } = parseUserAgent(ua);
    const geo = await lookupGeo(ip);
    const traffic = classifyTraffic(body.pageUrl, body.referrer || req.headers.get("referer"));
    const now = new Date();
    await Visitor.updateOne({ visitorId: body.visitorId }, { $set: { ip, ...geo, device, browser, os, lastSeen: now }, $setOnInsert: { visitorId: body.visitorId, firstSeen: now, firstSource: traffic.source, firstMedium: traffic.medium, firstChannel: traffic.channel, firstCampaign: traffic.campaign, firstLandingPage: body.page || "/", firstReferrer: traffic.referrer } }, { upsert: true });
    const attribution = traffic.campaign || new URL(body.pageUrl || "http://localhost").searchParams.has("utm_source") || new URL(body.pageUrl || "http://localhost").searchParams.has("utm_medium")
      ? { source: traffic.source, medium: traffic.medium, channel: traffic.channel, campaign: traffic.campaign, content: traffic.content, term: traffic.term, referrer: traffic.referrer }
      : {};
    await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: now, currentPage: body.page || "/", ip, ...geo, device, browser, os, ...attribution }, $setOnInsert: { sessionId: body.sessionId, visitorId: body.visitorId, startedAt: now, landingPage: body.page || "/", landingPageUrl: body.pageUrl || null, source: traffic.source, medium: traffic.medium, channel: traffic.channel, campaign: traffic.campaign, content: traffic.content, term: traffic.term, referrer: traffic.referrer, pageCount: 0, eventCount: 0 } }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to create session" }, { status: 500 }); }
}
