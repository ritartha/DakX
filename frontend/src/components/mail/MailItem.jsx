import { Star } from 'lucide-react';

export default function MailItem({ entry, active, onClick, index = 0 }) {
  const sender = entry.message?.sender?.display_name || entry.message?.sender?.email || 'Unknown sender';
  const senderInitial = sender.charAt(0).toUpperCase();
  const subject = entry.message?.subject || '(no subject)';
  const preview = entry.message?.body_text || entry.message?.body_html || 'No preview available.';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`animate-fade-in group w-full rounded-xl p-3.5 text-left transition-all duration-200 ${
        active
          ? 'glass-card border-brand-500/30 shadow-glow'
          : 'glass-subtle hover:bg-white/[0.04] hover:border-white/10'
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          active
            ? 'bg-brand-500/25 text-brand-300'
            : entry.is_read
              ? 'bg-slate-700/50 text-slate-400'
              : 'bg-brand-500/15 text-brand-400'
        }`}>
          {senderInitial}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`truncate text-sm ${entry.is_read ? 'font-medium text-slate-400' : 'font-semibold text-white'}`}>
              {sender}
            </p>
            <span className="flex-shrink-0 text-[10px] text-slate-600">
              {formatDate(entry.message?.sent_at || entry.created_at)}
            </span>
          </div>
          <p className={`mt-0.5 truncate text-sm ${entry.is_read ? 'text-slate-500' : 'font-medium text-slate-200'}`}>
            {subject}
          </p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-600">{preview}</p>
        </div>

        {/* Indicators */}
        <div className="flex flex-col items-center gap-1.5 pt-0.5">
          {!entry.is_read && (
            <div className="h-2 w-2 rounded-full bg-brand-500 shadow-glow" />
          )}
          {entry.is_starred && (
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          )}
        </div>
      </div>
    </button>
  );
}
