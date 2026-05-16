import BottomNav from "./BottomNav";
import Navbar from "./Navbar";
import Toast from "./Toast";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7fbff] pb-24 text-slate-900 lg:pb-0">
      <Navbar />
      <Toast />
      {children}
      <BottomNav />
    </div>
  );
}
