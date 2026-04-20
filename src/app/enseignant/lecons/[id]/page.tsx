import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { LessonResourcesManager } from "./ui";

export default async function TeacherLessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") return null;

  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      resources: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!lesson) notFound();

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <Link
          href="/enseignant/lecons"
          className="mb-2 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← كل الدروس
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              lesson.subject === "SCIENCE"
                ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
            }`}
          >
            {lesson.subject === "SCIENCE" ? "إيقاظ علمي" : "رياضيات"}
          </span>
          <span className="text-xs text-zinc-500">الترتيب {lesson.sequenceOrder}</span>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {lesson.title}
        </h1>
        {lesson.description && (
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            {lesson.description}
          </p>
        )}
      </div>

      <LessonResourcesManager
        lessonId={lesson.id}
        initial={lesson.resources.map((r) => ({
          id: r.id,
          title: r.title,
          kind: r.kind,
          url: r.url,
          sizeBytes: r.sizeBytes,
        }))}
      />
    </div>
  );
}
