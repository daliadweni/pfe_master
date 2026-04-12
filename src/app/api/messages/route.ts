import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get("contactId");

  if (!contactId) {
    return NextResponse.json({ error: "حدد جهة الاتصال" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: session.sub, toUserId: contactId },
        { fromUserId: contactId, toUserId: session.sub },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      fromUser: { select: { name: true, role: true } },
    },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  let body: { toUserId?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });
  }
  if (!body.toUserId) {
    return NextResponse.json({ error: "حدد المستلم" }, { status: 400 });
  }

  const sender = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true },
  });
  if (!sender) {
    return NextResponse.json(
      { error: "جلسة غير صالحة — أعد تسجيل الدخول" },
      { status: 401 }
    );
  }

  const recipient = await prisma.user.findUnique({
    where: { id: body.toUserId },
    select: { id: true, name: true },
  });
  if (!recipient) {
    return NextResponse.json({ error: "المستلم غير موجود" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      fromUserId: session.sub,
      toUserId: body.toUserId,
      body: body.body.trim(),
    },
  });

  const roleLabel =
    session.role === "TEACHER"
      ? "المعلّم"
      : session.role === "STUDENT"
        ? "التلميذ"
        : "ولي الأمر";

  await prisma.notification.create({
    data: {
      userId: body.toUserId,
      title: `رسالة من ${roleLabel}`,
      body: `${session.name} أرسل إليك رسالة.`,
    },
  });

  return NextResponse.json({ message });
}
