import { useEffect, useRef, useState } from 'react'
import { X, ArrowUpRight, ArrowDownRight, Plus, CircleDollarSign, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORY_ICONS } from '../lib/categoryIcons'
import { getPositiveMoneyValue, sanitizeMoneyInput } from '../lib/money'
import { CATEGORIES } from '../lib/constants'
import { getCustomCategories, addCustomCategory, removeCustomCategory } from '../lib/customCategories'
import AddCategoryModal from './AddCategoryModal'
import DeleteConfirmModal from './DeleteConfirmModal'

const inputStyle = {
  background: 'var(--accent-dim)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

function formatDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getDateError(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return 'Please select a valid date.'
  if (value > formatDateInput(new Date())) return 'Future dates are not allowed.'
  return ''
}

function CalendarModal({ value, onChange, onClose }) {
  const selected = new Date(`${value}T00:00:00`)
  const today = new Date()
  const todayValue = formatDateInput(today)
  const [viewDate, setViewDate] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1)
  const monthLabel = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const nextMonthStart = new Date(year, month + 1, 1)
  const canGoNext = nextMonthStart <= currentMonthStart
  const changeMonth = (delta) => setViewDate(new Date(year, month + delta, 1))
  const pick = (day) => {
    onChange(formatDateInput(new Date(year, month, day)))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl p-5 border shadow-2xl"
        style={{ background: 'var(--calendar-bg)', borderColor: 'var(--border)', animation: 'scaleIn 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => changeMonth(-1)} className="w-9 h-9 rounded-2xl grid place-items-center" style={{ background: 'var(--icon-btn-bg)', color: 'var(--text-primary)' }}>
            <ChevronLeft size={17} />
          </button>
          <div className="text-center">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              <CalendarDays size={22} strokeWidth={1.75} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{monthLabel}</p>
          </div>
          <button type="button" onClick={() => canGoNext && changeMonth(1)} disabled={!canGoNext} className="w-9 h-9 rounded-2xl grid place-items-center disabled:opacity-30" style={{ background: 'var(--icon-btn-bg)', color: 'var(--text-primary)' }}>
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {days.map((day, i) => {
            const isSelected = day && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day
            const dayValue = day ? formatDateInput(new Date(year, month, day)) : ''
            const isToday = day && todayValue === dayValue
            const isFuture = day && dayValue > todayValue
            return day ? (
              <button
                type="button"
                key={i}
                onClick={() => !isFuture && pick(day)}
                disabled={isFuture}
                className="h-9 rounded-2xl text-sm font-semibold transition-transform active:scale-95 disabled:opacity-25 disabled:active:scale-100"
                style={isSelected
                  ? { background: 'var(--accent)', color: '#07111f', boxShadow: '0 8px 18px var(--accent-shadow)' }
                  : { background: isToday ? 'var(--accent-dim)' : 'var(--filter-idle)', color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }
                }
              >
                {day}
              </button>
            ) : <div key={i} className="h-9" />
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-colors"
          style={{ background: 'var(--accent-dim)', color: 'var(--text-secondary)' }}
        >
          <X size={15} strokeWidth={2} />
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AddTransactionModal({ onClose, onAdd }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCat, setSelectedCat] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [showCalendar, setShowCalendar] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Custom category state
  const [customCats, setCustomCats] = useState(() => getCustomCategories())
  const [addingCustom, setAddingCustom] = useState(false)

  const builtIn = CATEGORIES[type]
  const custom = customCats[type] || []
  const cats = [...builtIn, ...custom]

  const validAmount = getPositiveMoneyValue(amount)
  const dateError = getDateError(date)

  const [pendingDeleteCat, setPendingDeleteCat] = useState(null)

  const deleteCustom = (name) => setPendingDeleteCat(name)
  const confirmDeleteCat = () => {
    const updated = removeCustomCategory(type, pendingDeleteCat)
    setCustomCats({ ...updated })
    if (selectedCat === pendingDeleteCat) setSelectedCat(null)
    setPendingDeleteCat(null)
  }

  const saveCustom = (name) => {
    const updated = addCustomCategory(type, name)
    setCustomCats({ ...updated })
    setSelectedCat(name)
    setAddingCustom(false)
  }

  const handleSubmit = async () => {
    if (validAmount === null || !selectedCat || dateError || submitting) return
    setSubmitting(true)
    try {
      await onAdd({ type, amount: validAmount, category: selectedCat, description: (description || selectedCat).toUpperCase(), date })
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
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Add Transaction</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: 'var(--accent-dim)', color: 'var(--text-muted)' }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {['expense', 'income'].map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setSelectedCat(null); setAddingCustom(false) }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold capitalize transition-all"
              style={type === t
                ? t === 'expense'
                  ? { background: '#e11d48', color: '#fff' }
                  : { background: 'var(--accent)', color: '#0a0f1e' }
                : { color: 'var(--text-muted)', background: 'transparent' }
              }
            >
              {t === 'income' ? <ArrowUpRight size={15} strokeWidth={2.5} /> : <ArrowDownRight size={15} strokeWidth={2.5} />}
              {t === 'income' ? 'Income' : 'Expense'}
            </button>
          ))}
        </div>

        {/* Amount */}
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

        {/* Description */}
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value.toUpperCase())}
          className="modal-input w-full rounded-xl py-3 px-4 text-sm"
          style={{ ...inputStyle, textTransform: 'uppercase' }}
        />

        {/* Date */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCalendar(v => !v)}
            className="modal-input date-input w-full rounded-xl py-3 pl-4 pr-12 text-sm text-left"
            style={inputStyle}
          >
            {new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </button>
          <CalendarDays
            size={18}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--accent)' }}
          />
        </div>
        {dateError && <p className="-mt-3 text-xs font-medium text-rose-400">{dateError}</p>}

        {/* Categories */}
        <div>
          <p className="text-xs mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</p>
          <div className="grid grid-cols-4 gap-2">
            {cats.map(name => {
              const Icon = CATEGORY_ICONS[name] || CircleDollarSign
              const active = selectedCat === name
              const isCustom = custom.includes(name)
              return (
                <div key={name} className="relative">
                  <button
                    onClick={() => setSelectedCat(name)}
                    className="w-full flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-xs transition-all"
                    style={active
                      ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)' }
                      : { background: 'var(--filter-idle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                    }
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span className="truncate w-full text-center px-1">{name}</span>
                  </button>
                  {isCustom && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteCustom(name) }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#fb7185', color: '#fff', fontSize: 8 }}
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

        <button
          onClick={handleSubmit}
          disabled={validAmount === null || !selectedCat || Boolean(dateError)}
          className="w-full py-3.5 rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, var(--accent), #0891b2)', color: '#0a0f1e', boxShadow: '0 4px 14px var(--accent-shadow)' }}
        >
          Add Transaction
        </button>
      </div>
    </div>

    {showCalendar && <CalendarModal value={date} onChange={setDate} onClose={() => setShowCalendar(false)} />}

    {addingCustom && (
      <AddCategoryModal
        type={type}
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
