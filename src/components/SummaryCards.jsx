import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { fmt } from '../lib/money'

export default function SummaryCards({ stats }) {
  const totalFlow = stats.totalIncome + stats.totalExpense

  const cards = [
    {
      label: 'Income',
      value: stats.totalIncome,
      helper: 'Money coming in',
      Icon: ArrowUpRight,
      accent: '#00d4aa',
      accentFade: 'rgba(0,212,170,0.20)',
      bg: 'linear-gradient(145deg, rgba(6,95,70,0.80) 0%, rgba(6,78,59,0.55) 55%, rgba(0,212,170,0.12) 100%)',
      borderGrad: 'linear-gradient(145deg, rgba(0,212,170,0.55), rgba(0,212,170,0.10))',
      glow: '0 18px 44px -20px rgba(0,212,170,0.48)',
      barWidth: totalFlow > 0 ? `${Math.round((stats.totalIncome / totalFlow) * 100)}%` : '0%',
    },
    {
      label: 'Expense',
      value: stats.totalExpense,
      helper: 'Money going out',
      Icon: ArrowDownRight,
      accent: '#fb7185',
      accentFade: 'rgba(251,113,133,0.20)',
      bg: 'linear-gradient(145deg, rgba(76,5,25,0.82) 0%, rgba(136,19,55,0.45) 55%, rgba(251,113,133,0.10) 100%)',
      borderGrad: 'linear-gradient(145deg, rgba(251,113,133,0.55), rgba(251,113,133,0.10))',
      glow: '0 18px 44px -20px rgba(244,63,94,0.42)',
      barWidth: totalFlow > 0 ? `${Math.round((stats.totalExpense / totalFlow) * 100)}%` : '0%',
    },
  ]

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-1 pt-[7px]">
        <div>
          <p className="section-eyebrow">Cash Flow</p>
          <h2 className="section-title">Income & Expense</h2>
        </div>
        <p className="section-meta">This month overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4" style={{ padding: '4px 2px 8px', margin: '-4px -2px -8px' }}>
        {cards.map((c) => (
          /* Outer wrapper = gradient border */
          <div
            key={c.label}
            style={{
              borderRadius: 26,
              padding: 1.5,
              background: c.borderGrad,
              boxShadow: c.glow,
            }}
          >
            {/* Inner card = actual content */}
            <div
              style={{
                borderRadius: 25,
                overflow: 'hidden',
                padding: '16px 16px 20px',
                minHeight: 162,
                background: c.bg,
                backdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-0.5">
                <div className="space-y-1.5">
                  <span className="text-sm font-semibold tracking-wide block" style={{ color: '#fff' }}>{c.label}</span>
                  <p className="text-[11px] leading-4 max-w-[110px]" style={{ color: 'rgba(255,255,255,0.52)' }}>{c.helper}</p>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 14, flexShrink: 0,
                  background: c.accentFade,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <c.Icon size={18} strokeWidth={2.5} style={{ color: c.accent }} />
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 28 }} className="space-y-3">
                <p className="text-[1.42rem] leading-none font-bold tracking-tight" style={{ color: c.accent }}>{fmt(c.value)}</p>
                <div style={{ height: 4, borderRadius: 99, overflow: 'hidden', background: 'rgba(255,255,255,0.13)' }}>
                  <div style={{ height: '100%', borderRadius: 99, width: c.barWidth, background: c.accent, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
