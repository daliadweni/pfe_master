import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const kindLabel: Record<string, string> = {
  SCHEMA: "مخطط",
  AUDIO: "صوت",
  AUTRE: "أخرى",
};

const kindIcon: Record<string, string> = {
  SCHEMA: "📐",
  AUDIO: "🎙️",
  AUTRE: "📎",
};

export default async function ParentPortfolioPage() {
  const session = await getSession();
  const parent = await prisma.user.findUnique({
    where: { id: session!.sub },
    select: { linkedStudentId: true },
  });

  const items = parent?.linkedStudentId
    ? await prisma.portfolioItem.findMany({
        where: { userId: parent.linkedStudentId },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          معرض أعمال الطفل
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          تصفّح إنجازات طفلك من مخططات وتسجيلات ومشاريع.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it, idx) => (
          <article
            key={it.id}
            className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)} group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{kindIcon[it.kind] ?? "📎"}</span>
              <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {kindLabel[it.kind] ?? it.kind}
              </span>
            </div>
            <h2 className="mt-3 font-bold text-zinc-800 dark:text-zinc-100">
              {it.title}
            </h2>
            {it.description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {it.description}
              </p>
            )}
          </article>
        ))}
      </div>
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 py-12 dark:border-zinc-700">
          <span className="text-4xl">🎨</span>
          <p className="text-sm text-zinc-500">لا توجد أعمال للعرض.</p>
        </div>
      )}
    </div>
  );
}
