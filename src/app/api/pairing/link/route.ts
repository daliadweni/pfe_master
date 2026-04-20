import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "PARENT") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }
  const code = body.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "الرمز مطلوب" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({ where: { pairingCode: code } });
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "رمز غير صحيح" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: { linkedStudentId: student.id },
  });
  // Consume the code so it cannot be reused.
  await prisma.user.update({
    where: { id: student.id },
    data: { pairingCode: null },
  });

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: "تم الربط",
      body: `حسابك الآن مرتبط بولي الأمر: ${session.name}`,
    },
  });

  return NextResponse.json({ ok: true, student: { id: student.id, name: student.name } });
}

export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "PARENT") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }
  await prisma.user.update({
    where: { id: session.sub },
    data: { linkedStudentId: null },
  });
  return NextResponse.json({ ok: true });
}
