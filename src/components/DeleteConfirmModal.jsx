import { Trash2, X } from 'lucide-react'

export default function DeleteConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-5" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 border shadow-2xl"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', animation: 'scaleIn 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={26} className="text-rose-400" strokeWidth={1.75} />
        </div>

        {/* Text */}
        <h2 className="text-lg font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>{title || 'Delete?'}</h2>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)' }}>{message || 'This action cannot be undone.'}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-colors"
            style={{ background: 'var(--accent-dim)', color: 'var(--text-secondary)' }}
          >
            <X size={15} strokeWidth={2} />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-500 active:scale-95 transition-all"
          >
            <Trash2 size={15} strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
