import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, XCircle, AtSign, Loader2 } from 'lucide-react';

import { registerThunk } from '../store/authSlice';
import { checkAvailability } from '../api/authApi';

const DOMAIN = 'dakx.local';

const strengthMessage = (password) => {
  if (!password) return { text: '', level: 0 };
  if (password.length < 8) return { text: 'Use at least 8 characters', level: 1 };
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { text: 'Add uppercase letter and number', level: 2 };
  return { text: 'Strong password', level: 3 };
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ display_name: '', username: '', password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Mail ID availability state
  const [availability, setAvailability] = useState({ checked: false, available: false, detail: '', email: '' });
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const debounceRef = useRef(null);

  const passwordStatus = useMemo(() => strengthMessage(form.password), [form.password]);
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  // Debounced availability check
  const checkUsername = useCallback((username) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!username || username.length < 3) {
      setAvailability({ checked: false, available: false, detail: '', email: '' });
      setCheckingAvailability(false);
      return;
    }

    setCheckingAvailability(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await checkAvailability(username);
        const data = res.data?.data || res.data;
        setAvailability({
          checked: true,
          available: data.available,
          detail: data.detail,
          email: data.email || `${username}@${DOMAIN}`,
        });
      } catch {
        setAvailability({ checked: true, available: false, detail: 'Could not check availability.', email: '' });
      } finally {
        setCheckingAvailability(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    checkUsername(form.username);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.username, checkUsername]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!passwordsMatch || !availability.available) return;
    const result = await dispatch(registerThunk({
      display_name: form.display_name,
      email: availability.email,
      password: form.password,
    }));
    if (registerThunk.fulfilled.match(result)) {
      setSubmitted(true);
    }
  };

  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthWidths = ['w-0', 'w-1/3', 'w-2/3', 'w-full'];

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="glass-card animate-slide-up relative z-10 w-full max-w-lg rounded-3xl p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-400">DakX</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">Choose your unique mail ID and set up your workspace</p>
        </div>

        {submitted ? (
          <div className="animate-fade-in flex flex-col items-center gap-4 rounded-2xl bg-emerald-500/10 p-6 border border-emerald-500/20">
            <CheckCircle className="h-12 w-12 text-emerald-400" />
            <div className="text-center">
              <p className="text-lg font-semibold text-emerald-400">Registration successful!</p>
              <p className="mt-1 text-sm text-white font-medium">{availability.email}</p>
              <p className="mt-2 text-sm text-slate-400">Check your email for the verification link.</p>
            </div>
            <Link to="/login" className="btn-primary mt-2 inline-block px-6">
              Go to Sign in
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Display name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="register-name"
                placeholder="Display name"
                value={form.display_name}
                onChange={(e) => setForm((c) => ({ ...c, display_name: e.target.value }))}
                className="glass-input pl-11"
              />
            </div>

            {/* ── Mail ID Picker ── */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <AtSign className="h-3.5 w-3.5" />
                Choose your Mail ID
              </label>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-white/[0.08] focus-within:border-brand-500 transition-all duration-300 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]">
                <div className="relative flex-1">
                  <input
                    id="register-username"
                    placeholder="yourname"
                    value={form.username}
                    onChange={(e) => setForm((c) => ({ ...c, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))}
                    className="w-full bg-[rgba(10,17,40,0.6)] px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
                    autoComplete="off"
                  />
                </div>
                <div className="flex items-center border-l border-white/[0.08] bg-brand-500/10 px-4">
                  <span className="text-sm font-semibold text-brand-400">@{DOMAIN}</span>
                </div>
              </div>

              {/* Availability indicator */}
              {form.username.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  {checkingAvailability ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
                      <span className="text-xs text-slate-500">Checking availability...</span>
                    </>
                  ) : availability.checked ? (
                    availability.available ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400">
                          <span className="font-semibold">{availability.email}</span> — {availability.detail}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-xs text-red-400">{availability.detail}</span>
                      </>
                    )
                  ) : form.username.length < 3 ? (
                    <span className="text-xs text-slate-600">At least 3 characters required</span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Passwords */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                  className="glass-input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brand-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((c) => ({ ...c, confirmPassword: e.target.value }))}
                  className="glass-input pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-brand-400"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Strength indicator */}
            {form.password && (
              <div className="space-y-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-800">
                  <div className={`h-full rounded-full transition-all duration-500 ${strengthWidths[passwordStatus.level]} ${strengthColors[passwordStatus.level]}`} />
                </div>
                <p className={`text-xs ${passwordStatus.level === 3 ? 'text-emerald-400' : passwordStatus.level === 2 ? 'text-amber-400' : 'text-red-400'}`}>
                  {passwordStatus.text}
                </p>
              </div>
            )}

            {/* Match status */}
            {!passwordsMatch && form.confirmPassword && (
              <p className="text-xs text-red-400">Passwords must match</p>
            )}

            {/* Error */}
            {error ? (
              <div className="animate-fade-in rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            ) : null}

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={loading || !passwordsMatch || !availability.available}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link className="font-medium text-brand-400 transition hover:text-brand-300" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
