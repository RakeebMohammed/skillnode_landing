import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";
import Visitor from "@/models/Visitor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.visitorId || !body.sessionId || !body.type) return NextResponse.json({ error: "visitorId, sessionId and type are required" }, { status: 400 });
    await connectDB();
    const now = new Date();
    await Event.create({ visitorId: body.visitorId, sessionId: body.sessionId, type: body.type, page: body.page || "/", element: body.element, metadata: body.metadata, createdAt: now });
    await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: now, exitPage: body.page || "/" }, $inc: { eventCount: 1 } });
    await Visitor.updateOne({ visitorId: body.visitorId }, { $set: { lastSeen: now } });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to record event" }, { status: 500 }); }
}
