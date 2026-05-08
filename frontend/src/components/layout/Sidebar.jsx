import { Archive, Inbox, PenSquare, Send, ShieldAlert, Tags, Trash2, Plus } from 'lucide-react';

const items = [
  { label: 'Inbox', value: 'INBOX', icon: Inbox },
  { label: 'Sent', value: 'SENT', icon: Send },
  { label: 'Drafts', value: 'DRAFTS', icon: PenSquare },
  { label: 'Trash', value: 'TRASH', icon: Trash2 },
  { label: 'Spam', value: 'SPAM', icon: ShieldAlert },
  { label: 'Archive', value: 'ARCHIVE', icon: Archive },
  { label: 'Labels', value: 'LABELS', icon: Tags },
];

export default function Sidebar({ currentFolder, unreadCount, onSelect, onCompose }) {
  return (
    <aside className="glass-card flex h-full flex-col gap-5 rounded-2xl p-4 lg:rounded-2xl">
      {/* Compose button */}
      <button
        id="compose-button"
        onClick={onCompose}
        className="btn-primary flex items-center justify-center gap-2 rounded-xl"
      >
        <Plus className="h-4 w-4" />
        Compose
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map(({ label, value, icon: Icon }) => {
          const isActive = currentFolder === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/15 text-brand-300 shadow-inner-glow border border-brand-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-[18px] w-[18px] transition-colors ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="font-medium">{label}</span>
              </span>
              {value === 'INBOX' && unreadCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white shadow-glow">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Brand footer */}
      <div className="border-t border-white/5 pt-4 text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-600">DakX Mail</p>
      </div>
    </aside>
  );
}
