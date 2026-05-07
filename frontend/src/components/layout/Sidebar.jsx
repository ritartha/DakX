import { Archive, Inbox, PenSquare, Send, ShieldAlert, Tags, Trash2 } from 'lucide-react';

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
    <aside className="flex h-full flex-col gap-4 rounded-3xl bg-slate-900 p-5 text-white shadow-xl">
      <button onClick={onCompose} className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
        Compose
      </button>
      <nav className="space-y-2">
        {items.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
              currentFolder === value ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon size={18} />
              {label}
            </span>
            {value === 'INBOX' && unreadCount > 0 ? (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold">{unreadCount}</span>
            ) : null}
          </button>
        ))}
      </nav>
    </aside>
  );
}
