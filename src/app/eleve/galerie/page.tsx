import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function GaleriePage() {
  const session = await getSession();
  if (!session) return null;

  const items = await prisma.portfolioItem.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { user: { select: { id: true, name: true } } },
  });

  const kindIcon: Record<string, string> = {
    SCHEMA: "📐",
    AUDIO: "🎙️",
    IMAGE: "🖼️",
    VIDEO: "🎞️",
    AUTRE: "📎",
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          المتحف الافتراضي
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          استكشف إنتاجات زملائك: مخططات علميّة، تسجيلات، ورسوم هندسيّة.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, idx) => (
          <article
            key={it.id}
            className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)} group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{kindIcon[it.kind] ?? "📎"}</span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {it.kind}
              </span>
            </div>
            <h3 className="mt-3 font-bold text-zinc-800 dark:text-zinc-100">{it.title}</h3>
            {it.description && (
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{it.description}</p>
            )}
            {it.fileUrl && (
              <div className="mt-3">
                {it.kind === "IMAGE" ? (
                  <img src={it.fileUrl} alt={it.title} className="max-h-48 w-full rounded-lg object-cover" />
                ) : it.kind === "AUDIO" ? (
                  <audio controls src={it.fileUrl} className="w-full" />
                ) : it.kind === "VIDEO" ? (
                  <video controls src={it.fileUrl} className="max-h-48 w-full rounded-lg" />
                ) : (
                  <a href={it.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-300">
                    فتح الملف
                  </a>
                )}
              </div>
            )}
            <p className="mt-3 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800">
              بقلم <span className="font-medium text-zinc-700 dark:text-zinc-300">{it.user.name}</span>
            </p>
          </article>
        ))}
        {items.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
            لا توجد أعمال عموميّة بعد.
          </div>
        )}
      </div>
    </div>
  );
}
