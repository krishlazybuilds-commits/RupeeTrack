import { useMemo, useState } from 'react'
import { AlertTriangle, Wallet, Pencil, Check, X, Trash2, PiggyBank, Eraser } from 'lucide-react'
import { CATEGORY_ICONS } from '../lib/categoryIcons'
import { getNonNegativeMoneyValue, sanitizeMoneyInput, fmt } from '../lib/money'

function BudgetRow({ cat, budget, spent: s, onEdit, onDelete, onDeleteActual }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(String(budget))

  const pct = budget > 0 ? Math.min((s / budget) * 100, 100) : 0
  const validBudget = getNonNegativeMoneyValue(val)
  const over = s > budget
  const nearLimit = !over && pct >= 80   // 80%+ warning
  const Icon = CATEGORY_ICONS[cat] || CATEGORY_ICONS.Other

  const save = () => {
    if (validBudget !== null) { onEdit(cat, validBudget); setEditing(false) }
  }
  const deleteBudget = () => onDelete(`Delete the ${cat} budget limit?`, () => onDeleteActual(cat))

  return (
    <div className="px-4 py-3.5" style={{ borderTop: '1px solid var(--divider)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={over
            ? { background: 'rgba(251,113,133,0.15)', color: '#fb7185' }
            : nearLimit
              ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
              : { background: 'var(--accent-dim)', color: 'var(--accent)' }
          }>
          <Icon size={15} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0 flex justify-between items-center gap-4">
          <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{cat}</p>
          {editing ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={val}
                onChange={e => setVal(sanitizeMoneyInput(e.target.value))}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
                className="w-24 rounded-lg px-2 py-0.5 text-xs focus:outline-none"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
              />
              <button onClick={save} disabled={validBudget === null} className="transition-colors disabled:opacity-30"
                style={{ color: 'var(--accent)' }}><Check size={13} /></button>
              <button onClick={() => setEditing(false)} className="transition-colors"
                style={{ color: 'var(--text-muted)' }}><X size={13} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                {over && <AlertTriangle size={13} strokeWidth={2} className="text-rose-400 flex-shrink-0" />}
                {nearLimit && !over && <AlertTriangle size={13} strokeWidth={2} style={{ color: '#f59e0b' }} className="flex-shrink-0" />}
                <p className="text-xs font-semibold whitespace-nowrap"
                  style={{ color: over ? '#fb7185' : nearLimit ? '#f59e0b' : 'var(--text-secondary)' }}>
                  {fmt(s)} / {fmt(budget)}
                </p>
                {(over || nearLimit) && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={over
                      ? { background: 'rgba(251,113,133,0.15)', color: '#fb7185' }
                      : { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
                    }>
                    {over ? 'Over!' : `${Math.round(pct)}%`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pl-1">
                <button
                  onClick={() => { setVal(String(budget)); setEditing(true) }}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'var(--icon-btn-bg)', color: 'var(--icon-btn-color)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--icon-btn-bg)'; e.currentTarget.style.color = 'var(--icon-btn-color)' }}
                  aria-label={`Edit ${cat} budget`}
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={deleteBudget}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'var(--icon-btn-bg)', color: 'var(--icon-btn-color)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.15)'; e.currentTarget.style.color = '#fb7185' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--icon-btn-bg)'; e.currentTarget.style.color = 'var(--icon-btn-color)' }}
                  aria-label={`Delete ${cat} budget`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-[calc(100%-2.75rem)] rounded-full h-1.5 overflow-hidden ml-11"
        style={{ background: 'var(--progress-track)' }}>
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: over ? '#ef4444' : pct > 75 ? '#f59e0b' : 'var(--accent)'
          }}
        />
      </div>
    </div>
  )
}

export default function BudgetTracker({ transactions, budgets, updateBudget, deleteBudget, deleteAllBudgets, onDeleteRequest }) {
  const budgetsLoading = !budgets

  const spent = useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return map
  }, [transactions])

  if (budgetsLoading) {
    return <div className="animate-pulse space-y-3 pt-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-[26px]" style={{ background: 'var(--accent-dim)' }} />)}</div>
  }

  const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0)
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0)
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  return (
    <div className="space-y-4 pt-2 fade-in">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="section-eyebrow">Planning</p>
          <h2 className="section-title">Budget Overview</h2>
        </div>
        <p className="section-meta">Track category limits</p>
      </div>

      <div className="glass rounded-[26px] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            <Wallet size={18} strokeWidth={1.75} />
          </div>
          <div className="flex-1 flex justify-between gap-3">
            <p className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>Monthly Budget</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{fmt(totalSpent)} / {fmt(totalBudget)}</p>
          </div>
        </div>
        <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'var(--progress-track)' }}>
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{
              width: `${overallPct}%`,
              background: overallPct > 85 ? '#ef4444' : overallPct > 60 ? '#f59e0b' : 'var(--accent)'
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          {Math.round(overallPct)}% used
          {totalSpent > totalBudget
            ? ` · ${fmt(totalSpent - totalBudget)} over budget`
            : ` · ${fmt(totalBudget - totalSpent)} remaining`
          }
        </p>
      </div>

      <section className="space-y-2.5">
        <div className="flex items-end justify-between px-1">
          <div>
            <p className="section-eyebrow">Categories</p>
            <h2 className="section-title">Budget Limits</h2>
          </div>
          <div className="flex items-center gap-2">
            {Object.keys(budgets).length > 0 && (
              <button
                onClick={() => onDeleteRequest('Delete all budgets? This cannot be undone.', deleteAllBudgets)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
              >
                <Eraser size={12} strokeWidth={2.2} />
                Delete All
              </button>
            )}
            <p className="section-meta">Tap edit to change</p>
          </div>
        </div>

        <div className="glass rounded-[26px] overflow-hidden">
          {Object.keys(budgets).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                <PiggyBank size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No budgets set</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Add category budgets using the&nbsp;<span style={{ color: 'var(--accent)' }}>+</span>&nbsp;button to start tracking your spending limits.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {Object.entries(budgets).map(([cat, budget], idx) => (
                <BudgetRow
                  key={cat}
                  cat={cat}
                  budget={budget}
                  spent={spent[cat] || 0}
                  onEdit={updateBudget}
                  onDelete={(label, onConfirm) => onDeleteRequest(label, onConfirm)}
                  onDeleteActual={deleteBudget}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
