import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Lead from "@/models/Lead";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const leads = await Lead.find({
      $or: [
        { formType: "freelancer" },
        { freelancerCategory: { $exists: true, $nin: [null, ""] } },
      ],
    }).sort({ createdAt: -1 }).limit(200).lean();

    return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    const unauthorized = error?.message === "UNAUTHORIZED";
    return NextResponse.json(
      { error: unauthorized ? "Unauthorized" : "Failed" },
      { status: unauthorized ? 401 : 500 },
    );
  }
}
