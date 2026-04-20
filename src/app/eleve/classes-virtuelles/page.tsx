import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function EleveClassesVirtuellesPage() {
  const session = await getSession();
  if (!session) return null;

  const now = new Date();
  const classes = await prisma.liveClass.findMany({
    where: { startAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
    orderBy: { startAt: "asc" },
    include: { teacher: { select: { id: true, name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          الحصص الحيّة
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          انضمّ إلى الحصص المباشرة مع معلّمك في المادة التي تختار.
        </p>
      </div>

      <ul className="space-y-3">
        {classes.map((c) => {
          const start = new Date(c.startAt);
          const end = new Date(start.getTime() + c.durationMinutes * 60_000);
          const isLive = start.getTime() <= now.getTime() && now.getTime() <= end.getTime();
          return (
            <li
              key={c.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-zinc-900 ${
                isLive
                  ? "border-emerald-300 ring-2 ring-emerald-200 dark:border-emerald-700 dark:ring-emerald-900/40"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.subject === "SCIENCE"
                          ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                      }`}
                    >
                      {c.subject === "SCIENCE" ? "إيقاظ علمي" : "رياضيات"}
                    </span>
                    <span className="text-xs text-zinc-500">{c.durationMinutes} د</span>
                    {isLive && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        مباشر الآن
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-bold text-zinc-900 dark:text-zinc-100">{c.title}</h3>
                  {c.summary && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{c.summary}</p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    مع <span className="font-medium text-zinc-700 dark:text-zinc-300">{c.teacher.name}</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-500" dir="ltr">
                    {start.toLocaleString("ar-TN", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                </div>
                <a
                  href={c.meetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-violet-700"
                >
                  الانضمام
                </a>
              </div>
            </li>
          );
        })}
        {classes.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-zinc-200 p-8 text-center text-zinc-500 dark:border-zinc-700">
            لا توجد حصص مُبرمجة حاليًا.
          </li>
        )}
      </ul>
    </div>
  );
}
