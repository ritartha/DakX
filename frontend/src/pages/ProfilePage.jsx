import { useSelector } from 'react-redux';

export default function ProfilePage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-2 text-sm text-slate-500">Manage timezone, theme, signature, and security settings through the profile API.</p>
        <dl className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Display name</dt>
            <dd className="mt-2 text-lg text-slate-900">{user?.display_name || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</dt>
            <dd className="mt-2 text-lg text-slate-900">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Verified</dt>
            <dd className="mt-2 text-lg text-slate-900">{user?.is_verified ? 'Yes' : 'Pending'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">2FA</dt>
            <dd className="mt-2 text-lg text-slate-900">{user?.is_2fa_enabled ? 'Enabled' : 'Disabled'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
