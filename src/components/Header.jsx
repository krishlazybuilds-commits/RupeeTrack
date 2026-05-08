import { TrendingUp, TrendingDown, Minus, Sun, Moon, User } from 'lucide-react'
import { useTheme } from '../lib/ThemeContext'
import { fmt } from '../lib/money'

export default function Header({ stats }) {
  const now = new Date()
  const month = now.toLocaleString('default', { month: 'long', year: 'numeric' })
  const { theme, toggle } = useTheme()

  const BalanceIcon = stats.balance > 0 ? TrendingUp : stats.balance < 0 ? TrendingDown : Minus

  return (
    <div className="relative px-4 pt-6 pb-9 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(135deg, var(--header-grad), transparent)` }} />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] font-semibold" style={{ color: 'var(--accent)' }}>RupeeTrack</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{month}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              border: '1px solid var(--border)',
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun size={18} strokeWidth={1.9} />
              : <Moon size={18} strokeWidth={1.9} />
            }
          </button>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, var(--accent), #0891b2)`,
              boxShadow: `0 4px 14px var(--accent-shadow)`,
              color: '#ffffff',
            }}>
            <User size={20} strokeWidth={1.75} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-7 text-center">
        <p className="text-sm tracking-wide" style={{ color: 'var(--text-muted)' }}>Net Balance</p>
        <p className="text-[2.55rem] font-bold mt-1 tracking-tight"
          style={{ color: stats.balance >= 0 ? 'var(--accent)' : '#fb7185' }}>
          {fmt(stats.balance)}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <BalanceIcon size={12} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {stats.savingsRate}% savings rate this month
          </p>
        </div>
      </div>
    </div>
  )
}
