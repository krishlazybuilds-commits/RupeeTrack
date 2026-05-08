import { useMemo, memo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Sparkles, BarChart2 } from 'lucide-react'
import { fmt } from '../lib/money'

const COLORS = ['#00d4aa', '#0891b2', '#f59e0b', '#fb7185', '#a78bfa', '#38bdf8', '#34d399', '#f97316']

// Defined outside component so Recharts doesn't get a new reference on every render
const CustomTooltip = memo(({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="border rounded-xl px-3 py-2 text-xs shadow-xl"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{payload[0].name || payload[0].payload?.day}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
        ))}
      </div>
    )
  }
  return null
})

function EmptyChart({ detailed }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
        {detailed ? <BarChart2 size={26} strokeWidth={1.5} /> : <Sparkles size={26} strokeWidth={1.5} />}
      </div>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {detailed ? 'No activity yet' : 'No spending yet'}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {detailed
            ? 'Add income or expense transactions to see your daily movement here.'
            : 'Start adding expenses and your spending breakdown will appear here.'}
        </p>
      </div>
    </div>
  )
}

export default function SpendingChart({ transactions, detailed }) {
  const categoryData = useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [transactions])

  const dailyData = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      // Use full date as key for sorting, but show human-friendly label e.g. "May 1"
      const key = t.date // YYYY-MM-DD
      if (!map[key]) {
        const label = new Date(t.date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        map[key] = { day: label, _key: key, income: 0, expense: 0 }
      }
      map[key][t.type] += t.amount
    })
    return Object.values(map).sort((a, b) => a._key.localeCompare(b._key))
  }, [transactions])

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="section-eyebrow">Insights</p>
          <h2 className="section-title">{detailed ? 'Income vs Expense' : 'Spending Breakdown'}</h2>
        </div>
        <p className="section-meta">{detailed ? 'Daily movement' : 'Top categories'}</p>
      </div>

      <div className="glass rounded-[26px] p-4">
        {!detailed
          ? categoryData.length === 0
            ? <EmptyChart detailed={false} />
            : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="45%" height={130}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryData.slice(0, 5).map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-3 h-4 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                      </div>
                      <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-primary)' }}>{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          : dailyData.length === 0
            ? <EmptyChart detailed={true} />
            : (
              <ResponsiveContainer width="100%" height={165}>
                <BarChart data={dailyData} barSize={14}>
                  <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" fill="#00d4aa" radius={4} name="Income" />
                  <Bar dataKey="expense" fill="#fb7185" radius={4} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            )
        }
      </div>
    </section>
  )
}
