import { Home, Target, BarChart2, ShoppingCart, WalletCards } from 'lucide-react'

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', Icon: Home, label: 'Home' },
    { id: 'budget', Icon: Target, label: 'Budget' },
    { id: 'emi', Icon: WalletCards, label: 'EMI' },
    { id: 'cart', Icon: ShoppingCart, label: 'Cart' },
    { id: 'stats', Icon: BarChart2, label: 'Stats' },
  ]

  return (
    <div className="app-reveal-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
      <div className="glass rounded-[28px] px-3 py-2.5 backdrop-blur-xl" style={{ border: '1px solid var(--border)' }}>
        <div className="flex justify-around gap-1">
          {tabs.map(({ id, Icon, label }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-1 flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all"
                style={active ? {
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                } : {
                  color: 'var(--text-muted)'
                }}
              >
                <Icon size={19} strokeWidth={active ? 2.25 : 1.85} />
                <span className="text-[11px] font-medium">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
