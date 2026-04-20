import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { Subject } from "@/generated/prisma";

function jitsiRoomUrl(slug: string) {
  const clean = slug.replace(/[^a-z0-9]/gi, "").slice(0, 30) || "class";
  return `https://meet.jit.si/jalouli-${clean}-${Date.now().toString(36)}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const now = new Date();
  const classes = await prisma.liveClass.findMany({
    where: { startAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
    orderBy: { startAt: "asc" },
    include: { teacher: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  let body: {
    title?: string;
    summary?: string;
    subject?: Subject;
    startAt?: string;
    durationMinutes?: number;
    meetUrl?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.title?.trim() || !body.subject || !body.startAt) {
    return NextResponse.json(
      { error: "العنوان والمادة والموعد مطلوبة" },
      { status: 400 },
    );
  }

  const startAt = new Date(body.startAt);
  if (Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "موعد غير صالح" }, { status: 400 });
  }

  const meetUrl = body.meetUrl?.trim() || jitsiRoomUrl(body.title);

  const liveClass = await prisma.liveClass.create({
    data: {
      teacherId: session.sub,
      title: body.title.trim(),
      summary: body.summary?.trim() || null,
      subject: body.subject,
      startAt,
      durationMinutes: body.durationMinutes ?? 45,
      meetUrl,
    },
  });

  return NextResponse.json({ liveClass });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });

  const existing = await prisma.liveClass.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  if (existing.teacherId !== session.sub) {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }
  await prisma.liveClass.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
