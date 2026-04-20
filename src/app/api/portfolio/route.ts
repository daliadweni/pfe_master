import { NextResponse } from "next/server";
import path from "path";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
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

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const title = String(form.get("title") ?? "").trim();
    const kind = String(form.get("kind") ?? "").trim() || "AUTRE";
    const description = String(form.get("description") ?? "").trim();
    const isPublicRaw = form.get("isPublic");
    const isPublic = isPublicRaw === null ? true : String(isPublicRaw) === "true";
    const file = form.get("file");

    if (!title) {
      return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
    }

    let fileUrl: string | null = null;
    if (file instanceof File && file.size > 0) {
      const ext = path.extname(file.name) || "";
      const base = randomBytes(8).toString("hex");
      const filename = `${base}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "portfolio", session.sub);
      await mkdir(uploadDir, { recursive: true });
      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadDir, filename), buf);
      fileUrl = `/uploads/portfolio/${session.sub}/${filename}`;
    }

    const item = await prisma.portfolioItem.create({
      data: {
        userId: session.sub,
        title,
        kind,
        description: description || null,
        fileUrl,
        isPublic,
      },
    });
    return NextResponse.json({ item });
  }

  let body: { title?: string; kind?: string; description?: string; fileUrl?: string; isPublic?: boolean };
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
      fileUrl: body.fileUrl?.trim() || null,
      isPublic: body.isPublic ?? true,
    },
  });

  return NextResponse.json({ item });
}
