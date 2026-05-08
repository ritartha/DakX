import { useMemo, useState } from 'react';
import { X, Send, Save, ChevronDown, ChevronUp, Paperclip, Upload } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="glass-card animate-slide-up relative z-10 w-full max-w-3xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-lg font-bold text-white">New message</h2>
          <button
            id="compose-close"
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3 p-5">
          {/* To */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">To</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCc((v) => !v)}
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-brand-400 transition hover:bg-brand-500/10"
                >
                  {showCc ? <ChevronUp className="h-3 w-3 inline" /> : 'CC'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBcc((v) => !v)}
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-brand-400 transition hover:bg-brand-500/10"
                >
                  {showBcc ? <ChevronUp className="h-3 w-3 inline" /> : 'BCC'}
                </button>
              </div>
            </div>
            <input
              id="compose-to"
              value={form.to}
              onChange={(e) => updateField('to', e.target.value)}
              className="glass-input"
              placeholder="recipient@example.com"
            />
          </div>

          {/* CC/BCC */}
          {showCc && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">CC</label>
              <input
                value={form.cc}
                onChange={(e) => updateField('cc', e.target.value)}
                className="glass-input"
                placeholder="cc@example.com"
              />
            </div>
          )}
          {showBcc && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">BCC</label>
              <input
                value={form.bcc}
                onChange={(e) => updateField('bcc', e.target.value)}
                className="glass-input"
                placeholder="bcc@example.com"
              />
            </div>
          )}

          {/* Subject */}
          <input
            id="compose-subject"
            value={form.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className="glass-input"
            placeholder="Subject"
          />

          {/* Body */}
          <textarea
            id="compose-body"
            value={form.body_text}
            onChange={(e) => updateField('body_text', e.target.value)}
            rows={10}
            className="glass-input resize-none rounded-xl"
            placeholder="Write your message..."
          />

          {/* Attachments */}
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-navy-900/30 px-6 py-5 text-center transition-all hover:border-brand-500/30 hover:bg-brand-500/5">
            <Upload className="mb-2 h-6 w-6 text-slate-600 transition group-hover:text-brand-400" />
            <span className="text-xs font-medium text-slate-500 transition group-hover:text-slate-300">
              Drop files here or click to upload
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(event) => setAttachments(Array.from(event.target.files || []))}
            />
          </label>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, i) => (
                <div key={i} className="glass-subtle flex items-center gap-2 rounded-lg px-3 py-1.5">
                  <Paperclip className="h-3 w-3 text-brand-400" />
                  <span className="text-xs text-slate-300">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/5 px-5 py-4">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="btn-ghost flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            id="compose-send"
            type="button"
            disabled={!isValid || loading}
            onClick={() => handleSubmit(false)}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
