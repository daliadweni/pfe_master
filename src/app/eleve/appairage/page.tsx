import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { PairingCodeClient } from "./ui";

export default async function AppairagePage() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { pairingCode: true },
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          ربط حساب وليّ الأمر
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          أنشئ رمز ربط سرّيًّا وشاركه مع وليّ أمرك ليتمكّن من متابعة تقدّمك.
        </p>
      </div>
      <PairingCodeClient initialCode={user?.pairingCode ?? null} />
    </div>
  );
}
