'use client';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-surface-container border border-outline-variant rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6 text-on-surface"
        style={{ boxShadow: '0 25px 50px -12px rgb(var(--shadow-color) / 0.5)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1.5 text-on-surface">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
    </div>
  );
}

export function FormInput({ value, onChange, placeholder, type = 'text', required, disabled }: {
  value?: string; onChange?: (v: string) => void; placeholder?: string; type?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

export function FormTextarea({ value, onChange, placeholder, rows = 3 }: {
  value?: string; onChange?: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none resize-none transition-colors"
    />
  );
}

let keyCounter = 0;

export function FormSelect({ value, onChange, options, placeholder }: {
  value?: string; onChange?: (v: string) => void; options: { label: string; value: string }[]; placeholder?: string;
}) {
  const seen = new Set<string>();
  const deduped = options.map((o) => {
    let key = o.value;
    if (seen.has(key)) {
      key = `${o.value}__${++keyCounter}`;
    }
    seen.add(key);
    return { ...o, value: o.value, _key: key };
  });
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface-container text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-colors"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {deduped.map((o) => (
        <option key={o._key} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-surface-container border border-outline-variant rounded-2xl w-full max-w-sm mx-4 p-6 text-on-surface"
        style={{ boxShadow: '0 25px 50px -12px rgb(var(--shadow-color) / 0.5)' }}
      >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-on-surface-variant text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-error text-on-error hover:opacity-90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
