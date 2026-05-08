import { useMemo, useState } from 'react'
import { Banknote, CalendarClock, CheckCircle2, IndianRupee, Plus, Trash2, WalletCards } from 'lucide-react'
import { fmt, sanitizeMoneyInput } from '../lib/money'

const today = new Date()
const todayDay = today.getDate()
const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

function Field({ label, children }) {
  return <label className="space-y-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}><span>{label}</span>{children}</label>
}

function inputClass() {
  return 'w-full rounded-2xl px-3 py-2.5 text-sm outline-none transition-all bg-white/5 border border-white/10 focus:border-emerald-400/60'
}

export default function EmiTracker({ emis, addEmi, payEmi, deleteEmi }) {
  const [form, setForm] = useState({ name: '', lender: '', principal: '', emiAmount: '', totalInstallments: '', paidInstallments: '0', dueDay: String(todayDay), startDate: todayString, notes: '' })
  const [showForm, setShowForm] = useState(false)

  const summary = useMemo(() => {
    const active = emis.filter(e => e.active)
    return {
      monthlyOutflow: active.reduce((s, e) => s + Number(e.emiAmount || 0), 0),
      remaining: active.reduce((s, e) => s + Number(e.remainingAmount || 0), 0),
      dueSoon: active.filter(e => Math.abs(Number(e.dueDay) - todayDay) <= 3).length,
    }
  }, [emis])

  const submit = async (e) => {
    e.preventDefault()
    await addEmi({
      ...form,
      principal: Number(form.principal),
      emiAmount: Number(form.emiAmount),
      totalInstallments: Number(form.totalInstallments),
      paidInstallments: Number(form.paidInstallments || 0),
      dueDay: Number(form.dueDay),
      category: 'Other',
    })
    setForm({ name: '', lender: '', principal: '', emiAmount: '', totalInstallments: '', paidInstallments: '0', dueDay: String(todayDay), startDate: todayString, notes: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] p-5 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #115e59 55%, #10b981 100%)' }}>
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/80">EMI Control</p>
            <h2 className="mt-2 text-2xl font-black">Loan payments, simplified</h2>
            <p className="mt-2 text-sm text-emerald-50/80">Track instalments, due dates, and convert paid EMIs into expenses.</p>
          </div>
          <div className="rounded-3xl bg-white/15 p-3 backdrop-blur"><WalletCards size={28} /></div>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/12 p-3"><p className="text-[10px] text-emerald-50/70">Monthly</p><p className="text-sm font-black">{fmt(summary.monthlyOutflow)}</p></div>
          <div className="rounded-2xl bg-white/12 p-3"><p className="text-[10px] text-emerald-50/70">Left</p><p className="text-sm font-black">{fmt(summary.remaining)}</p></div>
          <div className="rounded-2xl bg-white/12 p-3"><p className="text-[10px] text-emerald-50/70">Due soon</p><p className="text-sm font-black">{summary.dueSoon}</p></div>
        </div>
      </section>

      <button onClick={() => setShowForm(v => !v)} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
        <Plus size={18} /> {showForm ? 'Close EMI form' : 'Add EMI payment'}
      </button>

      {showForm && (
        <form onSubmit={submit} className="glass grid grid-cols-2 gap-3 rounded-[26px] p-4">
          <div className="col-span-2"><Field label="Loan name"><input required className={inputClass()} placeholder="Home loan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field></div>
          <Field label="Lender"><input className={inputClass()} placeholder="HDFC Bank" value={form.lender} onChange={e => setForm({ ...form, lender: e.target.value })} /></Field>
          <Field label="Due day"><input required min="1" max="31" type="number" className={inputClass()} value={form.dueDay} onChange={e => setForm({ ...form, dueDay: e.target.value })} /></Field>
          <Field label="Principal"><input required inputMode="decimal" className={inputClass()} value={form.principal} onChange={e => setForm({ ...form, principal: sanitizeMoneyInput(e.target.value) })} /></Field>
          <Field label="Monthly EMI"><input required inputMode="decimal" className={inputClass()} value={form.emiAmount} onChange={e => setForm({ ...form, emiAmount: sanitizeMoneyInput(e.target.value) })} /></Field>
          <Field label="Total months"><input required min="1" type="number" className={inputClass()} value={form.totalInstallments} onChange={e => setForm({ ...form, totalInstallments: e.target.value })} /></Field>
          <Field label="Paid months"><input min="0" type="number" className={inputClass()} value={form.paidInstallments} onChange={e => setForm({ ...form, paidInstallments: e.target.value })} /></Field>
          <div className="col-span-2"><Field label="Start date"><input required type="date" className={inputClass()} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></Field></div>
          <button className="col-span-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white">Save EMI</button>
        </form>
      )}

      <div className="space-y-3">
        {emis.length === 0 ? (
          <div className="glass rounded-[26px] p-6 text-center"><Banknote className="mx-auto mb-3 text-emerald-400" /><p className="font-bold">No EMI payments yet</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add home, vehicle, education or personal loan EMIs here.</p></div>
        ) : emis.map(emi => {
          const dueState = emi.dueDay < todayDay ? 'Overdue' : emi.dueDay === todayDay ? 'Due today' : `Due ${emi.dueDay}`
          return (
            <article key={emi.id} className="glass rounded-[28px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3"><div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400"><IndianRupee size={20} /></div><div><h3 className="font-black">{emi.name}</h3><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emi.lender || 'Personal loan'} • {emi.paidInstallments}/{emi.totalInstallments} paid</p></div></div>
                <button onClick={() => deleteEmi(emi.id)} className="rounded-xl p-2 text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
              </div>
              <div className="mt-4 flex items-end justify-between"><div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly EMI</p><p className="text-xl font-black">{fmt(emi.emiAmount)}</p></div><span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300"><CalendarClock size={13} className="mr-1 inline" />{dueState}</span></div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${Math.min(emi.progress, 100)}%` }} /></div>
              <div className="mt-2 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}><span>{emi.progress}% completed</span><span>{fmt(emi.remainingAmount)} left</span></div>
              <button disabled={!emi.active} onClick={() => payEmi(emi.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-black disabled:opacity-50" style={{ background: emi.active ? 'var(--accent-dim)' : 'var(--filter-idle)', color: emi.active ? 'var(--accent)' : 'var(--text-muted)' }}><CheckCircle2 size={17} /> {emi.active ? 'Mark this EMI paid' : 'Completed'}</button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
