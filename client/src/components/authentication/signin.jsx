import React from "react";

function Signin() {
  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-slate-900 text-white items-center justify-center p-12">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back 👋</h1>
          <p className="text-slate-300 text-lg">
            Build, connect and grow with your community.
            Your journey starts here.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-100 p-6">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

          <h2 className="text-2xl font-semibold text-slate-800">
            Sign In
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Enter your credentials to continue
          </p>

          <form className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 accent-slate-800"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-slate-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <a
                href="#forgot"
                className="text-slate-700 hover:underline font-medium"
              >
                Forgot password?
              </a>
            </div>

            {/* Button */}
            <button
              type="button"
              className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition shadow-md"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Social Buttons */}
            <button
              type="button"
              className="w-full border border-slate-200 py-2 rounded-md text-sm hover:bg-gray-50 transition"
            >
              Continue with Google
            </button>

            <p className="text-center text-sm text-slate-600 mt-4">
              Don’t have an account?
              <a
                href="/signup"
                className="ml-1 font-semibold text-slate-800 hover:underline"
              >
                Sign up
              </a>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
}

export default Signin;