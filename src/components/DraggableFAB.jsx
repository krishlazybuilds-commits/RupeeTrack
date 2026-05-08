import { useRef } from 'react'
import { Plus } from 'lucide-react'

const BOTTOM = 94

export default function DraggableFAB({ onClick, label = 'Add' }) {
  const lastTriggerRef = useRef(0)

  function trigger(e) {
    e.preventDefault()
    e.stopPropagation()

    const now = Date.now()
    if (now - lastTriggerRef.current < 500) return
    lastTriggerRef.current = now
    onClick()
  }

  return (
    <button
      type="button"
      aria-label={label}
      className="fixed z-40 flex items-center gap-2 active:scale-[0.97] transition-transform"
      style={{
        bottom: `calc(${BOTTOM}px + env(safe-area-inset-bottom, 0px))`,
        // Keep the action pill inside the centered max-w-md app shell on desktop,
        // while preserving a 20px edge gap on mobile screens.
        right: 'max(20px, calc((100vw - 448px) / 2 + 20px))',
        minWidth: 84,
        height: 46,
        padding: '6px 12px 6px 7px',
        borderRadius: 18,
        color: 'var(--fab-text)',
        background: 'var(--fab-bg)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: 'var(--fab-shadow)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
      onTouchEnd={trigger}
      onClick={trigger}
    >
      <span
        aria-hidden="true"
        className="absolute inset-[1px]"
        style={{
          borderRadius: 17,
          background: 'var(--fab-surface)',
        }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          borderRadius: 18,
          background: 'var(--fab-highlight)',
        }}
      />
      <span
        className="relative grid place-items-center shrink-0"
        style={{
          width: 33,
          height: 33,
          borderRadius: 13,
          background: 'var(--fab-icon-bg)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 12px rgba(0,0,0,0.18)',
        }}
      >
        <Plus size={19} strokeWidth={2.8} color="#ffffff" />
      </span>
      <span className="relative flex flex-col items-start leading-none">
        <span className="text-[13px] font-bold tracking-tight">{label}</span>
        <span className="text-[9px] font-medium mt-1" style={{ color: 'var(--fab-muted)' }}>Entry</span>
      </span>
    </button>
  )
}
