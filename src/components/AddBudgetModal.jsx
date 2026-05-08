import { useEffect, useRef, useState } from 'react'
import { X, PiggyBank, Plus, CircleDollarSign } from 'lucide-react'
import { CATEGORY_ICONS } from '../lib/categoryIcons'
import { getPositiveMoneyValue, sanitizeMoneyInput } from '../lib/money'
import { EXPENSE_CATEGORIES } from '../lib/constants'
import { getCustomCategories, addCustomCategory, removeCustomCategory } from '../lib/customCategories'
import AddCategoryModal from './AddCategoryModal'
import DeleteConfirmModal from './DeleteConfirmModal'

const inputStyle = {
  background: 'var(--accent-dim)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

export default function AddBudgetModal({ onClose, onAdd, existingBudgets = {} }) {
  const [selectedCat, setSelectedCat] = useState(null)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [customCats, setCustomCats] = useState(() => getCustomCategories())
  const [addingCustom, setAddingCustom] = useState(false)

  const custom = customCats['expense'] || []
  const cats = [...EXPENSE_CATEGORIES, ...custom]

  const validAmount = getPositiveMoneyValue(amount)
  const alreadySet = selectedCat && existingBudgets[selectedCat] !== undefined

  const [pendingDeleteCat, setPendingDeleteCat] = useState(null)

  const deleteCustom = (name) => setPendingDeleteCat(name)
  const confirmDeleteCat = () => {
    const updated = removeCustomCategory('expense', pendingDeleteCat)
    setCustomCats({ ...updated })
    if (selectedCat === pendingDeleteCat) setSelectedCat(null)
    setPendingDeleteCat(null)
  }

  const saveCustom = (name) => {
    const updated = addCustomCategory('expense', name)
    setCustomCats({ ...updated })
    setSelectedCat(name)
    setAddingCustom(false)
  }

  const handleSubmit = async () => {
    if (validAmount === null || !selectedCat || submitting) return
    setSubmitting(true)
    try {
      await onAdd(selectedCat, validAmount)
      onClose()
    } catch {
      setSubmitting(false)
    }
  }

  const openedAtRef = useRef(0)

  useEffect(() => {
    openedAtRef.current = Date.now()
  }, [])

  function handleBackdropClick(e) {
    if (e.target !== e.currentTarget) return
    // Android WebView can dispatch a delayed/ghost tap after opening. Ignore
    // extremely early backdrop clicks so the sheet cannot flash and close.
    if (Date.now() - openedAtRef.current < 300) return
    onClose()
  }

  return (
    <>
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
              <PiggyBank size={16} strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {alreadySet ? 'Update Budget' : 'Add Budget'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'var(--accent-dim)', color: 'var(--text-muted)' }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</p>
          <div className="grid grid-cols-4 gap-2">
            {cats.map(name => {
              const Icon = CATEGORY_ICONS[name] || CircleDollarSign
              const active = selectedCat === name
              const hasbudget = existingBudgets[name] !== undefined
              const isCustom = custom.includes(name)
              return (
                <div key={name} className="relative">
                  <button
                    onClick={() => {
                      setSelectedCat(name)
                      if (existingBudgets[name] !== undefined) setAmount(String(existingBudgets[name]))
                      else setAmount('')
                    }}
                    className="w-full relative flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs transition-all"
                    style={active
                      ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }
                      : { background: 'var(--filter-idle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                    }
                  >
                    {hasbudget && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    )}
                    <Icon size={18} strokeWidth={1.75} />
                    <span className="truncate w-full text-center px-1">{name}</span>
                  </button>
                  {isCustom && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteCustom(name) }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#fb7185', color: '#fff' }}
                    >
                      <X size={8} strokeWidth={3} />
                    </button>
                  )}
                </div>
              )
            })}

            {/* Add custom category tile — opens popup */}
              <button
                onClick={() => setAddingCustom(true)}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs transition-all"
                style={{ background: 'var(--filter-idle)', color: 'var(--accent)', border: '1px dashed var(--accent)', opacity: 0.8 }}
              >
                <Plus size={18} strokeWidth={1.75} />
                <span>Custom</span>
              </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Monthly Limit</p>
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
          disabled={validAmount === null || !selectedCat || submitting}
          className="w-full py-3.5 rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: '#0a0f1e', boxShadow: '0 4px 14px var(--accent-shadow)' }}
        >
          {submitting ? 'Saving…' : alreadySet ? 'Update Budget' : 'Set Budget'}
        </button>
      </div>
    </div>

    {addingCustom && (
      <AddCategoryModal
        type="expense"
        onAdd={saveCustom}
        onCancel={() => setAddingCustom(false)}
      />
    )}
    {pendingDeleteCat && (
      <DeleteConfirmModal
        title="Delete Category?"
        message={`Remove "${pendingDeleteCat}" from your custom categories?`}
        onConfirm={confirmDeleteCat}
        onCancel={() => setPendingDeleteCat(null)}
      />
    )}
    </>
  )
}
