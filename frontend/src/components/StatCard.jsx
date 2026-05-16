export default function StatCard({ label, value, icon: Icon, tone = "blue" }) {
  const toneStyles = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    white: "border-slate-200 bg-white text-slate-700",
  };

  return (
    <article className={`rounded-lg border p-5 shadow-sm ${toneStyles[tone]}`}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        {Icon && <Icon size={18} aria-hidden="true" />}
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>
    </article>
  );
}
