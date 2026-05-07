export default function MailDetail({ entry }) {
  if (!entry) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center rounded-3xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Select a message to see the conversation.
      </div>
    );
  }

  const { message } = entry;
  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{entry.folder}</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{message.subject}</h2>
        <p className="mt-2 text-sm text-slate-500">From {message.sender?.display_name || message.sender?.email}</p>
        <p className="mt-1 text-xs text-slate-400">To {(message.to_addresses || []).join(', ')}</p>
      </div>
      <div className="prose mt-6 max-w-none prose-slate">
        {message.body_html ? <div dangerouslySetInnerHTML={{ __html: message.body_html }} /> : <pre className="whitespace-pre-wrap">{message.body_text}</pre>}
      </div>
      {message.attachments?.length ? (
        <section className="mt-6 rounded-2xl bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Attachments</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {message.attachments.map((attachment) => (
              <li key={attachment.id}>{attachment.filename} · {Math.round(attachment.size_bytes / 1024)} KB</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
