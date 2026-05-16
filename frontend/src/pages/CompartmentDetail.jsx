import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BellRing, CheckCircle, RotateCcw, Save, Trash2, XCircle } from "lucide-react";
import AppShell from "../components/AppShell";
import StatusBadge from "../components/StatusBadge";
import { usePillbox } from "../context/usePillbox";
import { formatTime } from "../utils/time";

export default function CompartmentDetail() {
  const navigate = useNavigate();
  const { compartmentId } = useParams();
  const { compartments, saveCompartment, clearCompartment, recordDoseEvent } = usePillbox();
  const compartment = useMemo(
    () => compartments.find((item) => item.id === Number(compartmentId)),
    [compartments, compartmentId],
  );

  if (!compartment) {
    return (
      <AppShell>
        <main className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-bold text-slate-950">Compartment not found</h1>
          <Link to="/dashboard" className="mt-4 inline-flex text-blue-700">
            Back to dashboard
          </Link>
        </main>
      </AppShell>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const medicationName = String(formData.get("medicationName")).trim();
    const time = String(formData.get("time"));

    await saveCompartment(compartment.id, { medicationName: medicationName.trim(), time });
    navigate("/dashboard");
  }

  async function handleClear() {
    await clearCompartment(compartment.id);
    navigate("/dashboard");
  }

  async function handleRecord(status) {
    await recordDoseEvent({
      compartmentId: compartment.id,
      medicationName: compartment.medicationName,
      scheduledTime: compartment.time,
      status,
    });
    navigate("/history");
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to dashboard
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <form
            key={`${compartment.id}-${compartment.medicationName}-${compartment.time}`}
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                  Compartment {compartment.id}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-950">Schedule setup</h1>
              </div>
              <StatusBadge status={compartment.status} />
            </div>

            <label className="mt-8 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Medication or supplement name
              </span>
              <input
                name="medicationName"
                defaultValue={compartment.medicationName}
                placeholder="Example: Vitamin C"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Daily alarm time</span>
              <input
                name="time"
                defaultValue={compartment.time}
                type="time"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </label>

            <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
              <p className="flex items-center gap-2 font-bold">
                <BellRing size={17} aria-hidden="true" />
                Alert behavior
              </p>
              <p className="mt-1">
                At {formatTime(compartment.time)}, the LED for this compartment turns on, buzzer and vibration run,
                and the reed switch is monitored for 2 hours.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-lg font-black text-white transition hover:bg-blue-700">
                <Save size={18} aria-hidden="true" />
                Save schedule
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-red-200 px-5 py-3 font-black text-red-700 transition hover:bg-red-50"
              >
                <Trash2 size={18} aria-hidden="true" />
                Clear
              </button>
            </div>
          </form>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
              <RotateCcw size={30} aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Daily repeat</h2>
            <p className="mt-3 text-slate-300">
              Every enabled compartment repeats daily at the saved time. The pillbox uses its reed
              switch to confirm when the correct lid is opened.
            </p>
            <div className="mt-6 rounded-lg bg-white/10 p-4 text-sm text-slate-200">
              The app does not allow manual taken logging because the reed switch is the source of truth.
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 p-4">
              <p className="font-bold">Hardware testing</p>
              <p className="mt-1 text-sm text-slate-300">
                Use these only while wiring the ESP32 to confirm history, streaks, and notifications.
              </p>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={() => handleRecord("taken")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 font-black text-white"
                >
                  <CheckCircle size={18} aria-hidden="true" />
                  Test Taken
                </button>
                <button
                  type="button"
                  onClick={() => handleRecord("missed")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 font-black text-white"
                >
                  <XCircle size={18} aria-hidden="true" />
                  Test Missed
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
