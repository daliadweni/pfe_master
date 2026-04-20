import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });

  const items = await prisma.portfolioItem.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ items });
}
