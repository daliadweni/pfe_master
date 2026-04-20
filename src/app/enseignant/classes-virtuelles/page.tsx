import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { LiveClassesManager } from "./ui";

export default async function ClassesVirtuellesPage() {
  const session = await getSession();
  if (!session) return null;

  const classes = await prisma.liveClass.findMany({
    where: { teacherId: session.sub },
    orderBy: { startAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          الحصص الحيّة
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          برمج حصصًا عن بعد عبر Jitsi. تُعلَم تلقائيًا كل التلاميذ.
        </p>
      </div>
      <LiveClassesManager
        initial={classes.map((c) => ({
          id: c.id,
          title: c.title,
          summary: c.summary,
          subject: c.subject,
          startAt: c.startAt.toISOString(),
          durationMinutes: c.durationMinutes,
          meetUrl: c.meetUrl,
        }))}
      />
    </div>
  );
}
