"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";

const links = [
  { href: "/eleve", label: "الرئيسية", exact: true },
  {
    href: "/eleve/eveil-scientifique",
    label: "الإيقاظ العلمي",
    color:
      "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200",
    activeColor:
      "bg-teal-100 text-teal-900 dark:bg-teal-900/50 dark:text-teal-100",
  },
  {
    href: "/eleve/mathematiques",
    label: "الرياضيات",
    color:
      "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
    activeColor:
      "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100",
  },
  { href: "/eleve/laboratoire-ouvert", label: "مختبر مفتوح" },
  { href: "/eleve/portfolio", label: "معرض الأعمال" },
  { href: "/eleve/messages", label: "الرسائل" },
];

export function EleveNav({ userName }: { userName: string | undefined }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-sm font-black text-white shadow-sm">
            ج
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
              مساحة التلميذ
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {userName}
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1.5 text-sm md:flex">
          {links.map((l) => {
            const active = isActive(l.href, l.exact);
            const baseClass =
              "rounded-lg px-3 py-1.5 font-medium transition";

            if (l.color) {
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`${baseClass} ${
                    active ? l.activeColor + " shadow-sm" : l.color
                  } hover:shadow-sm`}
                >
                  {l.label}
                </Link>
              );
            }

            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${baseClass} ${
                  active
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="mx-1.5 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
          <SearchOverlay />
          <ThemeToggle />
          <SignOutButton />
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <SearchOverlay />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2 10a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="animate-slide-in-down border-t border-zinc-100 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const active = isActive(l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
