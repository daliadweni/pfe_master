import Link from "next/link";

export default function EnseignantAccueil() {
  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          لوحة التحكم
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-500 dark:text-zinc-400">
          إدارة المحتوى والتمارين ومتابعة التلاميذ. كل وحدة مبنية على أربعة محاور: الدرس،
          التمارين، التقييم، التفاعل.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Link
          href="/enseignant/lecons"
          className="animate-fade-in-up stagger-1 group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-violet-100/50 blur-2xl transition-all group-hover:bg-violet-200/50 dark:bg-violet-900/20" />
          <div className="relative">
            <span className="text-2xl">📚</span>
            <h2 className="mt-3 font-bold text-zinc-900 dark:text-zinc-100">إدارة المحتوى</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              رفع وتنظيم التسلسلات التعليمية.
            </p>
          </div>
        </Link>
        <div className="animate-fade-in-up stagger-2 relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-amber-100/50 blur-2xl dark:bg-amber-900/20" />
          <div className="relative">
            <span className="text-2xl">🧩</span>
            <h2 className="mt-3 font-bold text-zinc-900 dark:text-zinc-100">بنك الأسئلة</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              إنشاء تمارين وتقييمات متنوعة (اختيار من متعدد، صواب/خطأ، ملء فراغ، ترتيب، توصيل).
            </p>
          </div>
        </div>
        <Link
          href="/enseignant/suivi"
          className="animate-fade-in-up stagger-3 group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl transition-all group-hover:bg-emerald-200/50 dark:bg-emerald-900/20" />
          <div className="relative">
            <span className="text-2xl">📊</span>
            <h2 className="mt-3 font-bold text-zinc-900 dark:text-zinc-100">إحصائيات التقدم</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              تحليل تقدم كل تلميذ.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
