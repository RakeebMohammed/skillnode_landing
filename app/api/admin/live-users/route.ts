import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";
import Event from "@/models/Event";

export async function GET() {
  try {
    await requireAdmin(); await connectDB();
    const since = new Date(Date.now() - 35 * 1000);
    const visitors = await Visitor.find({ lastSeen: { $gte: since } }).sort({ lastSeen: -1 }).lean();
    const sessions = await Session.find({ visitorId: { $in: visitors.map(v => v.visitorId) }, lastSeen: { $gte: since } }).lean();
    const sessionMap = new Map(sessions.map(s => [s.visitorId, s]));
    const events = await Event.find({ sessionId: { $in: sessions.map(s => s.sessionId) }, type: "page_view" }).sort({ createdAt: -1 }).limit(100).lean();
    const paths = new Map<string, string[]>();
    for (const event of events.reverse()) paths.set(event.sessionId, [...(paths.get(event.sessionId) || []), event.page || "/"]);
    return NextResponse.json({ users: visitors.map(v => { const session = sessionMap.get(v.visitorId) || null; return { ...v, session, path: session ? paths.get(session.sessionId) || [] : [] }; }) });
  } catch (error: any) { return NextResponse.json({ error: error?.message === "UNAUTHORIZED" ? "Unauthorized" : "Failed" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 500 }); }
}
