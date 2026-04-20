import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { AppointmentsPanel } from "@/components/AppointmentsPanel";

export default async function EleveRendezVousPage() {
  const session = await getSession();
  if (!session) return null;

  const [appointments, contacts] = await Promise.all([
    prisma.appointment.findMany({
      where: { OR: [{ fromUserId: session.sub }, { toUserId: session.sub }] },
      orderBy: { proposedAt: "asc" },
      include: {
        fromUser: { select: { id: true, name: true, role: true } },
        toUser: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          مواعيد الدعم الفردي
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          اطلب جلسة دعم فردية مع أحد معلّميك.
        </p>
      </div>
      <AppointmentsPanel
        me={{ id: session.sub, role: session.role }}
        appointments={appointments.map((a) => ({
          id: a.id,
          title: a.title,
          message: a.message,
          proposedAt: a.proposedAt.toISOString(),
          durationMinutes: a.durationMinutes,
          status: a.status,
          responseMessage: a.responseMessage,
          fromUser: a.fromUser,
          toUser: a.toUser,
        }))}
        contacts={contacts}
      />
    </div>
  );
}
