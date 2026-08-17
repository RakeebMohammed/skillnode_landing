import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";
export async function GET() { try { await requireAdmin(); await connectDB(); const leads = await Lead.find().sort({ createdAt: -1 }).limit(200).lean(); return NextResponse.json({ leads }); } catch (e: any) { return NextResponse.json({ error: e?.message === "UNAUTHORIZED" ? "Unauthorized" : "Failed" }, { status: e?.message === "UNAUTHORIZED" ? 401 : 500 }); } }
