import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import logo from "../assets/logo.png";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [googleMsg, setGoogleMsg] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  const handleGoogleClick = () => {
    setGoogleMsg(true);
    setTimeout(() => setGoogleMsg(false), 2000);
  };



  useEffect(() => {
    if (isSuccess) {
      navigate("/");
    }
  }, [isSuccess, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formData = {
      email: email.trim().toLowerCase(),
      password,
    };
    dispatch(login(formData));
  };

  const inputBase =
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-400/90';

  return (
    <div className="min-h-dvh flex bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 max-w-md">
          <img src={logo} alt="" className="h-11 w-auto opacity-95 drop-shadow-md" />
          <h1 className="font-display mt-10 text-4xl font-extrabold leading-tight tracking-tight">
            Welcome back
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-teal-100/95">
            Pick up conversations, catch up on your feed, and stay in sync with the people you care about.
          </p>
        </div>
        <p className="relative z-10 text-xs text-teal-200/80">Secure sign-in · Built for real communities</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="surface-card animate-fade-up rounded-2xl p-6 shadow-[var(--shadow-float)] sm:p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Use the email tied to your account.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="signin-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputBase} ${errors.email ? 'border-red-400 ring-red-200' : 'border-slate-200'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="signin-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputBase} ${errors.password ? 'border-red-400 ring-red-200' : 'border-slate-200'}`}
                />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                  Remember me
                </label>
                <a href="#forgot" className="font-semibold text-teal-700 hover:text-teal-800">
                  Forgot password?
                </a>
              </div>

              {isError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{message}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-60"
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Continue with Google
              </button>

              {googleMsg && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
                  Google sign-in is not available yet. Please use email and password.
                </p>
              )}

              <p className="pt-2 text-center text-xs text-slate-600">
                No account?
                <Link to="/signup" className="ml-1 font-semibold text-teal-700 hover:text-teal-800">
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signin;
