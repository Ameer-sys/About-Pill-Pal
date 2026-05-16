import { CheckCircle, Clock, Pill, Radio, XCircle, Zap } from "lucide-react";

const statusConfig = {
  empty: {
    label: "Empty",
    icon: Pill,
    styles: "bg-slate-100 text-slate-700 border-slate-200",
  },
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    styles: "bg-blue-100 text-blue-700 border-blue-200",
  },
  taken: {
    label: "Taken",
    icon: CheckCircle,
    styles: "bg-green-100 text-green-700 border-green-200",
  },
  missed: {
    label: "Missed",
    icon: XCircle,
    styles: "bg-red-100 text-red-700 border-red-200",
  },
  active: {
    label: "Alerting",
    icon: Zap,
    styles: "bg-amber-100 text-amber-800 border-amber-200",
  },
  online: {
    label: "Device Online",
    icon: Radio,
    styles: "bg-green-100 text-green-700 border-green-200",
  },
};

export default function StatusBadge({ status }) {
  const currentStatus = statusConfig[status] ?? statusConfig.empty;
  const Icon = currentStatus.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${currentStatus.styles}`}>
      <Icon size={15} aria-hidden="true" />
      {currentStatus.label}
    </span>
  );
}
