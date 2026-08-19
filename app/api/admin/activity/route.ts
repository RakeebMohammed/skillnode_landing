import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

const value = (params: URLSearchParams, name: string) => params.get(name)?.trim() || "";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(); await connectDB();
    const { searchParams } = request.nextUrl;
    const search = value(searchParams, "search"), event = value(searchParams, "event"), country = value(searchParams, "country"), device = value(searchParams, "device"), source = value(searchParams, "source"), campaign = value(searchParams, "campaign");
    const days = Number(value(searchParams, "period") || "180");
    const eventMatch: Record<string, unknown> = {};
    if (Number.isFinite(days) && days > 0) eventMatch.createdAt = { $gte: new Date(Date.now() - days * 86400000) };
    if (event) eventMatch.type = event;
    const sessionMatch: Record<string, unknown> = {};
    if (country) sessionMatch["session.country"] = country;
    if (device) sessionMatch["session.device"] = device;
    if (source) sessionMatch["session.source"] = source;
    if (campaign) sessionMatch["session.campaign"] = campaign;
    if (search) {
      const term = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      sessionMatch.$or = [{ page: term }, { type: term }, { element: term }, { "metadata.label": term }, { "metadata.href": term }, { "session.source": term }, { "session.campaign": term }, { "session.country": term }, { "session.city": term }, { "session.ip": term }, { "session.device": term }, { "session.browser": term }, { "session.os": term }];
    }
    const rows = await Event.aggregate([{ $match: eventMatch }, { $lookup: { from: "sessions", localField: "sessionId", foreignField: "sessionId", as: "session" } }, { $unwind: { path: "$session", preserveNullAndEmptyArrays: true } }, ...(Object.keys(sessionMatch).length ? [{ $match: sessionMatch }] : []), { $sort: { createdAt: -1 } }, { $limit: 250 }, { $project: { type: 1, page: 1, element: 1, metadata: 1, createdAt: 1, source: "$session.source", campaign: "$session.campaign", country: "$session.country", city: "$session.city", ip: "$session.ip", device: "$session.device", browser: "$session.browser", os: "$session.os" } }]);
    const sessionCount = await Event.aggregate([{ $match: eventMatch }, { $lookup: { from: "sessions", localField: "sessionId", foreignField: "sessionId", as: "session" } }, { $unwind: { path: "$session", preserveNullAndEmptyArrays: true } }, ...(Object.keys(sessionMatch).length ? [{ $match: sessionMatch }] : []), { $group: { _id: "$session.sessionId" } }, { $count: "value" }]);
    const options = await Event.aggregate([{ $lookup: { from: "sessions", localField: "sessionId", foreignField: "sessionId", as: "session" } }, { $unwind: { path: "$session", preserveNullAndEmptyArrays: true } }, { $group: { _id: null, events: { $addToSet: "$type" }, countries: { $addToSet: "$session.country" }, devices: { $addToSet: "$session.device" }, sources: { $addToSet: "$session.source" }, campaigns: { $addToSet: "$session.campaign" } } }]);
    const clean = (items: unknown[] = []) => items.filter((item): item is string => typeof item === "string" && item.trim().length > 0).sort();
    const lists = options[0] || {};
    return NextResponse.json({ rows, sessionCount: sessionCount[0]?.value || 0, filters: { events: clean(lists.events), countries: clean(lists.countries), devices: clean(lists.devices), sources: clean(lists.sources), campaigns: clean(lists.campaigns) } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message === "UNAUTHORIZED" ? "Unauthorized" : "Activity failed" }, { status: error?.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
