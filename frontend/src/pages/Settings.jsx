import { Bell, Mail, Save, Smartphone, UserRoundCheck } from "lucide-react";
import AppShell from "../components/AppShell";
import { usePillbox } from "../context/usePillbox";

export default function Settings() {
  const { settings, updateSettings } = usePillbox();

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await updateSettings({
      deviceName: String(formData.get("deviceName")).trim() || "My Pillbox",
      caregiverEmail: String(formData.get("caregiverEmail")).trim(),
      caregiverEnabled: formData.has("caregiverEnabled"),
      userNotifications: formData.has("userNotifications"),
      emailNotifications: formData.has("emailNotifications"),
    });
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          key={`${settings.deviceName}-${settings.caregiverEmail}-${settings.caregiverEnabled}-${settings.userNotifications}-${settings.emailNotifications}`}
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_0.8fr]"
        >
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Settings</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">Device and caregiver</h1>
            <p className="mt-2 text-slate-500">
              Keep the app simple for the user, while caregiver alerts only trigger when a dose is missed.
            </p>

            <label className="mt-8 block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Device name</span>
              <input
                name="deviceName"
                defaultValue={settings.deviceName}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail size={17} aria-hidden="true" />
                Caregiver email
              </span>
              <input
                name="caregiverEmail"
                type="email"
                defaultValue={settings.caregiverEmail}
                placeholder="caregiver@example.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <div className="mt-6 grid gap-3">
              <ToggleRow
                icon={UserRoundCheck}
                name="caregiverEnabled"
                label="Enable caregiver missed-dose emails"
                defaultChecked={settings.caregiverEnabled}
              />
              <ToggleRow
                icon={Smartphone}
                name="userNotifications"
                label="User browser notifications"
                defaultChecked={settings.userNotifications}
              />
              <ToggleRow
                icon={Bell}
                name="emailNotifications"
                label="User missed-dose email"
                defaultChecked={settings.emailNotifications}
              />
            </div>

            <button className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 sm:w-auto">
              <Save size={18} aria-hidden="true" />
              Save settings
            </button>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Notification logic</h2>
            <div className="mt-5 space-y-4">
              <LogicStep title="At alarm time" body="LED, buzzer, and vibration activate for the correct compartment." />
              <LogicStep title="After 15 minutes" body="Second alert runs if the reed switch has not confirmed opening." />
              <LogicStep title="After 2 hours" body="Dose is marked missed, then user and caregiver notifications can be sent." />
            </div>
          </aside>
        </form>
      </main>
    </AppShell>
  );
}

function ToggleRow({ icon: Icon, name, label, defaultChecked }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
      <span className="flex items-center gap-3 font-semibold text-slate-700">
        <Icon size={19} className="text-blue-700" aria-hidden="true" />
        {label}
      </span>
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-5 w-5" />
    </label>
  );
}

function LogicStep({ title, body }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  );
}
