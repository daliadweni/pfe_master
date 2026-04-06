"use client";

import { useEffect, useState } from "react";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  fromUser: { name: string; role: string };
};

export function MessagesClient() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = (await res.json()) as { messages: Msg[] };
      setMessages(data.messages);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      setBody("");
      void load();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-rose-500" />
        جاري التحميل…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Messages list */}
      <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-3xl">💬</span>
            <p className="text-sm text-zinc-500">لا توجد رسائل بعد.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isParent = m.fromUser.role === "PARENT";
            return (
              <div
                key={m.id}
                className={`animate-slide-in flex ${isParent ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 text-sm ${
                    isParent
                      ? "rounded-tr-sm bg-rose-600 text-white dark:bg-rose-700"
                      : "rounded-tl-sm border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50"
                  }`}
                >
                  <p className={`text-[10px] font-bold ${isParent ? "text-rose-100" : "text-zinc-500"}`}>
                    {m.fromUser.name} · {isParent ? "أنت" : "التلميذ"}
                  </p>
                  <p className="mt-1">{m.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Send form */}
      <form onSubmit={(e) => void send(e)} className="flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={1}
          className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-rose-500 dark:focus:ring-rose-500/20"
          placeholder="أحسنت في… / هل فكّرت في…"
          required
        />
        <button
          type="submit"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white transition hover:bg-rose-500 dark:bg-rose-700 dark:hover:bg-rose-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 rotate-180">
            <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
