import { EleveNav } from "@/components/EleveNav";
import { getSession } from "@/lib/session";

export default async function EleveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-full flex-1 bg-zinc-50 dark:bg-[var(--background)]">
      <EleveNav userName={session?.name} />
      <main className="mx-auto max-w-6xl flex-1 px-5 py-8">
        {children}
      </main>
    </div>
  );
}
