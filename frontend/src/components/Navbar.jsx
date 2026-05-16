import { Link, NavLink, useNavigate } from "react-router-dom";
import { Activity, History, LogOut, Medal, Pill, Settings, ShieldCheck } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: Activity },
  { to: "/history", label: "History", icon: History },
  { to: "/rewards", label: "Streak", icon: Medal },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const { user, displayName } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Pill size={24} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">Chrono-Pill</p>
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <ShieldCheck size={14} aria-hidden="true" />
              Smart adherence system
            </p>
          </div>
        </Link>

        <nav className="hidden flex-wrap items-center gap-2 lg:flex">
          {user && (
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
              Hi, {displayName || "there"}
            </span>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
          {user && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut size={18} aria-hidden="true" />
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
