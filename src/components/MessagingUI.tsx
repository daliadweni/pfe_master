"use client";

import { useEffect, useState, useRef } from "react";

type Contact = {
  id: string;
  name: string;
  role: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  fromUser: { name: string; role: string };
  fromUserId?: string;
};

const ROLE_LABELS: Record<string, string> = {
  TEACHER: "معلّم",
  STUDENT: "تلميذ",
  PARENT: "ولي أمر",
};

type ThemeColor = "teal" | "violet" | "rose";

const THEME: Record<
  ThemeColor,
  {
    bubble: string;
    bubbleText: string;
    input: string;
    btn: string;
    accent: string;
    active: string;
  }
> = {
  teal: {
    bubble: "bg-teal-600 dark:bg-teal-700",
    bubbleText: "text-teal-100",
    input:
      "focus:border-teal-400 focus:ring-teal-400/20 dark:focus:border-teal-500 dark:focus:ring-teal-500/20",
    btn: "bg-teal-600 hover:bg-teal-500 dark:bg-teal-700 dark:hover:bg-teal-600",
    accent: "text-teal-600 dark:text-teal-400",
    active: "bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800",
  },
  violet: {
    bubble: "bg-violet-600 dark:bg-violet-700",
    bubbleText: "text-violet-100",
    input:
      "focus:border-violet-400 focus:ring-violet-400/20 dark:focus:border-violet-500 dark:focus:ring-violet-500/20",
    btn: "bg-violet-600 hover:bg-violet-500 dark:bg-violet-700 dark:hover:bg-violet-600",
    accent: "text-violet-600 dark:text-violet-400",
    active: "bg-violet-50 border-violet-200 dark:bg-violet-900/30 dark:border-violet-800",
  },
  rose: {
    bubble: "bg-rose-600 dark:bg-rose-700",
    bubbleText: "text-rose-100",
    input:
      "focus:border-rose-400 focus:ring-rose-400/20 dark:focus:border-rose-500 dark:focus:ring-rose-500/20",
    btn: "bg-rose-600 hover:bg-rose-500 dark:bg-rose-700 dark:hover:bg-rose-600",
    accent: "text-rose-600 dark:text-rose-400",
    active: "bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800",
  },
};

export function MessagingUI({
  color = "teal",
  myRole,
}: {
  color?: ThemeColor;
  myRole: string;
}) {
  const theme = THEME[color];
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadContacts() {
    const res = await fetch("/api/messages/contacts");
    if (res.ok) {
      const data = (await res.json()) as { contacts: Contact[] };
      setContacts(data.contacts);
    }
    setLoadingContacts(false);
  }

  async function loadMessages(contactId: string) {
    setLoadingMsgs(true);
    const res = await fetch(`/api/messages?contactId=${contactId}`);
    if (res.ok) {
      const data = (await res.json()) as { messages: Msg[] };
      setMessages(data.messages);
    }
    setLoadingMsgs(false);
  }

  useEffect(() => {
    void loadContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      void loadMessages(activeContact.id);
    }
  }, [activeContact]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function selectContact(c: Contact) {
    setActiveContact(c);
    setMobileShowChat(true);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !activeContact) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: activeContact.id, body }),
    });
    if (res.ok) {
      setBody("");
      void loadMessages(activeContact.id);
      void loadContacts();
    }
  }

  if (loadingContacts) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <div
          className={`h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-current ${theme.accent}`}
        />
        جاري التحميل…
      </div>
    );
  }

  return (
    <div className="flex h-[32rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Contacts sidebar */}
      <div
        className={`w-full shrink-0 border-l border-zinc-200 dark:border-zinc-800 sm:w-72 ${
          mobileShowChat ? "hidden sm:block" : "block"
        }`}
      >
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            جهات الاتصال
          </h3>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(32rem - 3rem)" }}>
          {contacts.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-400">
              لا توجد جهات اتصال
            </div>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => selectContact(c)}
                className={`flex w-full items-start gap-3 border-b border-zinc-50 px-4 py-3 text-right transition hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50 ${
                  activeContact?.id === c.id ? theme.active : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                    c.role === "TEACHER"
                      ? "bg-violet-500"
                      : c.role === "STUDENT"
                        ? "bg-teal-500"
                        : "bg-rose-500"
                  }`}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {ROLE_LABELS[c.role] ?? c.role}
                    </span>
                  </div>
                  {c.lastMessage && (
                    <p className="mt-0.5 truncate text-xs text-zinc-400">
                      {c.lastMessage}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div
        className={`flex flex-1 flex-col ${
          mobileShowChat ? "block" : "hidden sm:flex"
        }`}
      >
        {!activeContact ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-zinc-400">
            <span className="text-4xl">💬</span>
            <p className="text-sm">اختر جهة اتصال لبدء المحادثة</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <button
                onClick={() => setMobileShowChat(false)}
                className="text-zinc-400 transition hover:text-zinc-700 sm:hidden dark:hover:text-zinc-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                  activeContact.role === "TEACHER"
                    ? "bg-violet-500"
                    : activeContact.role === "STUDENT"
                      ? "bg-teal-500"
                      : "bg-rose-500"
                }`}
              >
                {activeContact.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {activeContact.name}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {ROLE_LABELS[activeContact.role] ?? activeContact.role}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-8">
                  <div
                    className={`h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-current ${theme.accent}`}
                  />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-zinc-400">
                  <span className="text-2xl">👋</span>
                  <p className="text-sm">لا توجد رسائل بعد — ابدأ المحادثة!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.fromUser.role === myRole;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 text-sm ${
                          isMine
                            ? `rounded-tl-sm ${theme.bubble} text-white`
                            : "rounded-tr-sm border border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50"
                        }`}
                      >
                        <p
                          className={`text-[10px] font-bold ${
                            isMine ? theme.bubbleText : "text-zinc-500"
                          }`}
                        >
                          {m.fromUser.name} ·{" "}
                          {ROLE_LABELS[m.fromUser.role] ?? m.fromUser.role}
                        </p>
                        <p className="mt-1">{m.body}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Send form */}
            <form
              onSubmit={(e) => void send(e)}
              className="flex gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800"
            >
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={1}
                className={`flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:bg-white focus:outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-800 ${theme.input}`}
                placeholder="اكتب رسالتك…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(e);
                  }
                }}
                required
              />
              <button
                type="submit"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition ${theme.btn}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 rotate-180"
                >
                  <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
