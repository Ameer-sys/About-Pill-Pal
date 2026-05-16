import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ShieldPlus, User, UserPlus } from "lucide-react";
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../services/firebase";
import { getFriendlyAuthError } from "../utils/authErrors";
import { ensureDefaultPillbox } from "../services/pillboxService";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: fullName.trim() });
      await ensureDefaultPillbox({
        ...credential.user,
        displayName: fullName.trim(),
      });
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef6f8] px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-blue-100"
      >
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700">
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </Link>
        <div className="mb-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <ShieldPlus size={26} aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
          <p className="mt-2 text-slate-500">Start managing a 5-compartment schedule.</p>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span>
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <User size={19} className="text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Your name"
              className="w-full bg-transparent outline-none"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
        </label>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
          <div className="flex items-center gap-3 rounded-lg border border-slate-300 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
            <Mail size={19} className="text-slate-400" aria-hidden="true" />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-transparent outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </label>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
          <input
            type="password"
            placeholder="Create a password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
          />
        </label>

        <label className="mb-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left text-sm text-slate-600">
          <input type="checkbox" className="mt-1" />
          <span>Add caregiver email later for missed-dose alerts.</span>
        </label>

        {errorMessage && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-lg font-black text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={isSubmitting}
        >
          <UserPlus size={19} aria-hidden="true" />
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
