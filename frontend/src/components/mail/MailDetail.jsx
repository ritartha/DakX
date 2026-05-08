import { Mail, Reply, Forward, Trash2, Paperclip, Download } from 'lucide-react';

export default function MailDetail({ entry }) {
  if (!entry) {
    return (
      <div className="glass-card flex h-full min-h-[24rem] flex-col items-center justify-center rounded-2xl p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 border border-brand-500/15">
          <Mail className="h-8 w-8 text-brand-400/50" />
        </div>
        <p className="text-sm font-medium text-slate-400">Select a message</p>
        <p className="mt-1 text-xs text-slate-600">Choose a conversation to view its content</p>
      </div>
    );
  }

  const { message } = entry;
  const senderName = message.sender?.display_name || message.sender?.email || 'Unknown';
  const senderInitial = senderName.charAt(0).toUpperCase();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <article className="glass-card animate-fade-in flex flex-col rounded-2xl max-h-[calc(100vh-140px)] overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-md bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-400 border border-brand-500/20">
              {entry.folder}
            </span>
            <h2 className="mt-2 text-xl font-bold text-white">{message.subject}</h2>
          </div>

          {/* Actions */}
          <div className="flex gap-1.5">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-brand-400" title="Reply">
              <Reply className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-brand-400" title="Forward">
              <Forward className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-red-400" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sender info */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-300">
            {senderInitial}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{senderName}</p>
            <p className="text-xs text-slate-500">
              to {(message.to_addresses || []).join(', ')}
              {message.sent_at && <span className="ml-2 text-slate-600">· {formatDate(message.sent_at)}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="prose max-w-none text-sm leading-relaxed">
          {message.body_html ? (
            <div dangerouslySetInnerHTML={{ __html: message.body_html }} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-slate-300">{message.body_text}</pre>
          )}
        </div>
      </div>

      {/* Attachments */}
      {message.attachments?.length ? (
        <div className="border-t border-white/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-300">
              {message.attachments.length} Attachment{message.attachments.length > 1 ? 's' : ''}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="glass-subtle flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition hover:border-brand-500/20"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10">
                  <Download className="h-4 w-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">{attachment.filename}</p>
                  <p className="text-[10px] text-slate-600">{Math.round(attachment.size_bytes / 1024)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
