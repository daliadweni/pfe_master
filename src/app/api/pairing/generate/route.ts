import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

function freshCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }

  let code = freshCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.user.findUnique({ where: { pairingCode: code } });
    if (!exists) break;
    code = freshCode();
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: { pairingCode: code },
  });

  return NextResponse.json({ code });
}
