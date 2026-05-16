import { CheckCircle } from "lucide-react";
import { usePillbox } from "../context/usePillbox";

export default function Toast() {
  const { feedback } = usePillbox();

  if (!feedback) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 animate-slide-in rounded-lg border border-green-200 bg-white px-4 py-3 shadow-xl">
      <p className="flex items-center gap-2 text-sm font-semibold text-green-700">
        <CheckCircle size={18} aria-hidden="true" />
        {feedback}
      </p>
    </div>
  );
}
