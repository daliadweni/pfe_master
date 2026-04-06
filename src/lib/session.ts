import "server-only";

import { cookies } from "next/headers";
import {
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/jwt-session";

export type { SessionPayload };

const COOKIE = "jalouli_session";

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function loginUser(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  await setSessionCookie(token);
}

export { COOKIE as SESSION_COOKIE_NAME };
