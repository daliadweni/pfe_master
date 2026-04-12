"use client";

/* ─── XP Level Bar ─── */
export function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForNext = level * 100;
  const pct = Math.min((xp / xpForNext) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-black text-white shadow-md shadow-indigo-500/25">
        {level}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold gradient-text">
            المستوى {level}
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {xp}/{xpForNext} XP
          </span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="animate-progress-fill h-full rounded-full bg-gradient-to-l from-indigo-500 to-purple-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Daily Streak ─── */
export function StreakCounter({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-2xl ${days > 0 ? "animate-streak" : ""}`}>
        {days > 0 ? "🔥" : "❄️"}
      </span>
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          سلسلة يومية
        </p>
        <p className="text-lg font-black text-amber-600 dark:text-amber-400">
          {days} {days === 1 ? "يوم" : "أيام"}
        </p>
      </div>
    </div>
  );
}

/* ─── Achievement Badge Display ─── */
export function BadgeShowcase({
  badges,
}: {
  badges: { id: string; name: string; icon?: string }[];
}) {
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-6 dark:border-zinc-700">
        <span className="text-2xl opacity-40">🏆</span>
        <p className="text-xs text-zinc-400">أكمل الدروس للحصول على شارات</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b, i) => (
        <div
          key={b.id}
          className={`animate-confetti stagger-${Math.min(i + 1, 6)} group relative flex items-center gap-1.5 rounded-full border border-amber-200 bg-gradient-to-l from-amber-50 to-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-sm transition-all hover:shadow-md dark:border-amber-800 dark:from-amber-950/40 dark:to-amber-900/30 dark:text-amber-200`}
        >
          <span>{b.icon ?? "🏆"}</span>
          {b.name}
        </div>
      ))}
    </div>
  );
}

/* ─── Quick Stats Card ─── */
export function StatCard({
  icon,
  label,
  value,
  sub,
  color = "teal",
  href,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: "teal" | "indigo" | "amber" | "rose" | "violet" | "emerald";
  href?: string;
}) {
  const colorMap = {
    teal: "border-teal-200/80 from-teal-50 to-white dark:border-teal-900/60 dark:from-teal-950/30 dark:to-zinc-900",
    indigo:
      "border-indigo-200/80 from-indigo-50 to-white dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-zinc-900",
    amber:
      "border-amber-200/80 from-amber-50 to-white dark:border-amber-900/60 dark:from-amber-950/30 dark:to-zinc-900",
    rose: "border-rose-200/80 from-rose-50 to-white dark:border-rose-900/60 dark:from-rose-950/30 dark:to-zinc-900",
    violet:
      "border-violet-200/80 from-violet-50 to-white dark:border-violet-900/60 dark:from-violet-950/30 dark:to-zinc-900",
    emerald:
      "border-emerald-200/80 from-emerald-50 to-white dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-zinc-900",
  };

  const iconBg = {
    teal: "bg-teal-100 dark:bg-teal-900/50",
    indigo: "bg-indigo-100 dark:bg-indigo-900/50",
    amber: "bg-amber-100 dark:bg-amber-900/50",
    rose: "bg-rose-100 dark:bg-rose-900/50",
    violet: "bg-violet-100 dark:bg-violet-900/50",
    emerald: "bg-emerald-100 dark:bg-emerald-900/50",
  };

  const textColor = {
    teal: "text-teal-800 dark:text-teal-200",
    indigo: "text-indigo-800 dark:text-indigo-200",
    amber: "text-amber-800 dark:text-amber-200",
    rose: "text-rose-800 dark:text-rose-200",
    violet: "text-violet-800 dark:text-violet-200",
    emerald: "text-emerald-800 dark:text-emerald-200",
  };

  const numColor = {
    teal: "text-teal-950 dark:text-teal-50",
    indigo: "text-indigo-950 dark:text-indigo-50",
    amber: "text-amber-950 dark:text-amber-50",
    rose: "text-rose-950 dark:text-rose-50",
    violet: "text-violet-950 dark:text-violet-50",
    emerald: "text-emerald-950 dark:text-emerald-50",
  };

  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      {...(href ? { href } : {})}
      className={`card-hover rounded-2xl border bg-gradient-to-br p-5 shadow-sm ${colorMap[color]} ${href ? "block" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconBg[color]}`}
        >
          {icon}
        </span>
        <div>
          <p className={`text-sm font-medium ${textColor[color]}`}>{label}</p>
          <p className={`text-2xl font-bold ${numColor[color]}`}>{value}</p>
        </div>
      </div>
      {sub && (
        <p
          className={`mt-2 text-xs ${textColor[color]} opacity-70`}
        >
          {sub}
        </p>
      )}
    </Wrapper>
  );
}

/* ─── Circular Progress Ring ─── */
export function ProgressRing({
  percent,
  size = 48,
  stroke = 4,
  color = "teal",
}: {
  percent: number;
  size?: number;
  stroke?: number;
  color?: "teal" | "indigo" | "amber" | "emerald";
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const strokeColor = {
    teal: "#0d9488",
    indigo: "#6366f1",
    amber: "#f59e0b",
    emerald: "#10b981",
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-zinc-200 dark:text-zinc-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor[color]}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
        {Math.round(percent)}%
      </span>
    </div>
  );
}
