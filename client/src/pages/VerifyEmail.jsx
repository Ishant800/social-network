import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import logo from '../assets/logo.png';
import authService from '../features/auth/authService';
import { reset, getMe } from '../features/auth/authSlice';

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const email = location.state?.email?.trim()?.toLowerCase() || '';
  const verificationEmailSent = location.state?.verificationEmailSent !== false;

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/signup', { replace: true });
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const trimmed = code.replace(/\D/g, '');
    if (trimmed.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await authService.verifyEmailCode({ email, code: trimmed });
      dispatch(reset());

      // Token is returned by the backend only after successful email verification.
      if (result?.token) {
        localStorage.setItem('token', result.token);
      }

      await dispatch(getMe()).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      setError(
        (typeof data?.error === 'string' && data.error) ||
          err.message ||
          'Verification failed',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setResending(true);
    try {
      await authService.sendVerificationCode({ email });
      setInfo('A new code was sent to your email.');
    } catch (err) {
      const data = err.response?.data;
      setError(
        (typeof data?.error === 'string' && data.error) ||
          err.message ||
          'Could not resend code',
      );
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 bg-gray-50 border-r border-gray-200">
        <div className="text-center max-w-md">
          <img src={logo} alt="Logo" className="h-50 w-auto mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Check your inbox</h1>
          <p className="text-gray-600 text-sm">
            We sent a 6-digit code to <span className="font-medium text-gray-800">{email}</span>.
            Enter it below to verify your account.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Verify email</h2>
          <p className="text-xs text-gray-600 mb-6">Code expires in a few minutes</p>

          {!verificationEmailSent && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
              We could not send the first email (check server Gmail settings). Use &quot;Resend
              code&quot; to try again.
            </p>
          )}

          <form className="space-y-4" onSubmit={handleVerify}>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                6-digit code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm tracking-[0.4em] text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? 'Verifying…' : 'Verify & continue'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full border border-gray-300 py-2 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60"
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>

            <p className="text-center text-xs text-gray-600">
              Wrong email?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign up again
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
