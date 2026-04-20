import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { ParentPairingClient } from "./ui";

export default async function ParentAppairagePage() {
  const session = await getSession();
  if (!session) return null;

  const parent = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { linkedStudent: { select: { id: true, name: true, email: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          ربط حساب الطفل
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          أدخِل رمز الربط الذي أنشأه طفلك في حسابه لتتمكّن من متابعة تقدّمه.
        </p>
      </div>
      <ParentPairingClient
        linkedStudent={
          parent?.linkedStudent
            ? { id: parent.linkedStudent.id, name: parent.linkedStudent.name, email: parent.linkedStudent.email }
            : null
        }
      />
    </div>
  );
}
