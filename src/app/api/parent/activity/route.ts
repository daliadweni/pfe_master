import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PARENT") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  const parent = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { linkedStudentId: true },
  });
  const studentId = parent?.linkedStudentId;
  if (!studentId) {
    return NextResponse.json({ activity: [], portfolio: [], comments: [] });
  }

  const [activity, recentPortfolio, recentComments] = await Promise.all([
    prisma.progress.findMany({
      where: { userId: studentId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { lesson: { select: { id: true, title: true, subject: true } } },
    }),
    prisma.portfolioItem.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.lessonComment.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { lesson: { select: { id: true, title: true } } },
    }),
  ]);

  return NextResponse.json({
    activity,
    portfolio: recentPortfolio,
    comments: recentComments,
  });
}
