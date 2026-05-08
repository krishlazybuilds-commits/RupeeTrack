import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl pointer-events-auto fade-in"
            style={{
              background: t.type === 'success' ? 'rgba(0,212,170,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${t.type === 'success' ? 'rgba(0,212,170,0.35)' : 'rgba(239,68,68,0.35)'}`,
              backdropFilter: 'blur(12px)',
              color: t.type === 'success' ? 'var(--accent)' : '#ef4444',
            }}
          >
            {t.type === 'success'
              ? <CheckCircle2 size={16} strokeWidth={2} className="shrink-0" />
              : <XCircle size={16} strokeWidth={2} className="shrink-0" />
            }
            <p className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
