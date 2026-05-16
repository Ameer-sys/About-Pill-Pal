import { CheckCircle, Filter, XCircle } from "lucide-react";
import AppShell from "../components/AppShell";
import { usePillbox } from "../context/usePillbox";
import { formatTime } from "../utils/time";

export default function History() {
  const { events } = usePillbox();
  const taken = events.filter((event) => event.status === "taken").length;
  const missed = events.filter((event) => event.status === "missed").length;
  const adherence = events.length ? Math.round((taken / events.length) * 100) : 0;

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Automatic logs</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Dose history</h1>
              <p className="mt-2 text-slate-500">Every entry comes from a device event, not a manual button.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50">
              <Filter size={18} aria-hidden="true" />
              Filter
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-700">Adherence</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{adherence}%</p>
            </div>
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">Taken</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{taken}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">Missed</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{missed}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {events.map((event) => {
            const isTaken = event.status === "taken";
            const Icon = isTaken ? CheckCircle : XCircle;

            return (
              <div
                key={event.id}
                className="flex flex-col gap-3 border-b border-slate-100 p-5 transition hover:bg-slate-50 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-slate-950">
                    Compartment {event.compartmentId}: {event.medicationName || "Unnamed"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Scheduled {formatTime(event.scheduledTime)} · Logged {event.occurredAt}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                    isTaken ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {isTaken ? "Taken" : "Missed"}
                </span>
              </div>
            );
          })}
        </section>
      </main>
    </AppShell>
  );
}
