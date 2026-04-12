import { MessagingUI } from "@/components/MessagingUI";

export default function EnseignantMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          الرسائل
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          تواصل مع التلاميذ وأولياء الأمور مباشرة.
        </p>
      </div>
      <MessagingUI color="violet" myRole="TEACHER" />
    </div>
  );
}
