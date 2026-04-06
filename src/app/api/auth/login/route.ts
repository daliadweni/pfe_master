import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { loginUser } from "@/lib/session";

function dashboardPath(role: string) {
  if (role === "TEACHER") return "/enseignant";
  if (role === "STUDENT") return "/eleve";
  if (role === "PARENT") return "/parent";
  return "/connexion";
}

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة" },
      { status: 401 },
    );
  }

  await loginUser({
    sub: user.id,
    role: user.role,
    name: user.name,
  });

  return NextResponse.json({ ok: true, redirect: dashboardPath(user.role) });
}
