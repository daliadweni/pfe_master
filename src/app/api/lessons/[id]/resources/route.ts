import { NextResponse } from "next/server";
import path from "path";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { ResourceKind } from "@/generated/prisma";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_KINDS = new Set<ResourceKind>([
  "PDF",
  "H5P",
  "VIDEO",
  "AUDIO",
  "IMAGE",
  "YOUTUBE",
  "LINK",
  "DOC",
]);

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
  const { id } = await params;
  const resources = await prisma.lessonResource.findMany({
    where: { lessonId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ resources });
}

function inferKind(name: string): ResourceKind | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "PDF";
  if (lower.endsWith(".h5p")) return "H5P";
  if (/\.(mp4|webm|ogv|mov)$/.test(lower)) return "VIDEO";
  if (/\.(mp3|wav|ogg|m4a)$/.test(lower)) return "AUDIO";
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/.test(lower)) return "IMAGE";
  if (/\.(doc|docx|odt|txt|md)$/.test(lower)) return "DOC";
  return null;
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }
  const { id } = await params;

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    const title = String(form.get("title") ?? "").trim();

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "ملف غير صالح" }, { status: 400 });
    }

    const kind = inferKind(file.name) ?? "DOC";
    if (!ALLOWED_KINDS.has(kind)) {
      return NextResponse.json({ error: "نوع غير مدعوم" }, { status: 400 });
    }

    const ext = path.extname(file.name) || "";
    const base = randomBytes(8).toString("hex");
    const filename = `${base}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "lessons", id);
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const publicUrl = `/uploads/lessons/${id}/${filename}`;

    const resource = await prisma.lessonResource.create({
      data: {
        lessonId: id,
        title: title || file.name,
        kind,
        url: publicUrl,
        sizeBytes: file.size,
        authorId: session.sub,
      },
    });

    return NextResponse.json({ resource });
  }

  let body: { title?: string; kind?: ResourceKind; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const url = body.url?.trim();
  const title = body.title?.trim();
  const kind = body.kind;
  if (!url || !title || !kind || !ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "عنوان ورابط ونوع مطلوبة" }, { status: 400 });
  }

  const resource = await prisma.lessonResource.create({
    data: { lessonId: id, title, kind, url, authorId: session.sub },
  });
  return NextResponse.json({ resource });
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "ممنوع" }, { status: 403 });
  }
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const resourceId = searchParams.get("resourceId");
  if (!resourceId) {
    return NextResponse.json({ error: "معرّف المورد مطلوب" }, { status: 400 });
  }
  await prisma.lessonResource.delete({ where: { id: resourceId } });
  void id;
  return NextResponse.json({ ok: true });
}
