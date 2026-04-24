import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import logo from "../assets/logo.png";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

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

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Section - Logo & Minimal Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 bg-gray-50 border-r border-gray-200">
        <div className="text-center max-w-md">
          <img src={logo} alt="Logo" className="h-50 w-auto mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-600 text-sm">
            Continue your journey and stay connected with your network.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
            <p className="text-xs text-gray-600">Welcome back to your account</p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="text-xs text-red-600 mt-0.5">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-3.5 w-3.5 accent-blue-600 rounded border-gray-300"
                />
                <label htmlFor="remember" className="ml-1.5 text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#forgot" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot?
              </a>
            </div>

            {isError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 mt-4"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full border border-gray-300 py-2 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Continue with Google
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-xs text-gray-600 mt-4">
              Don't have an account?
              <Link
                to="/signup"
                className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signin;
