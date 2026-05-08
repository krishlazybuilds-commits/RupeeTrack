import { useState } from 'react'
import { X, Tag } from 'lucide-react'

export default function AddCategoryModal({ type, onAdd, onCancel }) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const handleAdd = () => {
    if (!trimmed) return
    onAdd(trimmed)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-5" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 border shadow-2xl"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', animation: 'scaleIn 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
          <Tag size={26} strokeWidth={1.75} />
        </div>

        {/* Text */}
        <h2 className="text-lg font-bold text-center mb-1" style={{ color: 'var(--text-primary)' }}>
          New {type === 'income' ? 'Income' : 'Expense'} Category
        </h2>
        <p className="text-sm text-center mb-5" style={{ color: 'var(--text-muted)' }}>
          Enter a name for your custom category
        </p>

        {/* Input */}
        <input
          autoFocus
          type="text"
          placeholder="e.g. Pet Care, Side Hustle…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onCancel() }}
          className="modal-input w-full rounded-xl py-3 px-4 text-sm mb-4"
          style={{
            background: 'var(--accent-dim)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />

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
            onClick={handleAdd}
            disabled={!trimmed}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: '#0a0f1e' }}
          >
            <Tag size={15} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
