import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  if (session.role === "PARENT") {
    const parent = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { linkedStudentId: true },
    });
    if (!parent?.linkedStudentId) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: session.sub, toUserId: parent.linkedStudentId },
          { fromUserId: parent.linkedStudentId, toUserId: session.sub },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        fromUser: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({ messages });
  }

  if (session.role === "STUDENT") {
    const parents = await prisma.user.findMany({
      where: { linkedStudentId: session.sub },
      select: { id: true },
    });
    const parentIds = parents.map((p) => p.id);
    if (parentIds.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            AND: [
              { fromUserId: session.sub },
              { toUserId: { in: parentIds } },
            ],
          },
          {
            AND: [
              { toUserId: session.sub },
              { fromUserId: { in: parentIds } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        fromUser: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({ messages });
  }

  return NextResponse.json({ error: "ممنوع" }, { status: 403 });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ error: "الرسالة فارغة" }, { status: 400 });
  }

  if (session.role === "PARENT") {
    const parent = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { linkedStudentId: true },
    });
    if (!parent?.linkedStudentId) {
      return NextResponse.json({ error: "لا يوجد تلميذ مرتبط" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        fromUserId: session.sub,
        toUserId: parent.linkedStudentId,
        body: body.body.trim(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: parent.linkedStudentId,
        title: "رسالة من أحد الأقارب",
        body: "تلقّيتَ رسالة تشجيع أو تعليقًا.",
      },
    });

    return NextResponse.json({ message });
  }

  if (session.role === "STUDENT") {
    const parent = await prisma.user.findFirst({
      where: { linkedStudentId: session.sub },
    });
    if (!parent) {
      return NextResponse.json({ error: "لا يوجد ولي أمر مرتبط" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        fromUserId: session.sub,
        toUserId: parent.id,
        body: body.body.trim(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: parent.id,
        title: "رسالة من التلميذ",
        body: `${session.name} كتب إليك.`,
      },
    });

    return NextResponse.json({ message });
  }

  return NextResponse.json({ error: "ممنوع" }, { status: 403 });
}
