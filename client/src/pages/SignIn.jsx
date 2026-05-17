import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice';
import AuthLayout from '../components/auth/AuthLayout';

function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      navigate('/');
    }
  }, [isSuccess, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
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

  const inputCls = (hasError) =>
    `w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <AuthLayout
      heading="Welcome Back"
      subheading="Continue your journey and stay connected with your network."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
        <p className="text-xs text-gray-600">Welcome back to your account</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls(errors.email)}
          />
          {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls(errors.password)}
          />
          {errors.password && <p className="text-xs text-red-600 mt-0.5">{errors.password}</p>}
        </div>

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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 mt-4"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full border border-gray-300 py-2 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Continue with Google
        </button>

        {googleMsg && (
          <p className="text-center text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Google sign-in not available. Please use your credentials.
          </p>
        )}

        <p className="text-center text-xs text-gray-600 mt-4">
          Don&apos;t have an account?
          <Link to="/signup" className="ml-1 font-semibold text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signin;
