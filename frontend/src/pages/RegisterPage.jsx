import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { registerThunk } from '../store/authSlice';

const strengthMessage = (password) => {
  if (password.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'Add an uppercase letter and a number.';
  return 'Strong password.';
};

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ display_name: '', email: '', password: '', confirmPassword: '' });
  const [submitted, setSubmitted] = useState(false);

  const passwordStatus = useMemo(() => strengthMessage(form.password), [form.password]);
  const passwordsMatch = form.password && form.password === form.confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!passwordsMatch) return;
    const result = await dispatch(registerThunk({
      display_name: form.display_name,
      email: form.email,
      password: form.password,
    }));
    if (registerThunk.fulfilled.match(result)) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Create your DakX workspace</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Register</h1>
        {submitted ? (
          <div className="mt-8 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">Registration successful. Check your email for the verification link.</div>
        ) : (
          <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <input placeholder="Display name" value={form.display_name} onChange={(e) => setForm((current) => ({ ...current, display_name: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 md:col-span-2" />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 md:col-span-2" />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
            <p className={`text-sm ${passwordStatus === 'Strong password.' ? 'text-emerald-600' : 'text-amber-600'}`}>{passwordStatus}</p>
            {!passwordsMatch && form.confirmPassword ? <p className="text-sm text-red-600">Passwords must match.</p> : <span />}
            {error ? <p className="md:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
            <button type="submit" disabled={loading || !passwordsMatch} className="md:col-span-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:bg-slate-300">{loading ? 'Creating account…' : 'Register'}</button>
          </form>
        )}
        <p className="mt-6 text-sm text-slate-500">
          Already registered? <Link className="font-medium text-brand-600" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
