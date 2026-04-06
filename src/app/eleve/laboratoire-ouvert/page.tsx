export default function LaboratoireOuvertPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          المختبر المفتوح
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          فضاء حر لتجربة المحاكيات دون تقييم — يشجّع الفضول والتجريب.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="animate-fade-in-up stagger-1 group overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm transition-all hover:shadow-md dark:border-teal-900/60 dark:from-teal-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="font-bold text-teal-800 dark:text-teal-200">الكهرباء</h2>
          </div>
          <p className="mt-2 text-sm text-teal-700/80 dark:text-teal-300/80">
            بطاريات، أسلاك، مصابيح — ابنِ دائرتك الكهربائية.
          </p>
          <div className="mt-4 flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-teal-300/50 bg-white/50 text-sm text-teal-600 dark:border-teal-700/50 dark:bg-teal-950/20 dark:text-teal-300">
            <div className="text-center">
              <span className="text-2xl">🔌</span>
              <p className="mt-2 text-xs">محاكي للتضمين (iframe أو WebGL)</p>
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up stagger-2 group overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-all hover:shadow-md dark:border-indigo-900/60 dark:from-indigo-950/20 dark:to-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📐</span>
            <h2 className="font-bold text-indigo-800 dark:text-indigo-200">
              هندسة ديناميكية
            </h2>
          </div>
          <p className="mt-2 text-sm text-indigo-700/80 dark:text-indigo-300/80">
            تلاعب بالأشكال والمساحات والحجوم خارج إطار تمرين مُقيَّم.
          </p>
          <div className="mt-4 flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-indigo-300/50 bg-white/50 text-sm text-indigo-600 dark:border-indigo-700/50 dark:bg-indigo-950/20 dark:text-indigo-300">
            <div className="text-center">
              <span className="text-2xl">📊</span>
              <p className="mt-2 text-xs">أداة تصوّر للتضمين</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
