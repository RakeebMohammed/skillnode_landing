import { NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    const ok = await loginAdmin(email, password);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Login failed" }, { status: 500 }); }
}
