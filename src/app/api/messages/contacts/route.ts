import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  }

  const myId = session.sub;
  const role = session.role;

  let contacts: { id: string; name: string; role: string }[] = [];

  if (role === "TEACHER") {
    contacts = await prisma.user.findMany({
      where: { id: { not: myId }, role: { in: ["STUDENT", "PARENT"] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });
  } else if (role === "STUDENT") {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, role: true },
    });
    const parents = await prisma.user.findMany({
      where: { linkedStudentId: myId },
      select: { id: true, name: true, role: true },
    });
    contacts = [...teachers, ...parents];
  } else if (role === "PARENT") {
    const me = await prisma.user.findUnique({
      where: { id: myId },
      select: { linkedStudentId: true },
    });
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, role: true },
    });
    if (me?.linkedStudentId) {
      const student = await prisma.user.findUnique({
        where: { id: me.linkedStudentId },
        select: { id: true, name: true, role: true },
      });
      if (student) contacts.push(student);
    }
    contacts = [...contacts, ...teachers];
  }

  const lastMessages = await prisma.message.findMany({
    where: {
      OR: [{ fromUserId: myId }, { toUserId: myId }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      fromUserId: true,
      toUserId: true,
      body: true,
      createdAt: true,
    },
  });

  const contactsWithLastMsg = contacts.map((c) => {
    const last = lastMessages.find(
      (m) =>
        (m.fromUserId === c.id && m.toUserId === myId) ||
        (m.fromUserId === myId && m.toUserId === c.id)
    );
    return {
      ...c,
      lastMessage: last ? last.body.slice(0, 40) : null,
      lastMessageAt: last ? last.createdAt : null,
    };
  });

  contactsWithLastMsg.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt)
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;
    return 0;
  });

  return NextResponse.json({ contacts: contactsWithLastMsg });
}
