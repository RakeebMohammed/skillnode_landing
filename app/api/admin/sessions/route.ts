import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
export async function GET() { try { await requireAdmin(); await connectDB(); const sessions = await Session.find().sort({ startedAt: -1 }).limit(200).lean(); return NextResponse.json({ sessions }); } catch (e: any) { console.error(e); return NextResponse.json({ error: e?.message === "UNAUTHORIZED" ? "Unauthorized" : "Failed" }, { status: e?.message === "UNAUTHORIZED" ? 401 : 500 }); } }
