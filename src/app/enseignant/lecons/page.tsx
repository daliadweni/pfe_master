import { prisma } from "@/lib/db";
import { NewLessonForm } from "./ui";

export default async function LeconsPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: [{ subject: "asc" }, { sequenceOrder: "asc" }],
  });

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          الدروس والتسلسلات
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          نشر محتوى متعدد الوسائط مرتب بالمادة وترتيب الحصص.
        </p>
      </div>

      <NewLessonForm />

      <ul className="space-y-3">
        {lessons.map((l, idx) => (
          <li
            key={l.id}
            className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)}`}
          >
            <div className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  l.subject === "SCIENCE"
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                    : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                }`}
              >
                {l.sequenceOrder}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-zinc-800 dark:text-zinc-100">{l.title}</p>
                <p className="text-xs text-zinc-500">
                  {l.subject === "SCIENCE" ? "🔬 الإيقاظ العلمي" : "🔢 الرياضيات"}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
