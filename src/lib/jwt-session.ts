import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/generated/prisma";

export type SessionPayload = {
  sub: string;
  role: Role;
  name: string;
};

function secretKey() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "يجب تعيين SESSION_SECRET في ملف .env (16 حرفًا على الأقل).",
    );
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({
    role: payload.role,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    const role = payload.role as Role | undefined;
    const name = payload.name as string | undefined;
    if (!sub || !role || !name) return null;
    return { sub, role, name };
  } catch {
    return null;
  }
}
