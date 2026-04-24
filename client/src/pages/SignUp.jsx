import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../features/auth/authSlice";
import logo from "../assets/logo.png";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
    }
  }, [isSuccess, navigate]);

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
    dispatch(signup(formData));
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Section - Logo & Minimal Content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 bg-gray-50 border-r border-gray-200">
        <div className="text-center max-w-md">
          <img src={logo} alt="Logo" className="h-50 w-auto mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Join Our Community</h1>
          <p className="text-gray-600 text-sm">
            Connect with creators, share your ideas, and grow your network.
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-xs text-gray-600">Join our community today</p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="text-xs text-red-600 mt-0.5">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-0.5">Min 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-0.5">{errors.confirmPassword}</p>}
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
              {isLoading ? "Creating..." : "Sign Up"}
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
              className="w-full border border-gray-300 py-2 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="h-3.5 w-3.5"
              />
              Continue with Google
            </button>

            {/* Sign In Link */}
            <p className="text-center text-xs text-gray-600 mt-4">
              Already have an account?
              <Link
                to="/login"
                className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
