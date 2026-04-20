import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { AppointmentStatus } from "@/generated/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [{ fromUserId: session.sub }, { toUserId: session.sub }],
    },
    orderBy: { proposedAt: "asc" },
    include: {
      fromUser: { select: { id: true, name: true, role: true } },
      toUser: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  let body: {
    toUserId?: string;
    title?: string;
    message?: string;
    proposedAt?: string;
    durationMinutes?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.toUserId || !body.title?.trim() || !body.proposedAt) {
    return NextResponse.json(
      { error: "المستقبِل والعنوان والموعد مطلوبة" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id: body.toUserId } });
  if (!target) return NextResponse.json({ error: "المستقبِل غير موجود" }, { status: 404 });

  const proposedAt = new Date(body.proposedAt);
  if (Number.isNaN(proposedAt.getTime())) {
    return NextResponse.json({ error: "موعد غير صالح" }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      fromUserId: session.sub,
      toUserId: body.toUserId,
      title: body.title.trim(),
      message: body.message?.trim() || null,
      proposedAt,
      durationMinutes: body.durationMinutes ?? 30,
    },
  });

  await prisma.notification.create({
    data: {
      userId: body.toUserId,
      title: "دعوة لقاء",
      body: `${session.name} طلب موعدًا: ${appointment.title}`,
      link: target.role === "TEACHER" ? "/enseignant/rendez-vous"
          : target.role === "PARENT" ? "/parent/rendez-vous"
          : "/eleve/rendez-vous",
    },
  });

  return NextResponse.json({ appointment });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  let body: { id?: string; status?: AppointmentStatus; responseMessage?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "المعرّف والحالة مطلوبة" }, { status: 400 });
  }

  const existing = await prisma.appointment.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const isRecipient = existing.toUserId === session.sub;
  const isSender = existing.fromUserId === session.sub;

  if (body.status === "CANCELLED" && !isSender) {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }
  if ((body.status === "ACCEPTED" || body.status === "REFUSED") && !isRecipient) {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id: body.id },
    data: {
      status: body.status,
      responseMessage: body.responseMessage?.trim() || null,
    },
  });

  const notifyUserId = isSender ? existing.toUserId : existing.fromUserId;
  await prisma.notification.create({
    data: {
      userId: notifyUserId,
      title: "تحديث موعد",
      body:
        body.status === "ACCEPTED"
          ? `قُبل موعد: ${existing.title}`
          : body.status === "REFUSED"
            ? `رُفض موعد: ${existing.title}`
            : `أُلغي موعد: ${existing.title}`,
    },
  });

  return NextResponse.json({ appointment: updated });
}
