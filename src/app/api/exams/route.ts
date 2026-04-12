import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { Subject, QuestionType } from "@/generated/prisma";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject") as Subject | null;
  const lessonId = searchParams.get("lessonId");

  const where: Record<string, unknown> = {};
  if (subject) where.subject = subject;
  if (lessonId) where.lessonId = lessonId;

  const exams = await prisma.exam.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      lesson: { select: { id: true, title: true } },
      _count: { select: { questions: true } },
      questions: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return NextResponse.json({ exams });
}

type QuestionInput = {
  type: QuestionType;
  questionText: string;
  options?: string | null;
  correctAnswer: string;
  explanation?: string | null;
  hint?: string | null;
  displayOrder?: number;
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

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

  if (!body.title?.trim() || !body.subject) {
    return NextResponse.json(
      { error: "عنوان الاختبار والمادة مطلوبان" },
      { status: 400 },
    );
  }

  if (!body.questions || body.questions.length === 0) {
    return NextResponse.json(
      { error: "يجب إضافة سؤال واحد على الأقل" },
      { status: 400 },
    );
  }

  const exam = await prisma.exam.create({
    data: {
      title: body.title.trim(),
      subject: body.subject,
      lessonId: body.lessonId || null,
      authorId: session.sub,
      questions: {
        create: body.questions.map((q, i) => ({
          type: q.type,
          questionText: q.questionText.trim(),
          options: q.options || null,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation?.trim() || null,
          hint: q.hint?.trim() || null,
          displayOrder: q.displayOrder ?? i + 1,
        })),
      },
    },
    include: {
      questions: { orderBy: { displayOrder: "asc" } },
      lesson: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ exam });
}
