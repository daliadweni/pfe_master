import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { id } = await params;

  const comments = await prisma.lessonComment.findMany({
    where: { lessonId: id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { id } = await params;

  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }
  const text = body.body?.trim();
  if (!text) return NextResponse.json({ error: "النص مطلوب" }, { status: 400 });

  const comment = await prisma.lessonComment.create({
    data: { lessonId: id, userId: session.sub, body: text },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  // Notify relevant participants (parent of author-student, student of author-parent, etc.)
  const authorRole = session.role;
  if (authorRole === "STUDENT") {
    const me = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { parents: { select: { id: true } } },
    });
    for (const p of me?.parents ?? []) {
      await prisma.notification.create({
        data: {
          userId: p.id,
          title: "تعليق جديد",
          body: `${session.name} نشر تعليقًا على درس.`,
          link: `/parent`,
        },
      });
    }
  } else if (authorRole === "PARENT") {
    const me = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { linkedStudentId: true },
    });
    if (me?.linkedStudentId) {
      await prisma.notification.create({
        data: {
          userId: me.linkedStudentId,
          title: "رسالة من ولي الأمر",
          body: `${session.name} علّق على درسك.`,
          link: `/eleve/lecon/${id}`,
        },
      });
    }
  }

  return NextResponse.json({ comment });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("commentId");
  if (!commentId) return NextResponse.json({ error: "معرّف التعليق مطلوب" }, { status: 400 });

  const existing = await prisma.lessonComment.findUnique({ where: { id: commentId } });
  if (!existing || existing.lessonId !== id) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  if (existing.userId !== session.sub && session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }
  await prisma.lessonComment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
