import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Session from "@/models/Session";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(); await connectDB();
    const kind = request.nextUrl.searchParams.get("kind");
    if (kind === "pages") {
      const rows = await Event.aggregate([{ $match: { type: "page_view" } }, { $group: { _id: "$page", views: { $sum: 1 }, visitors: { $addToSet: "$visitorId" }, last: { $max: "$createdAt" } } }, { $project: { page: "$_id", views: 1, visitors: { $size: "$visitors" }, last: 1 } }, { $sort: { views: -1 } }, { $limit: 100 }]);
      return NextResponse.json({ rows });
    }
    if (kind === "clicks") {
      const rows = await Event.aggregate([{ $match: { type: "click" } }, { $group: { _id: { label: "$metadata.label", href: "$metadata.href", element: "$element" }, clicks: { $sum: 1 }, visitors: { $addToSet: "$visitorId" }, last: { $max: "$createdAt" } } }, { $project: { label: "$_id.label", href: "$_id.href", element: "$_id.element", clicks: 1, visitors: { $size: "$visitors" }, last: 1 } }, { $sort: { clicks: -1 } }, { $limit: 100 }]);
      return NextResponse.json({ rows });
    }
    if (kind === "countries") {
      const rows = await Session.aggregate([{ $group: { _id: "$country", visitors: { $addToSet: "$visitorId" }, sessions: { $sum: 1 }, views: { $sum: "$pageCount" }, last: { $max: "$lastSeen" }, ips: { $addToSet: "$ip" } } }, { $project: { country: "$_id", visitors: { $size: "$visitors" }, sessions: 1, views: 1, last: 1, ips: 1 } }, { $sort: { visitors: -1 } }, { $limit: 100 }]);
      return NextResponse.json({ rows });
    }
    if (kind === "organic-ai") {
      const rows = await Session.aggregate([{ $match: { channel: { $in: ["Organic Search", "Referral"] } } }, { $group: { _id: { source: "$source", channel: "$channel" }, sessions: { $sum: 1 }, visitors: { $addToSet: "$visitorId" }, views: { $sum: "$pageCount" } } }, { $project: { source: "$_id.source", channel: "$_id.channel", sessions: 1, views: 1, visitors: { $size: "$visitors" } } }, { $sort: { sessions: -1 } }]);
      return NextResponse.json({ rows });
    }
    if (kind === "booking") {
      const rows = await Event.aggregate([{ $match: { type: "click", $or: [{ "metadata.label": /book|booking|appointment|consult/i }, { "metadata.href": /book|booking|appointment|consult/i }] } }, { $group: { _id: { label: "$metadata.label", page: "$page" }, clicks: { $sum: 1 }, visitors: { $addToSet: "$visitorId" }, last: { $max: "$createdAt" } } }, { $project: { label: "$_id.label", page: "$_id.page", clicks: 1, visitors: { $size: "$visitors" }, last: 1 } }, { $sort: { clicks: -1 } }]);
      return NextResponse.json({ rows });
    }
    const sessions = await Session.find().sort({ lastSeen: -1 }).limit(50).lean();
    const events = await Event.find({ sessionId: { $in: sessions.map(s => s.sessionId) } }).sort({ createdAt: 1 }).lean();
    const bySession = new Map<string, typeof events>();
    for (const event of events) bySession.set(event.sessionId, [...(bySession.get(event.sessionId) || []), event]);
    return NextResponse.json({ rows: sessions.map(session => ({ ...session, events: bySession.get(session.sessionId) || [] })) });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message === "UNAUTHORIZED" ? "Unauthorized" : "Insights failed" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
