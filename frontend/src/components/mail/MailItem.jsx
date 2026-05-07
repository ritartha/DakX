export default function MailItem({ entry, active, onClick }) {
  const sender = entry.message?.sender?.display_name || entry.message?.sender?.email || 'Unknown sender';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm ${entry.is_read ? 'font-medium text-slate-600' : 'font-semibold text-slate-900'}`}>{sender}</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{entry.message?.subject || '(no subject)'}</p>
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">{entry.message?.body_text || entry.message?.body_html || 'No preview available.'}</p>
        </div>
        {entry.is_starred ? <span className="text-amber-500">★</span> : null}
      </div>
    </button>
  );
}
