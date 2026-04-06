import { prisma } from "@/lib/db";

export default async function SuiviPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      progress: { include: { lesson: true } },
      userBadges: { include: { badge: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          متابعة التلاميذ
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          التقدم حسب الدرس والشارات المفتوحة.
        </p>
      </div>

      <div className="space-y-5">
        {students.map((s, sIdx) => (
          <section
            key={s.id}
            className={`animate-fade-in-up stagger-${Math.min(sIdx + 1, 4)} rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-sm font-bold text-white">
                {s.name[0]}
              </div>
              <div>
                <h2 className="font-bold text-zinc-900 dark:text-zinc-100">
                  {s.name}
                </h2>
                <p className="text-xs text-zinc-500" dir="ltr">
                  {s.email}
                </p>
              </div>
            </div>

            {s.userBadges.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">الشارات</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {s.userBadges.map((ub) => (
                    <li
                      key={ub.id}
                      className="flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 dark:bg-violet-950/40 dark:text-violet-200"
                    >
                      🏆 {ub.badge.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b-2 border-zinc-100 dark:border-zinc-800">
                    <th className="px-3 py-2.5 text-right font-semibold text-zinc-700 dark:text-zinc-300">الدرس</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">المحتوى</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">التمارين</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">التقييم</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">الدرجة</th>
                  </tr>
                </thead>
                <tbody>
                  {s.progress.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-3 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                        {p.lesson.title}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {p.coursDone ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">✓</span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {p.exercicesDone ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">✓</span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {p.evaluationDone ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">✓</span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center" dir="ltr">
                        {p.evaluationScore != null ? (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            p.evaluationScore >= 70
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                          }`}>
                            {p.evaluationScore}%
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {s.progress.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-zinc-400">
                        لا يوجد تقدم مسجّل.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
