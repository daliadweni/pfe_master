import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  let userId = session.sub;
  if (session.role === "PARENT") {
    const parent = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { linkedStudentId: true },
    });
    if (!parent?.linkedStudentId) {
      return NextResponse.json({ items: [] });
    }
    userId = parent.linkedStudentId;
  }

  if (session.role !== "STUDENT" && session.role !== "PARENT") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const items = await prisma.portfolioItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  let body: { title?: string; kind?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  if (!body.title?.trim() || !body.kind?.trim()) {
    return NextResponse.json({ error: "العنوان والنوع مطلوبان" }, { status: 400 });
  }

  const item = await prisma.portfolioItem.create({
    data: {
      userId: session.sub,
      title: body.title.trim(),
      kind: body.kind.trim(),
      description: body.description?.trim() || null,
    },
  });

  return NextResponse.json({ item });
}
