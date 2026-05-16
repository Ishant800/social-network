import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup, reset } from "../features/auth/authSlice";
import logo from "../assets/logo.png";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [googleMsg, setGoogleMsg] = useState(false);

  const { isLoading, isError, message } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleClick = () => {
    setGoogleMsg(true);
    setTimeout(() => setGoogleMsg(false), 2000);
  };


  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };
    try {
      const data = await dispatch(signup(formData)).unwrap();
      dispatch(reset());
      if (!data.emailVerified) {
        localStorage.removeItem('token');
        navigate('/verify-email', {
          state: {
            email: formData.email,
            verificationEmailSent: data.verificationEmailSent !== false,
          },
        });
      } else {
        navigate('/');
      }
    } catch {
      // Errors are surfaced via Redux (isError / message)
    }
  };

  const inputBase =
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-400/90';

  return (
    <div className="min-h-dvh flex bg-slate-50">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="relative z-10 max-w-md">
          <img src={logo} alt="" className="h-11 w-auto opacity-95 drop-shadow-md" />
          <h1 className="font-display mt-10 text-4xl font-extrabold leading-tight tracking-tight">
            Join the network
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-teal-100/95">
            Share posts and long articles, join live blog discussions, and grow an audience that actually engages.
          </p>
        </div>
        <p className="relative z-10 text-xs text-teal-200/80">Free to start · Verify your email to unlock everything</p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="surface-card animate-fade-up rounded-2xl p-6 shadow-[var(--shadow-float)] sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Create account</h2>
            <p className="mt-1 text-sm text-slate-500">A few details and you are ready to go.</p>
          </div>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Full name</label>
              <input
                type="text"
                placeholder="Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputBase} ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputBase} ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Confirm password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputBase} ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {isError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{message}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-60"
            >
              {isLoading ? 'Creating account…' : 'Sign up'}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleGoogleClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt=""
                className="h-3.5 w-3.5"
              />
              Continue with Google
            </button>

            {googleMsg && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
                Google sign-in is not available yet. Please use email and password.
              </p>
            )}

            <p className="pt-2 text-center text-xs text-slate-600">
              Already have an account?
              <Link to="/login" className="ml-1 font-semibold text-teal-700 hover:text-teal-800">
                Sign in
              </Link>
            </p>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
