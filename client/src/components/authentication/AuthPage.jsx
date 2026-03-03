import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome, Check, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AuthPage({ mode = 'login' }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const isLogin = mode === 'login';
  const navigate = useNavigate();

  // Password strength calculator (for signup)
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = !isLogin ? getPasswordStrength(formData.password) : 0;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // TODO: Implement OAuth flow
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-white">
      
      {/* ===== Left Side: Branding & Visual (Hidden on Mobile) ===== */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-8 xl:p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 font-extrabold text-xl shadow-lg group-hover:scale-105 transition-transform">
              M
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">MeroRoom</span>
          </Link>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-6 max-w-xl">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight text-white">
            Connect with the <br />
            <span className="text-indigo-200">developer community.</span>
          </h1>
          <p className="text-lg text-indigo-100/90 leading-relaxed">
            Join thousands of developers sharing their journey, building projects, 
            and growing together in a supportive ecosystem.
          </p>
          
          {/* Avatar Stack */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-3">
              {[15, 23, 31, 42].map((img, i) => (
                <img 
                  key={i} 
                  className="h-11 w-11 rounded-2xl border-3 border-indigo-600 shadow-lg object-cover" 
                  src={`https://i.pravatar.cc/150?img=${img}`} 
                  alt={`Community member ${i + 1}`}
                  loading="lazy"
                />
              ))}
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-3 border-indigo-600 
                            bg-indigo-500/90 text-xs font-extrabold text-white shadow-lg backdrop-blur-sm">
                +2k
              </div>
            </div>
            <span className="text-sm font-medium text-indigo-100">Active developers</span>
          </div>
          
          {/* Feature badges */}
          <div className="flex flex-wrap gap-2 pt-4">
            {['Real-time Chat', 'Project Collaboration', 'Skill Matching'].map((feature) => (
              <span key={feature} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full 
                                           text-xs font-semibold text-white border border-white/20">
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-indigo-200/80">
            © 2026 MeroRoom Platform. <span className="text-indigo-300">Built for builders, by builders.</span>
          </p>
        </div>
      </div>

      {/* ===== Right Side: Auth Form ===== */}
      <div className="flex w-full flex-col justify-center px-6 py-8 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          
          {/* Mobile Logo (visible only on small screens) */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-lg">
              M
            </div>
            <span className="text-xl font-extrabold text-slate-900">MeroRoom</span>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-slate-500 text-base">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <Link 
                to={isLogin ? "/signup" : "/login"} 
                className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 
                           transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              >
                {isLogin ? 'Sign up for free' : 'Log in here'}
              </Link>
            </p>
          </div>

          {/* Global Error Message */}
          {errors.submit && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 
                          rounded-2xl text-rose-700 text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Auth Form */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            
            {/* Full Name (Signup only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input 
                  id="name"
                  name="name"
                  type="text" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  autoComplete="name"
                  className={`w-full rounded-2xl border px-4 py-3.5 text-sm transition-all outline-none
                             bg-slate-50 placeholder:text-slate-400
                             focus:bg-white focus:ring-4 focus:ring-indigo-500/10
                             ${errors.name 
                               ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' 
                               : 'border-slate-200 focus:border-indigo-500'}`}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com" 
                  autoComplete="email"
                  className={`w-full rounded-2xl border py-3.5 pl-11 pr-4 text-sm transition-all outline-none
                             bg-slate-50 placeholder:text-slate-400
                             focus:bg-white focus:ring-4 focus:ring-indigo-500/10
                             ${errors.email 
                               ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' 
                               : 'border-slate-200 focus:border-indigo-500'}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className={`w-full rounded-2xl border py-3.5 pl-11 pr-12 text-sm transition-all outline-none
                             bg-slate-50 placeholder:text-slate-400
                             focus:bg-white focus:ring-4 focus:ring-indigo-500/10
                             ${errors.password 
                               ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' 
                               : 'border-slate-200 focus:border-indigo-500'}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 
                             transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                </p>
              )}
              
              {/* Password Strength Indicator (Signup only) */}
              {!isLogin && formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          level <= passwordStrength 
                            ? passwordStrength <= 2 
                              ? 'bg-rose-400' 
                              : passwordStrength === 3 
                                ? 'bg-amber-400' 
                                : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {passwordStrength <= 2 
                      ? 'Weak password' 
                      : passwordStrength === 3 
                        ? 'Good password' 
                        : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password (Login only) */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 
                               focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 
                             transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-sm
                         transition-all duration-200 focus:outline-none focus:ring-4 
                         focus:ring-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed
                         ${isLoading 
                           ? 'bg-indigo-400 cursor-wait' 
                           : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-lg shadow-indigo-200/50'
                         } text-white`}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'} 
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
              or continue with
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 
                         bg-white py-3 text-sm font-semibold text-slate-700 
                         hover:bg-slate-50 hover:border-slate-300 transition-all 
                         active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <Github className="h-5 w-5" /> 
              <span className="hidden sm:inline">Github</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 
                         bg-white py-3 text-sm font-semibold text-slate-700 
                         hover:bg-slate-50 hover:border-slate-300 transition-all 
                         active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <Chrome className="h-5 w-5 text-rose-500" /> 
              <span className="hidden sm:inline">Google</span>
            </button>
          </div>

          {/* Terms & Privacy */}
          <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-2 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}