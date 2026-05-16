import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthLoading, isLoggedIn } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ShieldCheck className="mx-auto animate-pulse text-blue-600" size={42} aria-hidden="true" />
          <p className="mt-4 text-lg font-bold text-slate-950">Checking your account...</p>
          <p className="mt-2 text-slate-500">This only takes a moment.</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
