import { ActivityFeed } from "./ui";

export default function ParentActivitePage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          النشاط المباشر
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          استعرض آخر تفاعلات طفلك مع الدروس والأعمال والتعليقات في الوقت الفعلي.
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
