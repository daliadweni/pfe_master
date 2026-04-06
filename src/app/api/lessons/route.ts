import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { Subject } from "@/generated/prisma";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject") as Subject | null;

  const lessons = await prisma.lesson.findMany({
    where: subject ? { subject } : undefined,
    orderBy: [{ subject: "asc" }, { sequenceOrder: "asc" }],
    include:
      session.role === "STUDENT"
        ? {
            progress: {
              where: { userId: session.sub },
              take: 1,
            },
          }
        : undefined,
  });

  return NextResponse.json({ lessons });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  let body: {
    title?: string;
    subject?: Subject;
    description?: string;
    courseHtml?: string;
    sequenceOrder?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.title?.trim() || !body.subject) {
    return NextResponse.json({ error: "العنوان والمادة مطلوبان" }, { status: 400 });
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: body.title.trim(),
      subject: body.subject,
      description: body.description?.trim() || null,
      courseHtml: body.courseHtml?.trim() || null,
      sequenceOrder: body.sequenceOrder ?? 0,
      authorId: session.sub,
    },
  });

  return NextResponse.json({ lesson });
}
