import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  let body: { threadId?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.threadId || !body.body?.trim()) {
    return NextResponse.json({ error: "الموضوع والرسالة مطلوبان" }, { status: 400 });
  }

  const post = await prisma.forumPost.create({
    data: {
      threadId: body.threadId,
      userId: session.sub,
      body: body.body.trim(),
    },
  });

  return NextResponse.json({ post });
}
