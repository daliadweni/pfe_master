export default function LaboratoireOuvertPage() {
  const labs = [
    {
      icon: "⚡",
      title: "الكهرباء",
      desc: "بطاريات، أسلاك، مصابيح — ابنِ دائرتك الكهربائية.",
      color: "teal",
      placeholder: "🔌",
      placeholderText: "محاكي الدوائر الكهربائية",
      features: ["دائرة متسلسلة", "دائرة متوازية", "قياس التيار"],
    },
    {
      icon: "📐",
      title: "هندسة ديناميكية",
      desc: "تلاعب بالأشكال والمساحات والحجوم خارج إطار تمرين مُقيَّم.",
      color: "indigo",
      placeholder: "📊",
      placeholderText: "أداة تصوّر هندسي",
      features: ["المساحات", "الحجوم", "التناظر"],
    },
    {
      icon: "🧲",
      title: "المغناطيس",
      desc: "اكتشف خصائص المغناطيس وتأثيره على الأجسام.",
      color: "rose",
      placeholder: "🧲",
      placeholderText: "محاكي المجال المغناطيسي",
      features: ["القطبان", "التجاذب والتنافر", "البوصلة"],
    },
    {
      icon: "🌱",
      title: "البيئة والنظام الإيكولوجي",
      desc: "تعرّف على التوازن البيئي وسلاسل الغذاء.",
      color: "emerald",
      placeholder: "🌿",
      placeholderText: "محاكي السلسلة الغذائية",
      features: ["المنتجون", "المستهلكون", "المحلّلون"],
    },
  ];

  const colorMap: Record<string, { border: string; from: string; icon: string; text: string; dashed: string; feature: string }> = {
    teal: {
      border: "border-teal-200/80 dark:border-teal-900/60",
      from: "from-teal-50 dark:from-teal-950/20",
      icon: "text-teal-800 dark:text-teal-200",
      text: "text-teal-700/80 dark:text-teal-300/80",
      dashed: "border-teal-300/50 dark:border-teal-700/50 text-teal-600 dark:text-teal-300",
      feature: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
    },
    indigo: {
      border: "border-indigo-200/80 dark:border-indigo-900/60",
      from: "from-indigo-50 dark:from-indigo-950/20",
      icon: "text-indigo-800 dark:text-indigo-200",
      text: "text-indigo-700/80 dark:text-indigo-300/80",
      dashed: "border-indigo-300/50 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-300",
      feature: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
    },
    rose: {
      border: "border-rose-200/80 dark:border-rose-900/60",
      from: "from-rose-50 dark:from-rose-950/20",
      icon: "text-rose-800 dark:text-rose-200",
      text: "text-rose-700/80 dark:text-rose-300/80",
      dashed: "border-rose-300/50 dark:border-rose-700/50 text-rose-600 dark:text-rose-300",
      feature: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    },
    emerald: {
      border: "border-emerald-200/80 dark:border-emerald-900/60",
      from: "from-emerald-50 dark:from-emerald-950/20",
      icon: "text-emerald-800 dark:text-emerald-200",
      text: "text-emerald-700/80 dark:text-emerald-300/80",
      dashed: "border-emerald-300/50 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-300",
      feature: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    },
  };

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
        {labs.map((lab, idx) => {
          const c = colorMap[lab.color];
          return (
            <div
              key={lab.title}
              className={`animate-fade-in-up stagger-${Math.min(idx + 1, 4)} card-hover group overflow-hidden rounded-2xl border bg-gradient-to-br to-white p-6 shadow-sm dark:to-zinc-900 ${c.border} ${c.from}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{lab.icon}</span>
                <h2 className={`font-bold ${c.icon}`}>{lab.title}</h2>
              </div>
              <p className={`mt-2 text-sm ${c.text}`}>{lab.desc}</p>

              {/* Feature tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {lab.features.map((f) => (
                  <span
                    key={f}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${c.feature}`}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Placeholder */}
              <div
                className={`mt-4 flex h-40 items-center justify-center rounded-xl border-2 border-dashed bg-white/50 text-sm dark:bg-zinc-950/20 ${c.dashed}`}
              >
                <div className="text-center">
                  <span className="text-3xl">{lab.placeholder}</span>
                  <p className="mt-2 text-xs">{lab.placeholderText}</p>
                  <span className="mt-2 inline-block rounded-full bg-zinc-200/50 px-3 py-1 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                    قريبًا
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
