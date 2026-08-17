import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "./mongodb";
import Admin from "@/models/Admin";

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "development-only-secret-change-me");
const COOKIE = "skillnode_admin";
type AdminRecord = { _id: unknown; email: string; passwordHash: string };

export async function ensureAdmin() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.updateOne({ email }, { $setOnInsert: { email, passwordHash, name: "Administrator" } }, { upsert: true });
  const existing = await Admin.findOne({ email }).lean() as AdminRecord | null;
  if (existing && !(await bcrypt.compare(password, existing.passwordHash))) {
    await Admin.updateOne({ email }, { $set: { passwordHash } });
  }
  return email;
}

export async function loginAdmin(email: string, password: string) {
  await ensureAdmin();
  const admin = await Admin.findOne({ email }) as AdminRecord | null;
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return false;
  const token = await new SignJWT({ sub: String(admin._id), email: admin.email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return true;
}

export async function getAdmin() {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return payload.email ? { email: String(payload.email) } : null;
  } catch { return null; }
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function logoutAdmin() {
  (await cookies()).delete(COOKIE);
}
