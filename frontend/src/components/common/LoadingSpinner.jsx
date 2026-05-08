export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="glass-card flex items-center gap-3 rounded-xl p-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-400" />
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}
