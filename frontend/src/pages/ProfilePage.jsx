import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, CheckCircle, XCircle, User } from 'lucide-react';

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);

  const initials = (user?.display_name || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative min-h-screen bg-navy-950">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-brand-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* Back button */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Link>

        {/* Profile header card */}
        <div className="glass-card animate-slide-up rounded-3xl p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-3xl font-bold text-white shadow-glow-md">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 border-2 border-navy-950">
                {user?.is_verified ? (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-400" />
                )}
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">{user?.display_name || 'User'}</h1>
              <p className="mt-1 text-sm text-slate-400">{user?.email || '—'}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user?.is_verified ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'}`}>
                  {user?.is_verified ? 'Verified' : 'Pending Verification'}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user?.is_2fa_enabled ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}`}>
                  2FA {user?.is_2fa_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="glass-card animate-slide-up rounded-2xl p-6" style={{ animationDelay: '100ms' }}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
              <User className="h-5 w-5 text-brand-400" />
            </div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Display Name</dt>
            <dd className="mt-2 text-lg font-semibold text-white">{user?.display_name || '—'}</dd>
          </div>

          <div className="glass-card animate-slide-up rounded-2xl p-6" style={{ animationDelay: '150ms' }}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
              <Mail className="h-5 w-5 text-brand-400" />
            </div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</dt>
            <dd className="mt-2 text-lg font-semibold text-white">{user?.email || '—'}</dd>
          </div>

          <div className="glass-card animate-slide-up rounded-2xl p-6" style={{ animationDelay: '200ms' }}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verification</dt>
            <dd className="mt-2 text-lg font-semibold text-white">{user?.is_verified ? 'Verified' : 'Pending'}</dd>
          </div>

          <div className="glass-card animate-slide-up rounded-2xl p-6" style={{ animationDelay: '250ms' }}>
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15">
              <Shield className="h-5 w-5 text-brand-400" />
            </div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Two-Factor Auth</dt>
            <dd className="mt-2 text-lg font-semibold text-white">{user?.is_2fa_enabled ? 'Enabled' : 'Disabled'}</dd>
          </div>
        </div>

        {/* Settings link */}
        <div className="mt-6 text-center">
          <Link
            to="/settings"
            className="btn-ghost inline-flex items-center gap-2"
          >
            Manage Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
