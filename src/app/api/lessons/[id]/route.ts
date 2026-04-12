import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      threads: {
        include: {
          posts: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
      exams: {
        include: {
          questions: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
        },
        orderBy: { createdAt: "asc" },
      },
      progress:
        session.role === "STUDENT"
          ? { where: { userId: session.sub }, take: 1 }
          : false,
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ lesson });
}

export async function PUT(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const { id } = await params;

  let body: {
    title?: string;
    description?: string;
    courseHtml?: string;
    videoUrl?: string;
    sequenceOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.courseHtml !== undefined && { courseHtml: body.courseHtml?.trim() || null }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl?.trim() || null }),
      ...(body.sequenceOrder !== undefined && { sequenceOrder: body.sequenceOrder }),
    },
  });

  return NextResponse.json({ lesson });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.lesson.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
