import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { id } = await params;

  const [ratings, mine] = await Promise.all([
    prisma.lessonRating.findMany({
      where: { lessonId: id },
      select: { stars: true, feedback: true, createdAt: true, user: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.lessonRating.findUnique({
      where: { userId_lessonId: { userId: session.sub, lessonId: id } },
    }),
  ]);

  const avg = ratings.length > 0
    ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
    : null;

  return NextResponse.json({ ratings, count: ratings.length, avg, mine });
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { id } = await params;

  let body: { stars?: number; feedback?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }
  const stars = Math.round(Number(body.stars));
  if (!stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "النجوم من 1 إلى 5" }, { status: 400 });
  }
  const feedback = body.feedback?.trim() || null;

  const rating = await prisma.lessonRating.upsert({
    where: { userId_lessonId: { userId: session.sub, lessonId: id } },
    create: { userId: session.sub, lessonId: id, stars, feedback },
    update: { stars, feedback },
  });
  return NextResponse.json({ rating });
}
