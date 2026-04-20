"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type AppointmentStatus = "PENDING" | "ACCEPTED" | "REFUSED" | "CANCELLED";
export type ApptRole = "TEACHER" | "STUDENT" | "PARENT";

export type AppointmentRow = {
  id: string;
  title: string;
  message: string | null;
  proposedAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  responseMessage: string | null;
  fromUser: { id: string; name: string; role: ApptRole };
  toUser: { id: string; name: string; role: ApptRole };
};

export type Contact = { id: string; name: string; role: ApptRole };

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "قيد الانتظار",
  ACCEPTED: "مقبول",
  REFUSED: "مرفوض",
  CANCELLED: "ملغى",
};

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  ACCEPTED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  REFUSED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  CANCELLED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const ROLE_LABEL: Record<ApptRole, string> = {
  TEACHER: "معلّم",
  STUDENT: "تلميذ",
  PARENT: "ولي أمر",
};

export function AppointmentsPanel({
  me,
  appointments,
  contacts,
}: {
  me: { id: string; role: ApptRole };
  appointments: AppointmentRow[];
  contacts: Contact[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(appointments);
  const [toUserId, setToUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [proposedAt, setProposedAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId,
          title,
          message,
          proposedAt: new Date(proposedAt).toISOString(),
          durationMinutes,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMsg(data.error ?? "خطأ");
        return;
      }
      setTitle("");
      setMessage("");
      setProposedAt("");
      setMsg("تم إرسال الدعوة.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const data = (await res.json()) as { appointment: AppointmentRow };
      setItems((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: data.appointment.status } : a)),
      );
    }
  }

  const input =
    "mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm transition focus:border-indigo-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800";

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => void create(e)}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="font-bold text-zinc-900 dark:text-zinc-100">اقتراح موعد</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">المستقبِل</label>
            <select value={toUserId} onChange={(e) => setToUserId(e.target.value)} required className={input}>
              <option value="" disabled>— اختر —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({ROLE_LABEL[c.role]})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">المدة (دقائق)</label>
            <input type="number" min={10} max={180} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className={input} dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">الموضوع</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">الموعد المقترح</label>
            <input type="datetime-local" value={proposedAt} onChange={(e) => setProposedAt(e.target.value)} required className={input} dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">رسالة</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className={input} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={busy} className="rounded-xl bg-gradient-to-l from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-60">
            {busy ? "جاري…" : "إرسال الدعوة"}
          </button>
          {msg && <span className="text-sm text-emerald-600 dark:text-emerald-400">{msg}</span>}
        </div>
      </form>

      <ul className="space-y-3">
        {items.map((a) => {
          const iAmRecipient = a.toUser.id === me.id;
          const iAmSender = a.fromUser.id === me.id;
          const other = iAmRecipient ? a.fromUser : a.toUser;
          return (
            <li key={a.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[a.status]}`}>
                      {STATUS_LABEL[a.status]}
                    </span>
                    <span className="text-xs text-zinc-500">{a.durationMinutes} د</span>
                  </div>
                  <h3 className="mt-2 font-bold text-zinc-900 dark:text-zinc-100">{a.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {iAmRecipient ? "من: " : "إلى: "}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{other.name}</span>
                    <span className="text-zinc-400"> ({ROLE_LABEL[other.role]})</span>
                  </p>
                  {a.message && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{a.message}</p>}
                  <p className="mt-2 text-xs text-zinc-500" dir="ltr">
                    {new Date(a.proposedAt).toLocaleString("ar-TN", { dateStyle: "full", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {a.status === "PENDING" && iAmRecipient && (
                    <>
                      <button onClick={() => void updateStatus(a.id, "ACCEPTED")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
                        قبول
                      </button>
                      <button onClick={() => void updateStatus(a.id, "REFUSED")} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
                        رفض
                      </button>
                    </>
                  )}
                  {a.status === "PENDING" && iAmSender && (
                    <button onClick={() => void updateStatus(a.id, "CANCELLED")} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                      إلغاء
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-zinc-200 p-8 text-center text-zinc-500 dark:border-zinc-700">
            لا توجد مواعيد.
          </li>
        )}
      </ul>
    </div>
  );
}
