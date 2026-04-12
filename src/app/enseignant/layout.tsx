import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSession } from "@/lib/session";

export default async function EnseignantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-full flex-1 bg-zinc-50 dark:bg-[var(--background)]">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-sm font-black text-white shadow-sm">
              ج
            </div>
            <div>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">مساحة المعلّم</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {session?.name}
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1.5 text-sm">
            <Link
              href="/enseignant"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              الرئيسية
            </Link>
            <Link
              href="/enseignant/lecons"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              الدروس
            </Link>
            <Link
              href="/enseignant/questions"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              الاختبارات
            </Link>
            <Link
              href="/enseignant/suivi"
              className="rounded-lg px-3 py-1.5 font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              المتابعة
            </Link>
            <Link
              href="/enseignant/messages"
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
