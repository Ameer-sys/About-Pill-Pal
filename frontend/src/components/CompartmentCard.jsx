import { Link } from "react-router-dom";
import { BellRing, CalendarCheck, Clock, Pill, Settings } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatTime } from "../utils/time";

export default function CompartmentCard({ compartment }) {
  const isActive = compartment.status === "active";

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.5rem] border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isActive ? "border-amber-300 ring-4 ring-amber-100" : "border-slate-200"
      }`}
    >
      {isActive && (
        <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-amber-400" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Compartment {compartment.id}</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-900">
            <Pill size={22} aria-hidden="true" />
            {compartment.medicationName || `Slot ${compartment.id}`}
          </h2>
        </div>

        <StatusBadge status={compartment.status} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Clock size={15} aria-hidden="true" />
            Time
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">{formatTime(compartment.time)}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <CalendarCheck size={15} aria-hidden="true" />
            Repeat
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {compartment.enabled ? "Daily" : "Off"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">
        <p className="flex items-center gap-2 font-semibold">
          <BellRing size={16} aria-hidden="true" />
          Alert window
        </p>
        <p className="mt-1 text-blue-700">Tracks reed switch openings for 2 hours after alarm time.</p>
      </div>

      <Link
        to={`/compartments/${compartment.id}`}
        className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-lg font-black text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        <Settings size={18} aria-hidden="true" />
        Set / Edit Schedule
      </Link>
    </article>
  );
}
