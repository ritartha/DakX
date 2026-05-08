import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Palette, User, Globe, Shield } from 'lucide-react';

const sections = [
  {
    title: 'Account',
    icon: User,
    description: 'Manage your display name, avatar, and personal information.',
    color: 'brand',
  },
  {
    title: 'Notifications',
    icon: Bell,
    description: 'Configure email and push notification preferences.',
    color: 'brand',
  },
  {
    title: 'Security',
    icon: Shield,
    description: 'Password, two-factor authentication, and login history.',
    color: 'emerald',
  },
  {
    title: 'Appearance',
    icon: Palette,
    description: 'Theme, font size, and display density preferences.',
    color: 'violet',
  },
  {
    title: 'Language & Region',
    icon: Globe,
    description: 'Timezone, language, and date format settings.',
    color: 'blue',
  },
  {
    title: 'Privacy',
    icon: Lock,
    description: 'Read receipts, data export, and account deletion.',
    color: 'amber',
  },
];

const colorMap = {
  brand: { bg: 'bg-brand-500/15', text: 'text-brand-400' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  violet: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
};

export default function SettingsPage() {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="relative min-h-screen bg-navy-950">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-brand-600/8 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your account preferences and security, {user?.display_name || 'User'}.
          </p>
        </div>

        <div className="space-y-3">
          {sections.map(({ title, icon: Icon, description, color }, index) => {
            const colors = colorMap[color];
            return (
              <button
                key={title}
                className="glass-card animate-slide-up group flex w-full items-center gap-5 rounded-2xl p-5 text-left transition-all duration-300 hover:border-brand-500/30 hover:shadow-glow"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">{title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{description}</p>
                </div>
                <ArrowLeft className="h-4 w-4 rotate-180 text-slate-600 transition-all group-hover:text-brand-400 group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
