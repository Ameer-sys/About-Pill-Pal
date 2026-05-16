import { Bell, CheckCircle, Clock, Flame, ShieldAlert, Wifi } from "lucide-react";
import AppShell from "../components/AppShell";
import CompartmentCard from "../components/CompartmentCard";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/useAuth";
import { usePillbox } from "../context/usePillbox";
import { formatTime, getTodayLabel } from "../utils/time";

export default function Dashboard() {
  const { displayName } = useAuth();
  const { compartments, events, settings, isPillboxLoading, pillboxError } = usePillbox();
  const scheduledCount = compartments.filter((compartment) => compartment.enabled).length;
  const takenCount = compartments.filter((compartment) => compartment.status === "taken").length;
  const missedCount = compartments.filter((compartment) => compartment.status === "missed").length;
  const nextDose = compartments.find((compartment) => compartment.enabled && compartment.status !== "taken");
  const streak = missedCount === 0 ? Math.max(3, takenCount) : Math.max(1, takenCount);

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {pillboxError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-bold">We could not load your pillbox.</p>
            <p className="mt-1 text-sm">Please check your connection and refresh the page.</p>
          </div>
        )}

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="animate-fade-up rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-green-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="online" />
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm">
                <Bell size={15} aria-hidden="true" />
                Missed-dose notifications ready
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">
              Today&apos;s medication flow
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              {displayName ? `Welcome back, ${displayName}. ` : ""}
              Set schedules, monitor the pillbox, and review automatic reed-switch logging.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
              <span className="rounded-lg bg-white px-3 py-2 shadow-sm">{getTodayLabel()}</span>
              <span className="rounded-lg bg-white px-3 py-2 shadow-sm">{settings.deviceName}</span>
              <span className="rounded-lg bg-white px-3 py-2 shadow-sm">
                {isPillboxLoading ? "Loading your pillbox..." : "Ready for today"}
              </span>
            </div>
          </div>

          <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm [animation-delay:120ms]">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Next dose</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {nextDose ? formatTime(nextDose.time) : "All clear"}
            </p>
            <p className="mt-2 text-slate-500">
              {nextDose
                ? `Compartment ${nextDose.id}: ${nextDose.medicationName || "Unnamed medicine"}`
                : "No remaining enabled doses for today."}
            </p>
            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              First alert runs light, buzzer, and vibration. The second alert happens after 15 minutes.
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatCard label="Scheduled today" value={scheduledCount} icon={Clock} tone="white" />
          <StatCard label="Taken" value={takenCount} icon={CheckCircle} tone="green" />
          <StatCard label="Missed" value={missedCount} icon={ShieldAlert} tone="red" />
          <StatCard label="Logs saved" value={events.length} icon={Wifi} tone="blue" />
          <StatCard label="Streak" value={`${streak} days`} icon={Flame} tone="amber" />
        </section>

        <section className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Five compartments</h2>
            <p className="text-slate-500">Choose a compartment, add the name, and set the daily reminder time.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {compartments.map((compartment) => (
            <CompartmentCard key={compartment.id} compartment={compartment} />
          ))}
        </section>
      </main>
    </AppShell>
  );
}
