import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { Subject, QuestionType } from "@/generated/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      lesson: { select: { id: true, title: true } },
      questions: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
    },
  });

  if (!exam) {
    return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ exam });
}

type QuestionInput = {
  id?: string;
  type: QuestionType;
  questionText: string;
  options?: string | null;
  correctAnswer: string;
  explanation?: string | null;
  hint?: string | null;
  displayOrder?: number;
};

export async function PUT(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const { id } = await params;

  let body: {
    title?: string;
    subject?: Subject;
    lessonId?: string | null;
    questions?: QuestionInput[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.exam.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.subject && { subject: body.subject }),
        ...(body.lessonId !== undefined && { lessonId: body.lessonId || null }),
      },
    });

    if (body.questions) {
      await tx.question.deleteMany({ where: { examId: id } });
      await tx.question.createMany({
        data: body.questions.map((q, i) => ({
          examId: id,
          type: q.type,
          questionText: q.questionText.trim(),
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation?.trim() || null,
          hint: q.hint?.trim() || null,
          displayOrder: q.displayOrder ?? i + 1,
        })),
      });
    }
  });

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { displayOrder: "asc" } },
      lesson: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ exam });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.exam.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
