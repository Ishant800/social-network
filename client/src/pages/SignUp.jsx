import React, { useEffect, useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../features/auth/authSlice";


function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {isLoading,isError,isSuccess,message} = useSelector((state)=> state.auth)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const token = localStorage.getItem("token")
  useEffect(()=>{
    if(token){
      navigate("/")
    }
  },[token,navigate])

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      name,
      email,
      password
    }
    dispatch(signup(formData))
  };

  return (
    <div className="min-h-screen flex">

      <div className="flex w-full items-center justify-center bg-gray-100 p-6">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

          <h2 className="text-2xl font-semibold text-slate-800">
            Create Account
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Fill in your details to get started
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-slate-400 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-slate-400 transition"
              />
            </div>

            {isError && (
              <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                {message}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-2 rounded-md hover:bg-slate-800 transition shadow-md disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full border border-slate-200 py-2 rounded-md text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="h-4 w-4"
              />
              Continue with Google
            </button>

            <p className="text-center text-sm text-slate-600 mt-4">
              Already have an account?
              <a
                href="/login"
                className="ml-1 font-semibold text-slate-800 hover:underline"
              >
                Sign in
              </a>
            </p>

          </form>
        </div>
      </div>

    </div>
  );
}

export default Signup;
