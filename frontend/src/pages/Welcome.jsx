import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BellRing, CheckCircle, ChevronLeft, ChevronRight, Pill, ShieldCheck, Sparkles } from "lucide-react";

const slides = [
  {
    title: "Simple daily reminders",
    body: "Set one clear time for each compartment. Large controls make the routine easy to understand.",
    icon: BellRing,
    tone: "from-blue-500 to-cyan-400",
  },
  {
    title: "Physical confirmation",
    body: "The pillbox detects when the correct lid opens, so the app knows when a dose was actually taken.",
    icon: CheckCircle,
    tone: "from-green-500 to-emerald-400",
  },
  {
    title: "Caregiver peace of mind",
    body: "Missed-dose alerts and daily summaries help families stay informed without constant check-ins.",
    icon: ShieldCheck,
    tone: "from-indigo-500 to-blue-400",
  },
];

const workflow = [
  "Set time",
  "Box alerts",
  "Lid opens",
  "Log updates",
];

export default function Welcome() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];
  const SlideIcon = slide.icon;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  function goToSlide(direction) {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#eef6f8] text-slate-950">
      <main className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1fr] lg:px-8">
        <section className="order-2 animate-fade-up lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            <Sparkles size={18} aria-hidden="true" />
            Smart medication support
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            A pillbox experience that feels calm, clear, and caring.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Chrono-Pill combines a connected 5-compartment box with an easy app for reminders,
            confirmation, history, streaks, and caregiver support.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="rounded-2xl bg-blue-600 px-7 py-4 text-center text-lg font-black text-white shadow-xl shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-2xl bg-white px-7 py-4 text-center text-lg font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              I Have an Account
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-4 gap-2">
            {workflow.map((item, index) => (
              <div key={item} className="rounded-2xl bg-white p-3 text-center shadow-sm">
                <p className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
                  {index + 1}
                </p>
                <p className="mt-2 text-xs font-black text-slate-700 sm:text-sm">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="order-1 animate-fade-up lg:order-2">
          <div className="mx-auto max-w-sm rounded-[2.2rem] border-[10px] border-slate-950 bg-white p-4 shadow-2xl sm:max-w-md">
            <div className="mx-auto mb-3 h-6 w-28 rounded-full bg-slate-950" />
            <div className="overflow-hidden rounded-[1.6rem] bg-slate-50">
              <div className={`bg-gradient-to-br ${slide.tone} p-5 text-white transition`}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => goToSlide(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={22} aria-hidden="true" />
                  </button>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <SlideIcon size={30} aria-hidden="true" />
                  </div>
                  <button
                    onClick={() => goToSlide(1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={22} aria-hidden="true" />
                  </button>
                </div>

                <h2 className="mt-8 text-3xl font-black">{slide.title}</h2>
                <p className="mt-3 min-h-20 text-sm leading-6 text-white/90">{slide.body}</p>

                <div className="mt-6 flex gap-2">
                  {slides.map((item, index) => (
                    <button
                      key={item.title}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2 flex-1 rounded-full ${index === activeSlide ? "bg-white" : "bg-white/30"}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500">Today</p>
                    <p className="text-2xl font-black text-slate-950">4 of 5 ready</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <Pill size={25} aria-hidden="true" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((slot) => (
                    <div
                      key={slot}
                      className={`h-20 rounded-2xl p-2 ${
                        slot === 2
                          ? "animate-pulse bg-amber-100 text-amber-700"
                          : slot === 4
                            ? "bg-green-100 text-green-700"
                            : "bg-white text-slate-500 shadow-sm"
                      }`}
                    >
                      <p className="text-xs font-black">Slot {slot}</p>
                      {slot === 2 && <BellRing className="mt-5" size={20} aria-hidden="true" />}
                      {slot === 4 && <CheckCircle className="mt-5" size={20} aria-hidden="true" />}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
                  <p className="flex items-center gap-2 text-sm font-black text-green-700">
                    <Activity size={17} aria-hidden="true" />
                    Streak protected today
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Keep every scheduled dose on track.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
