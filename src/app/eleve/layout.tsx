import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSession } from "@/lib/session";

export default async function EleveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-full flex-1 bg-zinc-50 dark:bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-sm font-black text-white shadow-sm">
              ج
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">مساحة التلميذ</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {session?.name}
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1.5 text-sm">
            <Link
              href="/eleve"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              الرئيسية
            </Link>
            <Link
              href="/eleve/eveil-scientifique"
              className="rounded-lg bg-teal-50 px-3 py-1.5 font-medium text-teal-800 transition hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-200 dark:hover:bg-teal-950/60"
            >
              الإيقاظ العلمي
            </Link>
            <Link
              href="/eleve/mathematiques"
              className="rounded-lg bg-indigo-50 px-3 py-1.5 font-medium text-indigo-800 transition hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/60"
            >
              الرياضيات
            </Link>
            <Link
              href="/eleve/laboratoire-ouvert"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              مختبر مفتوح
            </Link>
            <Link
              href="/eleve/portfolio"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              معرض الأعمال
            </Link>
            <Link
              href="/eleve/messages"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              الرسائل
            </Link>
            <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
            <ThemeToggle />
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
