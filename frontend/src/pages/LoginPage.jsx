import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { loginThunk } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [validationError, setValidationError] = useState(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      setValidationError('Email and password are required.');
      return;
    }
    setValidationError(null);
    const result = await dispatch(loginThunk(form));
    if (loginThunk.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">DakX</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500">Access your secure inbox.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" />
          {(validationError || error) ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{validationError || error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:bg-slate-300">{loading ? 'Signing in…' : 'Login'}</button>
        </form>
        <p className="mt-6 text-sm text-slate-500">
          Need an account? <Link className="font-medium text-brand-600" to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
