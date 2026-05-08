import { useMemo, useState } from 'react'
import { Banknote, CheckCircle2, IndianRupee, Plus, Trash2, WalletCards } from 'lucide-react'
import { fmt } from '../lib/money'
import AddEmiModal from './AddEmiModal'
import DeleteConfirmModal from './DeleteConfirmModal'

export default function EmiTracker({ emis, addEmi, payEmi, deleteEmi }) {
  const [showModal, setShowModal] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const summary = useMemo(() => ({
    loans: emis.length,
    totalEmi: emis.reduce((s, e) => s + Number(e.emiAmount || 0), 0),
    paymentsMade: emis.reduce((s, e) => s + Number(e.paidInstallments || 0), 0),
  }), [emis])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await deleteEmi(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[30px] p-5 text-white shadow-2xl" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #115e59 55%, #10b981 100%)' }}>
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/80">EMI Control</p>
            <h2 className="mt-2 text-2xl font-black">Loans and EMI amount</h2>
            <p className="mt-2 text-sm text-emerald-50/80">Keep only the loan name and EMI amount, then mark payments when paid.</p>
          </div>
          <div className="rounded-3xl bg-white/15 p-3 backdrop-blur"><WalletCards size={28} /></div>
        </div>
        <div className="relative mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/12 p-3"><p className="text-[10px] text-emerald-50/70">Loans</p><p className="text-sm font-black">{summary.loans}</p></div>
          <div className="rounded-2xl bg-white/12 p-3"><p className="text-[10px] text-emerald-50/70">Total EMI</p><p className="text-sm font-black">{fmt(summary.totalEmi)}</p></div>
          <div className="rounded-2xl bg-white/12 p-3"><p className="text-[10px] text-emerald-50/70">Paid</p><p className="text-sm font-black">{summary.paymentsMade}</p></div>
        </div>
      </section>

      <button onClick={() => setShowModal(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-lg active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
        <Plus size={18} /> Add EMI payment
      </button>

      <div className="space-y-3">
        {emis.length === 0 ? (
          <div className="glass rounded-[26px] p-6 text-center"><Banknote className="mx-auto mb-3 text-emerald-400" /><p className="font-bold">No EMI payments yet</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add only a loan name and amount to keep it simple.</p></div>
        ) : emis.map(emi => (
          <article key={emi.id} className="glass rounded-[28px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3"><div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-400"><IndianRupee size={20} /></div><div><h3 className="font-black">{emi.name}</h3><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emi.paidInstallments || 0} payments marked</p></div></div>
              <button onClick={() => setPendingDelete(emi)} className="rounded-xl p-2 text-red-400 hover:bg-red-500/10"><Trash2 size={16} /></button>
            </div>
            <div className="mt-4 flex items-end justify-between"><div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>EMI Amount</p><p className="text-xl font-black">{fmt(emi.emiAmount)}</p></div></div>
            <button onClick={() => payEmi(emi.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-black" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}><CheckCircle2 size={17} /> Mark this EMI paid</button>
          </article>
        ))}
      </div>

      {showModal && (
        <AddEmiModal
          onClose={() => setShowModal(false)}
          onAdd={addEmi}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          title="Delete EMI?"
          message={`Remove "${pendingDelete.name}" from your EMI list?`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
