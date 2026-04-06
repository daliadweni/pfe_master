import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  let body: {
    lessonId?: string;
    coursDone?: boolean;
    exercicesDone?: boolean;
    evaluationDone?: boolean;
    evaluationScore?: number;
    difficultyFlag?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.lessonId) {
    return NextResponse.json({ error: "معرّف الدرس مطلوب" }, { status: 400 });
  }

  const progress = await prisma.progress.upsert({
    where: {
      userId_lessonId: { userId: session.sub, lessonId: body.lessonId },
    },
    create: {
      userId: session.sub,
      lessonId: body.lessonId,
      coursDone: body.coursDone ?? false,
      exercicesDone: body.exercicesDone ?? false,
      evaluationDone: body.evaluationDone ?? false,
      evaluationScore: body.evaluationScore,
      difficultyFlag: body.difficultyFlag ?? false,
    },
    update: {
      ...(body.coursDone !== undefined ? { coursDone: body.coursDone } : {}),
      ...(body.exercicesDone !== undefined
        ? { exercicesDone: body.exercicesDone }
        : {}),
      ...(body.evaluationDone !== undefined
        ? { evaluationDone: body.evaluationDone }
        : {}),
      ...(body.evaluationScore !== undefined
        ? { evaluationScore: body.evaluationScore }
        : {}),
      ...(body.difficultyFlag !== undefined
        ? { difficultyFlag: body.difficultyFlag }
        : {}),
    },
  });

  if (
    body.evaluationDone &&
    body.difficultyFlag &&
    body.evaluationScore !== undefined &&
    body.evaluationScore >= 70
  ) {
    const student = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { parents: { select: { id: true } } },
    });
    for (const p of student?.parents ?? []) {
      await prisma.notification.create({
        data: {
          userId: p.id,
          title: "إنجاز مميز",
          body: `${session.name} أنجز مهمة صعبة. قد يسعده تشجيع منك!`,
        },
      });
    }
  }

  const badgePhys = await prisma.badgeDefinition.findUnique({
    where: { slug: "jeune-physicien" },
  });
  if (badgePhys && body.exercicesDone) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: body.lessonId },
    });
    if (lesson?.subject === "SCIENCE") {
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: { userId: session.sub, badgeId: badgePhys.id },
        },
        create: { userId: session.sub, badgeId: badgePhys.id },
        update: {},
      });
    }
  }

  const badgeMath = await prisma.badgeDefinition.findUnique({
    where: { slug: "geometre" },
  });
  if (badgeMath && body.exercicesDone) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: body.lessonId },
    });
    if (lesson?.subject === "MATH") {
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: { userId: session.sub, badgeId: badgeMath.id },
        },
        create: { userId: session.sub, badgeId: badgeMath.id },
        update: {},
      });
    }
  }

  return NextResponse.json({ progress });
}
