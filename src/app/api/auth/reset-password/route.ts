import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const token = body.token?.trim();
  const password = body.password ?? "";
  if (!token || password.length < 6) {
    return NextResponse.json(
      { error: "رمز غير صالح أو كلمة مرور قصيرة (6 أحرف على الأقل)" },
      { status: 400 },
    );
  }

  const entry = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!entry || entry.usedAt || entry.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "الرمز منتهي الصلاحية أو مستعمل" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: entry.userId },
    data: { passwordHash: hashPassword(password) },
  });
  await prisma.passwordResetToken.update({
    where: { id: entry.id },
    data: { usedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
