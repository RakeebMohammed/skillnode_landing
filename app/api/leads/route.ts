import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp, parseUserAgent } from "@/lib/request";
import { geoFromHeaders, lookupGeo } from "@/lib/geo";
import { classifyTraffic } from "@/lib/traffic";
import Lead from "@/models/Lead";
import Session from "@/models/Session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid questionnaire submission." }, { status: 400 });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const intent = typeof body.intent === "string" ? body.intent.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const budget = typeof body.budget === "string" ? body.budget.trim() : "";
    const profileType = typeof body.profileType === "string" ? body.profileType.trim() : "";
    const interest = typeof body.interest === "string" ? body.interest.trim() : "";
    const timeline = typeof body.timeline === "string" ? body.timeline.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const isCurrentQuestionnaire = ["intent", "category", "budget", "phone"].some(
      (field) => Object.prototype.hasOwnProperty.call(body, field),
    );
    const fields: Record<string, string> = {};
    if (name.length < 2 || name.length > 100) fields.name = "Please enter a valid name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fields.email = "Please enter a valid email address.";
    if (phone.length > 40) fields.phone = "Please enter a valid phone number.";
    if (isCurrentQuestionnaire) {
      if (!["hire", "work", "explore"].includes(intent)) fields.intent = "Please select what brings you to SkillNode.";
      if (category.length < 2 || category.length > 200) fields.category = "Please describe what you are looking for.";
      if (budget && !["under-10k", "10k-50k", "50k-2l", "2l-plus"].includes(budget)) fields.budget = "Please select a valid budget range.";
    } else {
      if (!["Hiring", "Looking for work", "Business", "Exploring"].includes(profileType)) fields.profileType = "Please select the option that best describes you.";
      if (!["Find talent", "Find projects", "Build a project", "Partnership", "Other"].includes(interest)) fields.interest = "Please select what you need help with.";
      if (!["Just exploring", "This week", "This month", "Later"].includes(timeline)) fields.timeline = "Please select your preferred timeline.";
    }
    if (message.length > 2000) fields.message = "Please keep your message under 2,000 characters.";
    if (Object.keys(fields).length) return NextResponse.json({ error: "Please correct the highlighted fields.", fields }, { status: 400 });

    await connectDB();
    const ip = await getClientIp(req);
    const ua = req.headers.get("user-agent");
    const { device, browser, os } = parseUserAgent(ua);
    const edgeGeo = geoFromHeaders(req.headers);
    const geo = edgeGeo.country ? edgeGeo : await lookupGeo(ip);
    let session: any = null;
    // document.referrer retains the external platform; the request Referer is normally this landing page.
    const traffic = classifyTraffic(body.pageUrl, body.referrer || req.headers.get("referer"));
    if (body.sessionId) session = await Session.findOne({ sessionId: body.sessionId }).lean();
    const lead = await Lead.create({
      visitorId: body.visitorId,
      sessionId: body.sessionId,
      name,
      email,
      phone: phone || undefined,
      intent: isCurrentQuestionnaire ? intent : undefined,
      category: isCurrentQuestionnaire ? category : undefined,
      budget: isCurrentQuestionnaire ? budget || undefined : undefined,
      profileType: isCurrentQuestionnaire ? undefined : profileType,
      interest: isCurrentQuestionnaire ? undefined : interest,
      timeline: isCurrentQuestionnaire ? undefined : timeline,
      message: message || undefined,
      source: session?.source || traffic.source, medium: session?.medium || traffic.medium, channel: session?.channel || traffic.channel, campaign: session?.campaign || traffic.campaign, content: session?.content || traffic.content, referrer: session?.referrer || traffic.referrer,
      ip, ...geo, device, browser, os,
    });
    if (body.sessionId) await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: new Date() }, $inc: { eventCount: 1 } });
    return NextResponse.json({ ok: true, id: String(lead._id) });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to submit lead" }, { status: 500 }); }
}
