import { Bell, CalendarDays, Flame, Mail, Medal, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import AppShell from "../components/AppShell";
import { usePillbox } from "../context/usePillbox";

const week = [
  { day: "Mon", done: true },
  { day: "Tue", done: true },
  { day: "Wed", done: true },
  { day: "Thu", done: true },
  { day: "Fri", done: false },
  { day: "Sat", done: false },
  { day: "Sun", done: false },
];

export default function Rewards() {
  const { events, settings } = usePillbox();
  const taken = events.filter((event) => event.status === "taken").length;
  const missed = events.filter((event) => event.status === "missed").length;
  const adherence = events.length ? Math.round((taken / events.length) * 100) : 100;
  const streak = missed === 0 ? Math.max(3, taken) : Math.max(1, taken);

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-400 p-6 text-white shadow-xl shadow-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-white/80">Current streak</p>
                <h1 className="mt-2 text-6xl font-black">{streak}</h1>
                <p className="mt-1 text-xl font-bold">days protected</p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white/20">
                <Flame size={44} aria-hidden="true" />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-7 gap-2">
              {week.map((item) => (
                <div
                  key={item.day}
                  className={`rounded-2xl p-3 text-center ${item.done ? "bg-white text-blue-700" : "bg-white/15 text-white/80"}`}
                >
                  <p className="text-xs font-black">{item.day}</p>
                  <div className="mt-2 flex justify-center">
                    {item.done ? <ShieldCheck size={20} aria-hidden="true" /> : <CalendarDays size={20} aria-hidden="true" />}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 rounded-2xl bg-white/15 p-4 text-sm font-semibold leading-6">
              Keep every scheduled dose on track today to extend the streak and protect the weekly score.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Trophy size={30} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-slate-500">Progress</p>
                <h2 className="text-2xl font-black text-slate-950">Adherence score: {adherence}%</h2>
              </div>
            </div>

            <div className="mt-6 h-5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-700"
                style={{ width: `${adherence}%` }}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <RewardCard icon={Medal} title="Steady Starter" body="Complete your first 3-day streak." active />
              <RewardCard icon={Bell} title="On Time" body="Take every scheduled dose today." active={adherence >= 90} />
              <RewardCard icon={Sparkles} title="Care Circle" body="Keep caregiver alerts configured." active={settings.caregiverEnabled} />
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-blue-700">
                <Mail size={18} aria-hidden="true" />
                Daily email summary
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Tonight&apos;s summary preview</h2>
              <p className="mt-2 text-slate-500">
                A calm end-of-day message can summarize taken doses, missed doses, streak status, and tomorrow&apos;s schedule.
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
              Ready when email is connected
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="font-black text-slate-950">Subject: Your Chrono-Pill day is complete</p>
            <p className="mt-3 leading-7 text-slate-600">
              You protected a {streak}-day streak. {taken} dose{taken === 1 ? "" : "s"} logged as taken,
              {` ${missed}`} missed. Tomorrow&apos;s first reminder is ready in {settings.deviceName}.
            </p>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function RewardCard({ icon: Icon, title, body, active }) {
  return (
    <article className={`rounded-2xl border p-4 ${active ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50 opacity-70"}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${active ? "bg-blue-600 text-white" : "bg-white text-slate-400"}`}>
        <Icon size={23} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
    </article>
  );
}
