import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt-session";
import type { Role } from "@/generated/prisma";

const SESSION_COOKIE = "jalouli_session";

function dashboardForRole(role: Role): string {
  switch (role) {
    case "TEACHER":
      return "/enseignant";
    case "STUDENT":
      return "/eleve";
    case "PARENT":
      return "/parent";
    default:
      return "/connexion";
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let session: Awaited<ReturnType<typeof verifySessionToken>> = null;

  try {
    session = token ? await verifySessionToken(token) : null;
  } catch {
    session = null;
  }

  if (pathname === "/" && session) {
    return NextResponse.redirect(
      new URL(dashboardForRole(session.role), request.url),
    );
  }

  if (pathname.startsWith("/enseignant")) {
    if (!session || session.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
  }

  if (pathname.startsWith("/eleve")) {
    if (!session || session.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
  }

  if (pathname.startsWith("/parent")) {
    if (!session || session.role !== "PARENT") {
      return NextResponse.redirect(new URL("/connexion", request.url));
    }
  }

  if (pathname === "/connexion" && session) {
    return NextResponse.redirect(
      new URL(dashboardForRole(session.role), request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/connexion",
    "/enseignant/:path*",
    "/eleve/:path*",
    "/parent/:path*",
  ],
};
