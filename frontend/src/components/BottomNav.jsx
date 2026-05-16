import { NavLink } from "react-router-dom";
import { HeartPulse, Home, Medal, Settings } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/history", label: "Logs", icon: HeartPulse },
  { to: "/rewards", label: "Streak", icon: Medal },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-3 pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              <Icon size={23} aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
