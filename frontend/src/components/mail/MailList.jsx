import MailItem from './MailItem';

export default function MailList({ entries, currentEntry, onSelect }) {
  if (!entries.length) {
    return <div className="rounded-3xl bg-white p-6 text-sm text-slate-500 shadow-sm">No mail in this folder yet.</div>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <MailItem
          key={entry.id}
          entry={entry}
          active={currentEntry?.id === entry.id}
          onClick={() => onSelect(entry)}
        />
      ))}
    </div>
  );
}
