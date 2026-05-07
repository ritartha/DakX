import { useMemo, useState } from 'react';

const validateEmails = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

export default function ComposeModal({ isOpen, onClose, onSend, loading }) {
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [form, setForm] = useState({ to: '', cc: '', bcc: '', subject: '', body_text: '' });
  const [attachments, setAttachments] = useState([]);

  const isValid = useMemo(() => {
    if (!form.to.trim() || !validateEmails(form.to)) return false;
    if (showCc && form.cc && !validateEmails(form.cc)) return false;
    if (showBcc && form.bcc && !validateEmails(form.bcc)) return false;
    return true;
  }, [form, showCc, showBcc]);

  if (!isOpen) return null;

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = (isDraft = false) => {
    onSend({
      to: form.to.split(',').map((value) => value.trim()).filter(Boolean),
      cc: form.cc.split(',').map((value) => value.trim()).filter(Boolean),
      bcc: form.bcc.split(',').map((value) => value.trim()).filter(Boolean),
      subject: form.subject,
      body_text: form.body_text,
      body_html: `<p>${form.body_text.replace(/\n/g, '<br />')}</p>`,
      attachment_ids: attachments.map((item) => item.id).filter(Boolean),
      is_draft: isDraft,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Compose message</h2>
          <button type="button" onClick={onClose} className="text-sm text-slate-500">Close</button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">To</label>
            <input value={form.to} onChange={(e) => updateField('to', e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="user@example.com, another@example.com" />
          </div>
          <div className="flex gap-3 text-xs font-semibold text-brand-600">
            <button type="button" onClick={() => setShowCc((value) => !value)}>Toggle CC</button>
            <button type="button" onClick={() => setShowBcc((value) => !value)}>Toggle BCC</button>
          </div>
          {showCc ? <input value={form.cc} onChange={(e) => updateField('cc', e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="cc@example.com" /> : null}
          {showBcc ? <input value={form.bcc} onChange={(e) => updateField('bcc', e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="bcc@example.com" /> : null}
          <input value={form.subject} onChange={(e) => updateField('subject', e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="Subject" />
          <textarea value={form.body_text} onChange={(e) => updateField('body_text', e.target.value)} rows={10} className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500" placeholder="Write your message here. Rich-text editor integration can be mounted in this area." />
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
            <span className="font-medium text-slate-700">Attachment upload / drag & drop area</span>
            <span className="mt-2 text-xs">Hook this zone to the attachment upload endpoint for production uploads.</span>
            <input type="file" multiple className="hidden" onChange={(event) => setAttachments(Array.from(event.target.files || []))} />
          </label>
          {attachments.length ? <p className="text-xs text-slate-500">Queued attachments: {attachments.map((file) => file.name).join(', ')}</p> : null}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => handleSubmit(true)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">Save Draft</button>
          <button type="button" disabled={!isValid || loading} onClick={() => handleSubmit(false)} className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
