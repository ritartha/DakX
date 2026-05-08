import { Inbox } from 'lucide-react';
import MailItem from './MailItem';

export default function MailList({ entries, currentEntry, onSelect }) {
  if (!entries.length) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-2xl p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 border border-brand-500/15">
          <Inbox className="h-8 w-8 text-brand-400/60" />
        </div>
        <p className="text-sm font-medium text-slate-400">No mail in this folder</p>
        <p className="mt-1 text-xs text-slate-600">New messages will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto pr-1">
      {entries.map((entry, index) => (
        <MailItem
          key={entry.id}
          entry={entry}
          active={currentEntry?.id === entry.id}
          onClick={() => onSelect(entry)}
          index={index}
        />
      ))}
    </div>
  );
}
