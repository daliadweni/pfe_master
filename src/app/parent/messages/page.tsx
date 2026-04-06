import { MessagesClient } from "./ui";

export default function ParentMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          تواصل داعم
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          أرسل تشجيعات وتعليقات بنّاءة. يتلقى التلميذ إشعارًا داخليًا.
        </p>
      </div>
      <MessagesClient />
    </div>
  );
}
