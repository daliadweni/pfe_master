import Link from "next/link";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function EleveAccueil() {
  const session = await getSession();
  if (!session) return null;

  const badges = await prisma.userBadge.findMany({
    where: { userId: session.sub },
    include: { badge: true },
  });

  const progressCount = await prisma.progress.count({
    where: {
      userId: session.sub,
      OR: [
        { coursDone: true },
        { exercicesDone: true },
        { evaluationDone: true },
      ],
    },
  });

  const portfolioCount = await prisma.portfolioItem.count({
    where: { userId: session.sub },
  });

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          مرحبًا، {session.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          الأهداف والإنتاجات والمسار — اختر مادة للبدء.
        </p>
      </div>

      <NotificationsPanel />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="animate-fade-in-up stagger-1 group rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm transition-all hover:shadow-md dark:border-teal-900/60 dark:from-teal-950/30 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-lg dark:bg-teal-900/50">📈</span>
            <div>
              <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                أنشطة مسجّلة
              </p>
              <p className="text-2xl font-bold text-teal-950 dark:text-teal-50">
                {progressCount}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-teal-700/70 dark:text-teal-300/70">
            خطوات تقدّم في المسار
          </p>
        </div>
        <div className="animate-fade-in-up stagger-2 group rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm transition-all hover:shadow-md dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg dark:bg-indigo-900/50">🎨</span>
            <div>
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                أعمال في المعرض
              </p>
              <p className="text-2xl font-bold text-indigo-950 dark:text-indigo-50">
                {portfolioCount}
              </p>
            </div>
          </div>
          <Link href="/eleve/portfolio" className="mt-2 inline-block text-xs font-medium text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400">
            عرض المعرض
          </Link>
        </div>
        <div className="animate-fade-in-up stagger-3 group rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm transition-all hover:shadow-md dark:border-amber-900/60 dark:from-amber-950/30 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-900/50">🏆</span>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                شارات مفتوحة
              </p>
              <p className="text-2xl font-bold text-amber-950 dark:text-amber-50">
                {badges.length}
              </p>
            </div>
          </div>
          {badges.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1">
              {badges.map((b) => (
                <li key={b.id} className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  {b.badge.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Subject cards */}
      <div className="grid gap-5 md:grid-cols-2">
        <Link
          href="/eleve/eveil-scientifique"
          className="animate-fade-in-up stagger-3 group relative overflow-hidden rounded-2xl border-2 border-teal-200/50 bg-white p-7 shadow-sm transition-all hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10 dark:border-teal-900/50 dark:bg-zinc-900 dark:hover:border-teal-600"
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-teal-100/50 blur-2xl transition-all group-hover:bg-teal-200/50 dark:bg-teal-900/20 dark:group-hover:bg-teal-800/30" />
          <div className="relative">
            <span className="text-3xl">🔬</span>
            <h2 className="mt-3 text-xl font-bold text-teal-800 dark:text-teal-200">
              واجهة الإيقاظ العلمي
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              مختبرات افتراضية: كهرباء، مغناطيس، بيئات…
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-600 dark:text-teal-400">
              ابدأ التعلّم
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 rotate-180 transition group-hover:-translate-x-1">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </Link>
        <Link
          href="/eleve/mathematiques"
          className="animate-fade-in-up stagger-4 group relative overflow-hidden rounded-2xl border-2 border-indigo-200/50 bg-white p-7 shadow-sm transition-all hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-indigo-900/50 dark:bg-zinc-900 dark:hover:border-indigo-600"
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-indigo-100/50 blur-2xl transition-all group-hover:bg-indigo-200/50 dark:bg-indigo-900/20 dark:group-hover:bg-indigo-800/30" />
          <div className="relative">
            <span className="text-3xl">🔢</span>
            <h2 className="mt-3 text-xl font-bold text-indigo-800 dark:text-indigo-200">
              واجهة الرياضيات
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              مسائل، كسور، مساحات وحجوم.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              ابدأ التعلّم
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 rotate-180 transition group-hover:-translate-x-1">
                <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
