import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
const dispatch = useDispatch()

const {isLoading,isError,isSuccess,message} = useSelector((state)=> state.auth)

useEffect(()=>{
  const token = localStorage.getItem("token")
  if(token){
    navigate("/")
  }
},[navigate])

useEffect(() => {
  if (isSuccess) {
    navigate("/");
  }
}, [isSuccess, navigate]);
const handleSubmit = (e)=>{
  e.preventDefault();

  const formData = {
    email:email,
   password:password
  }
  dispatch(login(formData))
}
  
  return (
    <div className="min-h-screen flex">

      <div className="flex w-full items-center justify-center bg-gray-100 p-6">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

          <h2 className="text-2xl font-semibold text-slate-800">
            Sign In
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Enter your credentials to continue
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
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
              {isLoading ? "Signing in..." : "Sign In"}
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
              Don't have an account?
              <Link
                to="/signup"
                className="ml-1 font-semibold text-slate-800 hover:underline"
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
