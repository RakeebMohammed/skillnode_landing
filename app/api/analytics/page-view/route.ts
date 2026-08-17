import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp } from "@/lib/request";
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
    await Event.create({ visitorId: body.visitorId, sessionId: body.sessionId, type: "page_view", page: body.page || "/", metadata: { title: body.title || "" }, createdAt: now });
    await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: now, currentPage: body.page || "/", exitPage: body.page || "/" }, $setOnInsert: { sessionId: body.sessionId, visitorId: body.visitorId, startedAt: now, landingPage: body.page || "/" }, $inc: { pageCount: 1 } }, { upsert: true });
    await Visitor.updateOne({ visitorId: body.visitorId }, { $set: { lastSeen: now } });
    void getClientIp(req).catch(() => null);
    void classifyTraffic(body.pageUrl, null);
    return NextResponse.json({ ok: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to record page view" }, { status: 500 }); }
}
