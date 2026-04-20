import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  let body: { identifier?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const identifier = body.identifier?.trim().toLowerCase();
  if (!identifier) {
    return NextResponse.json({ error: "البريد أو المعرّف مطلوب" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { id: identifier }] },
  });

  // Always return success-shaped response to avoid email enumeration.
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetLink = `/reinitialiser-mot-de-passe/${token}`;
  return NextResponse.json({ ok: true, resetLink });
}
