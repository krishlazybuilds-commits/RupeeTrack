import { Suspense, lazy, useState, useMemo } from 'react'
import { RefreshCw, WifiOff } from 'lucide-react'
import Header from './Header'
import SummaryCards from './SummaryCards'
import TransactionList from './TransactionList'
import AddTransactionModal from './AddTransactionModal'
import AddBudgetModal from './AddBudgetModal'
import BottomNav from './BottomNav'
import DeleteConfirmModal from './DeleteConfirmModal'
import DraggableFAB from './DraggableFAB'
import { useTransactions, useBudgets } from '../lib/useData'

const SpendingChart = lazy(() => import('./SpendingChart'))
const BudgetTracker = lazy(() => import('./BudgetTracker'))
const CartCalculator = lazy(() => import('./CartCalculator'))

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse px-4 pt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 rounded-2xl bg-white/5" />
        <div className="h-20 rounded-2xl bg-white/5" />
      </div>
      <div className="h-48 rounded-2xl bg-white/5" />
      <div className="h-64 rounded-2xl bg-white/5" />
    </div>
  )
}

function CardFallback({ height = 180 }) {
  return (
    <div
      className="glass rounded-[26px] animate-pulse"
      style={{ height }}
    />
  )
}

export default function Dashboard() {
  const {
    transactions, loading, backendDown, refetch,
    addTransaction, deleteTransaction, deleteAllTransactions,
  } = useTransactions()
  const { budgets, updateBudget, deleteBudget, deleteAllBudgets } = useBudgets()

  const [showModal, setShowModal]         = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [activeTab, setActiveTab]         = useState('home')
  const [filter, setFilter]             = useState('all')
  // Global delete confirmation state
  const [pendingDelete, setPendingDelete] = useState(null) // { id, label, onConfirm }

  // Current month in local time (YYYY-MM) — avoids UTC/IST midnight mismatch
  const currentMonth = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }, [])
  const monthTransactions = useMemo(() => transactions.filter(t => t.date.startsWith(currentMonth)), [transactions, currentMonth])

  const stats = useMemo(() => {
    const totalIncome  = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance      = totalIncome - totalExpense
    const savingsRate  = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0
    return { totalIncome, totalExpense, balance, savingsRate }
  }, [monthTransactions])

  const filtered = filter === 'all' ? monthTransactions : monthTransactions.filter(t => t.type === filter)

  // Handlers that trigger the global modal
  const requestDelete = (id, label) => setPendingDelete({ label, onConfirm: () => deleteTransaction(id) })
  const requestDeleteAll = (label, onConfirm) => setPendingDelete({ label, onConfirm })
  const confirmDelete = () => {
    pendingDelete?.onConfirm()
    setPendingDelete(null)
  }

  return (
    <div className="app-reveal min-h-screen max-w-md mx-auto relative" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div className="app-reveal-orb app-reveal-orb-a" />
      <div className="app-reveal-orb app-reveal-orb-b" />

      {/* Offline banner */}
      {backendDown && (
        <div className="flex items-center gap-2 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-amber-400 text-xs">
          <WifiOff size={13} />
          <span>Backend offline — start the server to save data</span>
          <button onClick={refetch} className="ml-auto hover:text-white transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      )}

      <div className="app-reveal-header">
        <Header stats={stats} />
      </div>

      {loading ? <Skeleton /> : (
        <main className="app-reveal-content px-4 pt-1 pb-28 space-y-6">
          <div key={activeTab} className="page-reveal">
            {activeTab === 'home' && (
              <div className="space-y-6">
              <SummaryCards stats={stats} />
              <Suspense fallback={<CardFallback height={190} />}>
                <SpendingChart transactions={monthTransactions} />
              </Suspense>
              <div className="flex gap-2 mt-4 mb-1">
                {['all', 'income', 'expense'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                      filter === f
                        ? 'shadow-lg'
                        : ''
                    }`}
                  style={filter === f ? {
                    background: 'var(--filter-active-bg)',
                    color: 'var(--filter-active-text)',
                    border: '1px solid var(--filter-active-border)',
                    boxShadow: '0 4px 12px var(--accent-shadow)'
                  } : {
                    background: 'var(--filter-idle)',
                    color: 'var(--text-muted)'
                  }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <TransactionList transactions={filtered} onDelete={requestDelete} onDeleteAll={() => requestDeleteAll('Delete all transactions? This cannot be undone.', deleteAllTransactions)} />
              </div>
            )}
            {activeTab === 'budget' && (
              <Suspense fallback={<CardFallback height={420} />}>
                <BudgetTracker transactions={monthTransactions} budgets={budgets} updateBudget={updateBudget} deleteBudget={deleteBudget} deleteAllBudgets={deleteAllBudgets} onDeleteRequest={(label, onConfirm) => setPendingDelete({ label, onConfirm })} />
              </Suspense>
            )}
            {activeTab === 'cart' && (
              <Suspense fallback={<CardFallback height={420} />}>
                <CartCalculator />
              </Suspense>
            )}
            {activeTab === 'stats'  && (
              <div className="space-y-6">
              <Suspense fallback={<CardFallback height={230} />}>
                <SpendingChart transactions={monthTransactions} detailed />
              </Suspense>
              <TransactionList
                transactions={monthTransactions.filter(t => t.type === 'expense')}
                onDelete={requestDelete}
                onDeleteAll={() => requestDeleteAll('Delete all expense transactions? This cannot be undone.', async () => {
                  // Only delete current month's expenses — not income
                  const expenseIds = monthTransactions.filter(t => t.type === 'expense').map(t => t.id)
                  for (const id of expenseIds) await deleteTransaction(id)
                })}
                title="This Month's Expenses"
              />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Global delete confirmation - renders at root so it's on top of everything */}
      {pendingDelete && (
        <DeleteConfirmModal
          title="Delete?"
          message={pendingDelete.label}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Draggable FAB */}
      <DraggableFAB
        label={activeTab === 'budget' ? 'Budget' : 'Add'}
        onClick={() => activeTab === 'budget' ? setShowBudgetModal(true) : setShowModal(true)}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdd={addTransaction}
        />
      )}
      {showBudgetModal && (
        <AddBudgetModal
          onClose={() => setShowBudgetModal(false)}
          onAdd={updateBudget}
          existingBudgets={budgets}
        />
      )}
    </div>
  )
}
