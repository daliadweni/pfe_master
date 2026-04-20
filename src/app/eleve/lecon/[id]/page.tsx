import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonFourPillars } from "@/components/LessonFourPillars";
import { LessonExtras } from "@/components/LessonExtras";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type PageProps = { params: Promise<{ id: string }> };

export default async function LeconPage({ params }: PageProps) {
  const session = await getSession();
  const { id } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      threads: {
        include: {
          posts: {
            orderBy: { createdAt: "asc" },
            include: { user: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      exams: {
        include: {
          questions: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
        },
        orderBy: { createdAt: "asc" },
      },
      progress: { where: { userId: session!.sub }, take: 1 },
    },
  });

  if (!lesson) notFound();

  const isSci = lesson.subject === "SCIENCE";
  const accent = isSci
    ? "bg-teal-600 hover:bg-teal-500"
    : "bg-indigo-600 hover:bg-indigo-500";
  const back = isSci ? "/eleve/eveil-scientifique" : "/eleve/mathematiques";

  const threads = lesson.threads.map((t) => ({
    id: t.id,
    title: t.title,
    posts: t.posts.map((p) => ({
      id: p.id,
      body: p.body,
      createdAt: p.createdAt.toISOString(),
      user: { name: p.user.name },
    })),
  }));

  const dbExams = lesson.exams.map((ex) => ({
    id: ex.id,
    title: ex.title,
    questions: ex.questions.map((q) => ({
      id: q.id,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      hint: q.hint,
    })),
  }));

  const initialProgress = lesson.progress[0]
    ? {
        coursDone: lesson.progress[0].coursDone,
        exercicesDone: lesson.progress[0].exercicesDone,
        evaluationDone: lesson.progress[0].evaluationDone,
        evaluationScore: lesson.progress[0].evaluationScore,
      }
    : null;

  const doneCount = [
    initialProgress?.coursDone,
    initialProgress?.exercicesDone,
    initialProgress?.evaluationDone,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={back}
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
        العودة إلى الوحدات
      </Link>

      {/* Hero banner */}
      <div
        className={`animate-fade-in-up overflow-hidden rounded-2xl p-7 text-white shadow-lg ${
          isSci
            ? "bg-gradient-to-l from-teal-600 to-teal-700 shadow-teal-700/20 dark:from-teal-800 dark:to-teal-900"
            : "bg-gradient-to-l from-indigo-600 to-indigo-700 shadow-indigo-700/20 dark:from-indigo-800 dark:to-indigo-900"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">
          {isSci ? "الإيقاظ العلمي" : "الرياضيات"}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 max-w-2xl text-sm opacity-90">{lesson.description}</p>
        )}
        {lesson.videoUrl && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">
            🎥 يحتوي فيديو
          </span>
        )}
        {/* Mini progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex gap-1.5">
            {["الدرس", "التمارين", "التقييم"].map((label, i) => {
              const done = [
                initialProgress?.coursDone,
                initialProgress?.exercicesDone,
                initialProgress?.evaluationDone,
              ][i];
              return (
                <span
                  key={label}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    done
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {done ? "✓ " : ""}{label}
                </span>
              );
            })}
          </div>
          <span className="text-xs opacity-70">{doneCount}/3</span>
        </div>
      </div>

      {/* Four pillars */}
      <div className="animate-fade-in-up stagger-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          المحاور الأربعة للمسار
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          المعرفة، الممارسة، القياس والتواصل — بهذا الترتيب المقترح.
        </p>
        <div className="mt-6">
          <LessonFourPillars
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            subject={lesson.subject}
            courseHtml={lesson.courseHtml}
            videoUrl={lesson.videoUrl}
            description={lesson.description}
            threads={threads}
            initialProgress={initialProgress}
            accentClass={accent}
            dbExams={dbExams}
          />
        </div>
      </div>

      <LessonExtras lessonId={lesson.id} me={{ id: session!.sub, role: session!.role }} />
    </div>
  );
}
