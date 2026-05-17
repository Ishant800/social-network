import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, reset } from '../features/auth/authSlice';
import AuthLayout from '../components/auth/AuthLayout';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

  const inputCls = (hasError) =>
    `w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <AuthLayout
      heading="Create Account"
      subheading="Join our community and start connecting with people around you."
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign Up</h2>
        <p className="text-xs text-gray-600">Create your account to get started</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className={inputCls(errors.name)}
          />
          {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name}</p>}
        </div>

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

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls(errors.confirmPassword)}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 mt-0.5">{errors.confirmPassword}</p>
          )}
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
          {isLoading ? 'Creating account...' : 'Sign Up'}
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
          Already have an account?
          <Link to="/login" className="ml-1 font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Signup;
