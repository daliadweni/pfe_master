import { PortfolioClient } from "./ui";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          معرض الأعمال
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          اعرض مخططاتك أو تسجيلاتك أو إنتاجاتك: يعزّز الشعور بالإنجاز.
        </p>
      </div>
      <PortfolioClient />
    </div>
  );
}
