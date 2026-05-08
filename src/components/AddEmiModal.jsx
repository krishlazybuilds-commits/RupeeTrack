import { useEffect, useRef, useState } from 'react'
import { X, WalletCards } from 'lucide-react'
import { getPositiveMoneyValue, sanitizeMoneyInput } from '../lib/money'

const inputStyle = {
  background: 'var(--accent-dim)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

export default function AddEmiModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validAmount = getPositiveMoneyValue(amount)
  const validName = name.trim().length > 0
  const canSubmit = validAmount !== null && validName && !submitting

  const openedAtRef = useRef(0)
  useEffect(() => { openedAtRef.current = Date.now() }, [])

  function handleBackdropClick(e) {
    if (e.target !== e.currentTarget) return
    if (Date.now() - openedAtRef.current < 300) return
    onClose()
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await onAdd({ name: name.trim(), emiAmount: validAmount, category: 'Other' })
      onClose()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl p-6 space-y-5 border-t"
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', borderColor: 'var(--accent-dim)', animation: 'slideUp 0.3s ease' }}
      >
        {/* Handle + close */}
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: 'var(--border)' }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              <WalletCards size={16} strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Add EMI</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'var(--accent-dim)', color: 'var(--text-muted)' }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Loan name */}
        <div>
          <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Loan Name</p>
          <input
            type="text"
            placeholder="Home loan"
            value={name}
            onChange={e => setName(e.target.value)}
            className="modal-input w-full rounded-xl py-3 px-4 text-sm"
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Amount */}
        <div>
          <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>EMI Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: 'var(--text-muted)' }}>₹</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(sanitizeMoneyInput(e.target.value))}
              className="modal-input w-full rounded-xl py-3 pl-9 pr-4 text-2xl font-bold"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: '#0a0f1e', boxShadow: '0 4px 14px var(--accent-shadow)' }}
        >
          {submitting ? 'Saving…' : 'Save EMI'}
        </button>
      </div>
    </div>
  )
}
