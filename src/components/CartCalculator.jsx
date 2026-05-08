import { useMemo, useState, useEffect } from 'react'
import { Plus, ShoppingCart, Trash2, Package, ShoppingBag, Eraser, ChevronDown, ChevronUp } from 'lucide-react'
import { getPositiveMoneyValue, sanitizeMoneyInput, fmt } from '../lib/money'

export default function CartCalculator() {
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart_items')
      return saved ? JSON.parse(saved).map(item => ({ ...item, name: String(item.name || '').toUpperCase() })) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('cart_items', JSON.stringify(items)) } catch { /* ignore cart persistence failures */ }
  }, [items])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items]
  )
  const validPrice = getPositiveMoneyValue(price)

  const addItem = (e) => {
    e.preventDefault()
    if (validPrice === null) return

    setItems(prev => [
      {
        id: Date.now(),
        name: (productName.trim() || `Product ${prev.length + 1}`).toUpperCase(),
        price: validPrice,
      },
      ...prev,
    ])
    setProductName('')
    setPrice('')
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => setItems([])

  const CART_PAGE = 8
  const [showAll, setShowAll] = useState(false)
  const visibleItems = showAll ? items : items.slice(0, CART_PAGE)
  const hasMore = items.length > CART_PAGE

  return (
    <div className="space-y-4 pt-2 fade-in">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="section-eyebrow">Calculator</p>
          <h2 className="section-title">Cart Value</h2>
        </div>
        <p className="section-meta">{items.length} items</p>
      </div>

      <div className="rounded-[26px] p-4 border"
        style={{ background: 'linear-gradient(135deg, rgba(42,157,143,0.12), var(--bg-base) 60%, rgba(8,145,178,0.08))', borderColor: 'var(--accent-dim)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#00d4aa]/15 text-[#00d4aa] flex items-center justify-center ring-1 ring-white/5">
            <ShoppingCart size={21} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total cart value</p>
            <p className="text-3xl font-bold tracking-tight mt-1" style={{ color: 'var(--accent)' }}>{fmt(total)}</p>
          </div>
        </div>

        <form onSubmit={addItem} className="space-y-3">
          <input
            value={productName}
            onChange={e => setProductName(e.target.value.toUpperCase())}
            placeholder="Product name (optional)"
            className="modal-input w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)', color: 'var(--text-primary)', textTransform: 'uppercase' }}
          />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>₹</span>
              <input
                value={price}
                onChange={e => setPrice(sanitizeMoneyInput(e.target.value))}
                type="text"
                inputMode="decimal"
                placeholder="Enter price"
                className="modal-input w-full rounded-2xl pl-8 pr-4 py-3 text-sm focus:outline-none"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              type="submit"
              className="px-4 rounded-2xl font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#0a0f1e' }}
              disabled={validPrice === null}
            >
              <Plus size={17} strokeWidth={2.5} />
              Add
            </button>
          </div>
        </form>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between px-1">
          <div>
            <p className="section-eyebrow">Items</p>
            <h2 className="section-title">Added Products</h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 hover:border-rose-500/40 transition-all active:scale-95"
            >
              <Eraser size={12} strokeWidth={2.2} />
              Delete All
            </button>
          )}
        </div>

        <div className="glass rounded-[26px] overflow-hidden">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                <ShoppingBag size={28} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Cart is empty</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Enter a price and tap&nbsp;<span style={{ color: 'var(--accent)' }}>Add</span>&nbsp;to start tracking your cart value.</p>
              </div>
            </div>
          ) : (
            <div>
              {visibleItems.map((item, idx) => (
                <div key={item.id}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors group fade-in"
                  style={{ borderTop: idx > 0 ? '1px solid var(--divider)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                    <Package size={17} strokeWidth={1.85} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Cart item</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--accent)' }}>{fmt(item.price)}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: 'var(--icon-btn-bg)', color: 'var(--icon-btn-color)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.15)'; e.currentTarget.style.color = '#fb7185' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--icon-btn-bg)'; e.currentTarget.style.color = 'var(--icon-btn-color)' }}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => setShowAll(v => !v)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold transition-colors"
                  style={{ borderTop: '1px solid var(--divider)', color: 'var(--accent)' }}
                >
                  {showAll ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {items.length} items</>}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
