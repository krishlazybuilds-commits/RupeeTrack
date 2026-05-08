import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Trash2, ReceiptText, Eraser, ChevronDown, ChevronUp } from 'lucide-react'
import { CATEGORY_ICONS } from '../lib/categoryIcons'
import { fmt } from '../lib/money'

const PAGE_SIZE = 8

export default function TransactionList({ transactions, onDelete, onDeleteAll, title }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? transactions : transactions.slice(0, PAGE_SIZE)
  const hasMore = transactions.length > PAGE_SIZE

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="section-eyebrow">Activity</p>
          <h2 className="section-title">{title || 'Recent Transactions'}</h2>
        </div>
        <div className="flex items-center gap-2">
          {transactions.length > 0 && onDeleteAll && (
            <button
              onClick={onDeleteAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
            >
              <Eraser size={12} strokeWidth={2.2} />
              Delete All
            </button>
          )}
          <p className="section-meta">{transactions.length} items</p>
        </div>
      </div>

      <div className="glass rounded-[26px] overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              <ReceiptText size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No transactions yet</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Tap the&nbsp;<span style={{ color: 'var(--accent)' }}>+</span>&nbsp;button to add your first transaction.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {visible.map((tx, idx) => {
              const Icon = CATEGORY_ICONS[tx.category] || CATEGORY_ICONS['Other']
              const isIncome = tx.type === 'income'
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors fade-in"
                  style={{
                    borderTop: idx > 0 ? '1px solid var(--divider)' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={isIncome
                      ? { background: 'rgba(0,212,170,0.15)', color: '#00d4aa' }
                      : { background: 'rgba(251,113,133,0.15)', color: '#fb7185' }
                    }>
                    <Icon size={18} strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {tx.category} · {new Date(tx.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-sm font-bold"
                      style={{ color: isIncome ? 'var(--accent)' : '#fb7185' }}>
                      {isIncome ? <ArrowUpRight size={14} strokeWidth={2.5} /> : <ArrowDownRight size={14} strokeWidth={2.5} />}
                      {fmt(tx.amount)}
                    </div>
                    <button
                      onClick={() => onDelete(tx.id, `Delete "${tx.description}" (${fmt(tx.amount)})?`)}
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: 'var(--icon-btn-bg)', color: 'var(--icon-btn-color)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.15)'; e.currentTarget.style.color = '#fb7185' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--icon-btn-bg)'; e.currentTarget.style.color = 'var(--icon-btn-color)' }}
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
            {hasMore && (
              <button
                onClick={() => setShowAll(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors"
                style={{ borderTop: '1px solid var(--divider)', color: 'var(--accent)' }}
              >
                {showAll ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {transactions.length} transactions</>}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
