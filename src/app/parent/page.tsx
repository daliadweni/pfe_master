import Link from "next/link";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const kindLabel: Record<string, string> = {
  SCHEMA: "مخطط",
  AUDIO: "صوت",
  AUTRE: "أخرى",
};

export default async function ParentAccueil() {
  const session = await getSession();
  if (!session) return null;

  const parent = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      linkedStudent: {
        include: {
          progress: { include: { lesson: true } },
          portfolio: { orderBy: { createdAt: "desc" }, take: 6 },
          userBadges: { include: { badge: true } },
        },
      },
    },
  });

  const child = parent?.linkedStudent;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          متابعة الطفل
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          استعرض النتائج والإنتاجات وإشعارات الوساطة.
        </p>
      </div>

      <NotificationsPanel />

      {!child ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 py-12 dark:border-zinc-700">
          <span className="text-4xl">👤</span>
          <p className="text-zinc-500">لا يوجد تلميذ مرتبط بهذا الحساب.</p>
        </div>
      ) : (
        <>
          {/* Child info */}
          <section className="animate-fade-in-up stagger-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-lg font-bold text-white">
                {child.name[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {child.name}
                </h2>
                <p className="text-xs text-zinc-500" dir="ltr">
                  {child.email}
                </p>
              </div>
            </div>

            {/* Badges */}
            {child.userBadges.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  الشارات
                </h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {child.userBadges.map((ub) => (
                    <li
                      key={ub.id}
                      className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
                    >
                      🏆 {ub.badge.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress table */}
            <div className="mt-6 overflow-x-auto">
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
                  {child.progress.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-3 py-3 font-medium text-zinc-800 dark:text-zinc-200">{p.lesson.title}</td>
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
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent works */}
          <section className="animate-fade-in-up stagger-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                أعمال حديثة
              </h2>
              <Link href="/parent/portfolio" className="text-sm font-medium text-rose-600 hover:text-rose-800 dark:text-rose-400">
                كل الأعمال →
              </Link>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {child.portfolio.map((it) => (
                <li
                  key={it.id}
                  className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 transition hover:border-zinc-200 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                  <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {kindLabel[it.kind] ?? it.kind}
                  </span>
                  <p className="mt-2 font-medium text-zinc-800 dark:text-zinc-200">{it.title}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
