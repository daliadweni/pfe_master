import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  let body: { title?: string; lessonId?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
  }

  const thread = await prisma.forumThread.create({
    data: {
      title: body.title.trim(),
      lessonId: body.lessonId || null,
    },
  });

  return NextResponse.json({ thread });
}
