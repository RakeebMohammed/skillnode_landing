import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp, parseUserAgent } from "@/lib/request";
import { lookupGeo } from "@/lib/geo";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.visitorId || !body.sessionId) return NextResponse.json({ error: "IDs required" }, { status: 400 });
    await connectDB();
    const now = new Date();
    const ip = await getClientIp(req);
    const ua = req.headers.get("user-agent");
    const { device, browser, os } = parseUserAgent(ua);
    const existing = await Visitor.findOne({ visitorId: body.visitorId }).select("country").lean() as { country?: string | null } | null;
    const geo = existing?.country ? {} : await lookupGeo(ip);
    await Visitor.updateOne({ visitorId: body.visitorId }, { $set: { ip, ...geo, device, browser, os, lastSeen: now }, $setOnInsert: { visitorId: body.visitorId, firstSeen: now } }, { upsert: true });
    const session = await Session.findOne({ sessionId: body.sessionId }).select("startedAt").lean() as { startedAt?: Date | string | null } | null;
    const duration = session?.startedAt ? Math.max(0, Math.floor((now.getTime() - new Date(session.startedAt).getTime()) / 1000)) : 0;
    await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: now, currentPage: body.page || "/", exitPage: body.page || "/", duration } });
    return NextResponse.json({ ok: true, serverTime: now.toISOString() });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Heartbeat failed" }, { status: 500 }); }
}
