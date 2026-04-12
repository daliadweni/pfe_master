import { prisma } from "@/lib/db";
import { ExamBankUI } from "./ui";

export default async function ExamsPage() {
  const [exams, lessons] = await Promise.all([
    prisma.exam.findMany({
      orderBy: [{ subject: "asc" }, { createdAt: "desc" }],
      include: {
        lesson: { select: { id: true, title: true } },
        questions: { orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] },
        _count: { select: { questions: true } },
      },
    }),
    prisma.lesson.findMany({
      orderBy: [{ subject: "asc" }, { sequenceOrder: "asc" }],
      select: { id: true, title: true, subject: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          بنك الاختبارات
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          إنشاء اختبارات تحتوي على أسئلة متنوعة وربطها بالدروس.
        </p>
      </div>

      <ExamBankUI
        initialExams={exams.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
          questions: e.questions.map((q) => ({
            ...q,
            createdAt: q.createdAt.toISOString(),
          })),
        }))}
        lessons={lessons}
      />
    </div>
  );
}
