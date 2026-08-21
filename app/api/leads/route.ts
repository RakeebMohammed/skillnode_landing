import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getClientIp, parseUserAgent } from "@/lib/request";
import { geoFromHeaders, lookupGeo } from "@/lib/geo";
import { classifyTraffic } from "@/lib/traffic";
import { findFreelancerCategory } from "@/lib/freelancer-categories";
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
    const formType = typeof body.formType === "string" ? body.formType.trim() : "";
    const freelancerCategory = typeof body.freelancerCategory === "string" ? body.freelancerCategory.trim() : "";
    const freelancerSubcategory = typeof body.freelancerSubcategory === "string" ? body.freelancerSubcategory.trim() : "";
    const services = typeof body.services === "string" ? body.services.trim() : "";
    const experience = typeof body.experience === "string" ? body.experience.trim() : "";
    const workMode = typeof body.workMode === "string" ? body.workMode.trim() : "";
    const serviceLocation = typeof body.serviceLocation === "string" ? body.serviceLocation.trim() : "";
    const availability = typeof body.availability === "string" ? body.availability.trim() : "";
    const fields: Record<string, string> = {};

    if (formType !== "freelancer") {
      return NextResponse.json({ error: "Unsupported questionnaire type." }, { status: 400 });
    }

    if (name.length < 2 || name.length > 100) fields.name = "Please enter a valid name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) fields.email = "Please enter a valid email address.";
    if (phone.length > 40) fields.phone = "Please enter a valid phone number.";
    const selectedCategory = findFreelancerCategory(freelancerCategory);
    if (!selectedCategory) fields.freelancerCategory = "Please select a valid service category.";
    if (!selectedCategory?.subcategories.includes(freelancerSubcategory)) fields.freelancerSubcategory = "Please select a valid specialisation.";
    if (services.length < 2 || services.length > 800) fields.services = "Please describe your services in 800 characters or fewer.";
    if (!["starting", "under-1", "1-3", "3-5", "5-plus"].includes(experience)) fields.experience = "Please select your experience.";
    if (!["remote", "onsite", "both"].includes(workMode)) fields.workMode = "Please select your work preference.";
    if (serviceLocation.length < 2 || serviceLocation.length > 160) fields.serviceLocation = "Please enter a valid city or service area.";
    if (!["immediate", "within-month", "part-time", "project-basis"].includes(availability)) fields.availability = "Please select your availability.";
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
      formType: "freelancer",
      freelancerCategory,
      freelancerSubcategory,
      services,
      experience,
      workMode,
      serviceLocation,
      availability,
      source: session?.source || traffic.source, medium: session?.medium || traffic.medium, channel: session?.channel || traffic.channel, campaign: session?.campaign || traffic.campaign, content: session?.content || traffic.content, referrer: session?.referrer || traffic.referrer,
      ip, ...geo, device, browser, os,
    });
    if (body.sessionId) await Session.updateOne({ sessionId: body.sessionId }, { $set: { lastSeen: new Date() }, $inc: { eventCount: 1 } });
    return NextResponse.json({ ok: true, id: String(lead._id) });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Unable to submit lead" }, { status: 500 }); }
}
