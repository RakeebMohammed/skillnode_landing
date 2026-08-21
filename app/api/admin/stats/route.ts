import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";
import Event from "@/models/Event";
import Lead from "@/models/Lead";

export async function GET() {
  try {
    await requireAdmin(); await connectDB();
    const since = new Date(Date.now() - 30 * 86400000);
    const liveSince = new Date(Date.now() - 35 * 1000);
    const [visitors, sessions, pageViews, leads, liveUsers, sourceRows, channelRows, campaignRows, deviceRows, countryRows, recentEvents, recentSessions, dailyRows] = await Promise.all([
      Visitor.countDocuments({ lastSeen: { $gte: since } }),
      Session.countDocuments({ startedAt: { $gte: since } }),
      Event.countDocuments({ type: "page_view", createdAt: { $gte: since } }),
      Lead.countDocuments({ createdAt: { $gte: since }, $or: [{ formType: "freelancer" }, { freelancerCategory: { $exists: true, $nin: [null, ""] } }] }),
      Visitor.countDocuments({ lastSeen: { $gte: liveSince } }),
      Session.aggregate([{ $match: { startedAt: { $gte: since } } }, { $group: { _id: "$source", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Session.aggregate([{ $match: { startedAt: { $gte: since } } }, { $group: { _id: "$channel", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Session.aggregate([{ $match: { startedAt: { $gte: since }, campaign: { $nin: [null, ""] } } }, { $group: { _id: { source: "$source", campaign: "$campaign" }, count: { $sum: 1 }, leads: { $sum: 0 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
      Session.aggregate([{ $match: { startedAt: { $gte: since } } }, { $group: { _id: "$device", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Session.aggregate([{ $match: { startedAt: { $gte: since } } }, { $group: { _id: "$country", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Event.find({ createdAt: { $gte: new Date(Date.now() - 24 * 3600000) } }).sort({ createdAt: -1 }).limit(12).lean(),
      Session.find({ startedAt: { $gte: since } }).sort({ startedAt: -1 }).limit(8).select("visitorId landingPage source medium channel campaign ip country city device browser os startedAt pageCount duration").lean(),
      Event.aggregate([{ $match: { type: "page_view", createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ]);
    return NextResponse.json({ cards: { visitors, sessions, pageViews, leads, liveUsers, conversionRate: sessions ? Number(((leads / sessions) * 100).toFixed(1)) : 0 }, sources: sourceRows.map(x => ({ name: x._id || "Unknown", value: x.count })), channels: channelRows.map(x => ({ name: x._id || "Unclassified", value: x.count })), campaigns: campaignRows.map(x => ({ name: `${x._id.source} · ${x._id.campaign}`, value: x.count })), devices: deviceRows.map(x => ({ name: x._id || "Unknown", value: x.count })), countries: countryRows.map(x => ({ name: x._id || "Unknown", value: x.count })), daily: dailyRows.map(x => ({ date: x._id, value: x.count })), recentEvents, recentSessions });
  } catch (error: any) { console.error(error); return NextResponse.json({ error: error?.message === "UNAUTHORIZED" ? "Unauthorized" : "Stats failed" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 500 }); }
}
