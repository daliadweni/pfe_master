import Link from "next/link";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={
      "h-4 w-4 rotate-180 transition "
      + "group-hover:-translate-x-1"
    }
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d={
        "M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 "
        + "0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5"
        + "-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75"
        + ".75 0 0 1 17 10Z"
      }
    />
  </svg>
);

export default async function EleveAccueil() {
  const session = await getSession();
  if (!session) return null;

  const [badges, progressList, portfolioCount, totalLessons] =
    await Promise.all([
      prisma.userBadge.findMany({
        where: { userId: session.sub },
        include: { badge: true },
      }),
      prisma.progress.findMany({
        where: { userId: session.sub },
      }),
      prisma.portfolioItem.count({
        where: { userId: session.sub },
      }),
      prisma.lesson.count(),
    ]);

  const completedSteps = progressList.reduce((acc, p) => {
    return (
      acc +
      (p.coursDone ? 1 : 0) +
      (p.exercicesDone ? 1 : 0) +
      (p.evaluationDone ? 1 : 0)
    );
  }, 0);

  const fullyCompleted = progressList.filter(
    (p) => p.coursDone && p.exercicesDone && p.evaluationDone,
  ).length;

  const scored = progressList.filter(
    (p) => p.evaluationScore != null,
  );
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce(
            (sum, p) => sum + (p.evaluationScore ?? 0),
            0,
          ) / scored.length,
        )
      : null;

  const xp =
    completedSteps * 25 + badges.length * 50 + portfolioCount * 10;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const overallPct =
    totalLessons > 0
      ? Math.round((fullyCompleted / totalLessons) * 100)
      : 0;

  const greetingTime = new Date().getHours();
  const greeting =
    greetingTime < 12
      ? "صباح الخير"
      : greetingTime < 17
        ? "مساء الخير"
        : "مساء النور";

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className={
        "animate-fade-in-up relative overflow-hidden "
        + "rounded-2xl bg-gradient-to-l from-teal-600 "
        + "via-teal-700 to-indigo-700 p-7 text-white "
        + "shadow-lg shadow-teal-700/20 dark:from-teal-800 "
        + "dark:via-teal-900 dark:to-indigo-900"
      }>
        <div className={
          "pointer-events-none absolute -left-20 -top-20 "
          + "h-60 w-60 rounded-full bg-white/5 blur-3xl"
        } />
        <div className={
          "pointer-events-none absolute -bottom-10 right-10 "
          + "h-40 w-40 rounded-full bg-white/5 blur-2xl"
        } />
        <div className={
          "relative flex flex-col gap-6 sm:flex-row "
          + "sm:items-center sm:justify-between"
        }>
          <div>
            <p className="text-sm font-medium text-teal-200">
              {greeting}
            </p>
            <h1 className="mt-1 text-3xl font-bold">
              {session.name?.split(" ")[0]} 👋
            </h1>
            <p className={
              "mt-2 max-w-md text-sm text-teal-100/90"
            }>
              لديك {totalLessons - fullyCompleted} درس متبقي
              — واصل التقدّم!
            </p>
          </div>

          {/* XP & Level */}
          <div className={
            "flex items-center gap-4 rounded-xl "
            + "bg-white/10 px-5 py-3 backdrop-blur-sm"
          }>
            <div className={
              "flex h-12 w-12 items-center justify-center "
              + "rounded-xl bg-white/20 text-lg "
              + "font-black shadow-inner"
            }>
              {level}
            </div>
            <div className="min-w-[120px]">
              <div className={
                "flex items-center justify-between "
                + "text-xs text-teal-100"
              }>
                <span>المستوى {level}</span>
                <span>{xpInLevel}/100 XP</span>
              </div>
              <div className={
                "mt-1.5 h-2 overflow-hidden "
                + "rounded-full bg-white/20"
              }>
                <div
                  className={
                    "animate-progress-fill h-full "
                    + "rounded-full bg-gradient-to-l "
                    + "from-amber-300 to-amber-400"
                  }
                  style={{ width: `${xpInLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="relative mt-6">
          <div className={
            "flex items-center justify-between "
            + "text-xs text-teal-200"
          }>
            <span>التقدّم العام</span>
            <span>{overallPct}%</span>
          </div>
          <div className={
            "mt-1.5 h-2.5 overflow-hidden "
            + "rounded-full bg-white/15"
          }>
            <div
              className={
                "animate-progress-fill h-full "
                + "rounded-full bg-white/80"
              }
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      </div>

      <NotificationsPanel />

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={
          "animate-fade-in-up stagger-1 card-hover "
          + "rounded-2xl border border-teal-200/80 "
          + "bg-gradient-to-br from-teal-50 to-white p-5 "
          + "shadow-sm dark:border-teal-900/60 "
          + "dark:from-teal-950/30 dark:to-zinc-900"
        }>
          <div className="flex items-center gap-3">
            <span className={
              "flex h-10 w-10 items-center justify-center "
              + "rounded-xl bg-teal-100 text-lg "
              + "dark:bg-teal-900/50"
            }>
              📈
            </span>
            <div>
              <p className={
                "text-sm font-medium text-teal-800 "
                + "dark:text-teal-200"
              }>
                خطوات مكتملة
              </p>
              <p className={
                "text-2xl font-bold text-teal-950 "
                + "dark:text-teal-50"
              }>
                {completedSteps}
              </p>
            </div>
          </div>
          <p className={
            "mt-2 text-xs text-teal-700/70 "
            + "dark:text-teal-300/70"
          }>
            من أصل {totalLessons * 3} خطوة
          </p>
        </div>

        <div className={
          "animate-fade-in-up stagger-2 card-hover "
          + "rounded-2xl border border-indigo-200/80 "
          + "bg-gradient-to-br from-indigo-50 to-white p-5 "
          + "shadow-sm dark:border-indigo-900/60 "
          + "dark:from-indigo-950/30 dark:to-zinc-900"
        }>
          <div className="flex items-center gap-3">
            <span className={
              "flex h-10 w-10 items-center justify-center "
              + "rounded-xl bg-indigo-100 text-lg "
              + "dark:bg-indigo-900/50"
            }>
              🎨
            </span>
            <div>
              <p className={
                "text-sm font-medium text-indigo-800 "
                + "dark:text-indigo-200"
              }>
                أعمال في المعرض
              </p>
              <p className={
                "text-2xl font-bold text-indigo-950 "
                + "dark:text-indigo-50"
              }>
                {portfolioCount}
              </p>
            </div>
          </div>
          <Link
            href="/eleve/portfolio"
            className={
              "mt-2 inline-block text-xs font-medium "
              + "text-indigo-600 underline "
              + "hover:text-indigo-800 dark:text-indigo-400"
            }
          >
            عرض المعرض
          </Link>
        </div>

        <div className={
          "animate-fade-in-up stagger-3 card-hover "
          + "rounded-2xl border border-amber-200/80 "
          + "bg-gradient-to-br from-amber-50 to-white p-5 "
          + "shadow-sm dark:border-amber-900/60 "
          + "dark:from-amber-950/30 dark:to-zinc-900"
        }>
          <div className="flex items-center gap-3">
            <span className={
              "flex h-10 w-10 items-center justify-center "
              + "rounded-xl bg-amber-100 text-lg "
              + "dark:bg-amber-900/50"
            }>
              🏆
            </span>
            <div>
              <p className={
                "text-sm font-medium text-amber-800 "
                + "dark:text-amber-200"
              }>
                شارات مفتوحة
              </p>
              <p className={
                "text-2xl font-bold text-amber-950 "
                + "dark:text-amber-50"
              }>
                {badges.length}
              </p>
            </div>
          </div>
          {badges.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1">
              {badges.map((b) => (
                <li
                  key={b.id}
                  className={
                    "rounded-full bg-amber-100 px-2 py-0.5 "
                    + "text-[10px] font-medium text-amber-800 "
                    + "dark:bg-amber-900/50 dark:text-amber-200"
                  }
                >
                  🏆 {b.badge.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={
          "animate-fade-in-up stagger-4 card-hover "
          + "rounded-2xl border border-emerald-200/80 "
          + "bg-gradient-to-br from-emerald-50 to-white p-5 "
          + "shadow-sm dark:border-emerald-900/60 "
          + "dark:from-emerald-950/30 dark:to-zinc-900"
        }>
          <div className="flex items-center gap-3">
            <span className={
              "flex h-10 w-10 items-center justify-center "
              + "rounded-xl bg-emerald-100 text-lg "
              + "dark:bg-emerald-900/50"
            }>
              📊
            </span>
            <div>
              <p className={
                "text-sm font-medium text-emerald-800 "
                + "dark:text-emerald-200"
              }>
                متوسط الدرجة
              </p>
              <p className={
                "text-2xl font-bold text-emerald-950 "
                + "dark:text-emerald-50"
              }>
                {avgScore != null ? `${avgScore}%` : "—"}
              </p>
            </div>
          </div>
          <p className={
            "mt-2 text-xs text-emerald-700/70 "
            + "dark:text-emerald-300/70"
          }>
            {avgScore != null && avgScore >= 70
              ? "أداء ممتاز!"
              : "واصل المحاولة"}
          </p>
        </div>
      </div>

      {/* Subject cards */}
      <h2 className={
        "animate-fade-in-up text-lg font-bold "
        + "text-zinc-900 dark:text-zinc-50"
      }>
        اختر مادة للبدء
      </h2>
      <div className="grid gap-5 md:grid-cols-2">
        <Link
          href="/eleve/eveil-scientifique"
          className={
            "animate-fade-in-up stagger-3 group relative "
            + "overflow-hidden rounded-2xl border-2 "
            + "border-teal-200/50 bg-white p-7 shadow-sm "
            + "transition-all hover:border-teal-400 "
            + "hover:shadow-lg hover:shadow-teal-500/10 "
            + "dark:border-teal-900/50 dark:bg-zinc-900 "
            + "dark:hover:border-teal-600"
          }
        >
          <div className={
            "pointer-events-none absolute -left-10 -top-10 "
            + "h-32 w-32 rounded-full bg-teal-100/50 "
            + "blur-2xl transition-all "
            + "group-hover:bg-teal-200/50 "
            + "dark:bg-teal-900/20 "
            + "dark:group-hover:bg-teal-800/30"
          } />
          <div className="relative">
            <span className="text-3xl">🔬</span>
            <h2 className={
              "mt-3 text-xl font-bold text-teal-800 "
              + "dark:text-teal-200"
            }>
              واجهة الإيقاظ العلمي
            </h2>
            <p className={
              "mt-2 text-sm text-zinc-500 dark:text-zinc-400"
            }>
              مختبرات افتراضية: كهرباء، مغناطيس، بيئات…
            </p>
            <span className={
              "mt-4 inline-flex items-center gap-1 "
              + "text-sm font-semibold text-teal-600 "
              + "dark:text-teal-400"
            }>
              ابدأ التعلّم
              <ArrowIcon />
            </span>
          </div>
        </Link>
        <Link
          href="/eleve/mathematiques"
          className={
            "animate-fade-in-up stagger-4 group relative "
            + "overflow-hidden rounded-2xl border-2 "
            + "border-indigo-200/50 bg-white p-7 shadow-sm "
            + "transition-all hover:border-indigo-400 "
            + "hover:shadow-lg hover:shadow-indigo-500/10 "
            + "dark:border-indigo-900/50 dark:bg-zinc-900 "
            + "dark:hover:border-indigo-600"
          }
        >
          <div className={
            "pointer-events-none absolute -left-10 -top-10 "
            + "h-32 w-32 rounded-full bg-indigo-100/50 "
            + "blur-2xl transition-all "
            + "group-hover:bg-indigo-200/50 "
            + "dark:bg-indigo-900/20 "
            + "dark:group-hover:bg-indigo-800/30"
          } />
          <div className="relative">
            <span className="text-3xl">🔢</span>
            <h2 className={
              "mt-3 text-xl font-bold text-indigo-800 "
              + "dark:text-indigo-200"
            }>
              واجهة الرياضيات
            </h2>
            <p className={
              "mt-2 text-sm text-zinc-500 dark:text-zinc-400"
            }>
              مسائل، كسور، مساحات وحجوم.
            </p>
            <span className={
              "mt-4 inline-flex items-center gap-1 "
              + "text-sm font-semibold text-indigo-600 "
              + "dark:text-indigo-400"
            }>
              ابدأ التعلّم
              <ArrowIcon />
            </span>
          </div>
        </Link>
      </div>

      {/* Quick access */}
      <div className={
        "animate-fade-in-up stagger-4 "
        + "grid gap-3 sm:grid-cols-3"
      }>
        <Link
          href="/eleve/laboratoire-ouvert"
          className={
            "card-hover flex items-center gap-3 "
            + "rounded-2xl border border-zinc-200 "
            + "bg-white p-4 shadow-sm "
            + "dark:border-zinc-800 dark:bg-zinc-900"
          }
        >
          <span className={
            "flex h-10 w-10 items-center justify-center "
            + "rounded-xl bg-violet-50 text-lg "
            + "dark:bg-violet-950/40"
          }>
            🧪
          </span>
          <div>
            <p className={
              "text-sm font-semibold text-zinc-800 "
              + "dark:text-zinc-100"
            }>
              المختبر المفتوح
            </p>
            <p className="text-xs text-zinc-500">
              تجارب حرة
            </p>
          </div>
        </Link>
        <Link
          href="/eleve/portfolio"
          className={
            "card-hover flex items-center gap-3 "
            + "rounded-2xl border border-zinc-200 "
            + "bg-white p-4 shadow-sm "
            + "dark:border-zinc-800 dark:bg-zinc-900"
          }
        >
          <span className={
            "flex h-10 w-10 items-center justify-center "
            + "rounded-xl bg-rose-50 text-lg "
            + "dark:bg-rose-950/40"
          }>
            🎨
          </span>
          <div>
            <p className={
              "text-sm font-semibold text-zinc-800 "
              + "dark:text-zinc-100"
            }>
              معرض الأعمال
            </p>
            <p className="text-xs text-zinc-500">
              {portfolioCount} عمل
            </p>
          </div>
        </Link>
        <Link
          href="/eleve/messages"
          className={
            "card-hover flex items-center gap-3 "
            + "rounded-2xl border border-zinc-200 "
            + "bg-white p-4 shadow-sm "
            + "dark:border-zinc-800 dark:bg-zinc-900"
          }
        >
          <span className={
            "flex h-10 w-10 items-center justify-center "
            + "rounded-xl bg-cyan-50 text-lg "
            + "dark:bg-cyan-950/40"
          }>
            💬
          </span>
          <div>
            <p className={
              "text-sm font-semibold text-zinc-800 "
              + "dark:text-zinc-100"
            }>
              الرسائل
            </p>
            <p className="text-xs text-zinc-500">
              تواصل مع المعلّم
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
