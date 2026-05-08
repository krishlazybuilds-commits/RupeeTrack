import { useEffect, useState } from 'react'

function getTheme() {
  const saved = localStorage.getItem('rupeetrack_theme')
  if (saved) return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const THEMES = {
  dark: {
    bg: '#0a0f1e',
    accent: '#00d4aa',
    accentB: '#38bdf8',
    orbA: 'rgba(0,212,170,0.18)',
    orbB: 'rgba(8,145,178,0.14)',
    iconBg: 'linear-gradient(145deg, rgba(0,212,170,0.22), rgba(8,145,178,0.14))',
    iconBorder: 'rgba(0,212,170,0.4)',
    iconShadow: '0 0 32px rgba(0,212,170,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
    subtitleColor: 'rgba(148,163,184,0.8)',
    dotColor: '#00d4aa',
    ringGradient: 'conic-gradient(from 0deg, #00d4aa, #0891b2, #00d4aa)',
  },
  light: {
    bg: '#f0faf7',
    accent: '#2a9d8f',
    accentB: '#0891b2',
    orbA: 'rgba(42,157,143,0.18)',
    orbB: 'rgba(8,145,178,0.12)',
    iconBg: 'linear-gradient(145deg, rgba(42,157,143,0.18), rgba(8,145,178,0.12))',
    iconBorder: 'rgba(42,157,143,0.45)',
    iconShadow: '0 0 28px rgba(42,157,143,0.22), inset 0 1px 0 rgba(255,255,255,0.6)',
    subtitleColor: 'rgba(46,92,84,0.75)',
    dotColor: '#2a9d8f',
    ringGradient: 'conic-gradient(from 0deg, #2a9d8f, #0891b2, #2a9d8f)',
  },
}

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter') // enter → pulse → exit
  const t = THEMES[getTheme()]

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('pulse'), 600)
    const t2 = setTimeout(() => setPhase('exit'), 1800)
    const t3 = setTimeout(() => onDone(), 2300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: t.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.04)' : 'scale(1)',
        transition: phase === 'exit' ? 'opacity 0.5s ease, transform 0.5s ease' : 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 340, height: 340, borderRadius: '50%',
          background: t.orbA, filter: 'blur(80px)',
          top: '10%', left: '50%', transform: 'translateX(-50%)',
          animation: 'orbFloat 3s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: t.orbB, filter: 'blur(60px)',
          bottom: '18%', right: '18%',
          animation: 'orbFloat 3.6s ease-in-out infinite reverse',
        }} />
      </div>

      {/* Logo ring */}
      <div style={{
        position: 'relative',
        animation: phase === 'enter' ? 'logoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' : undefined,
      }}>
        {/* Outer glow ring */}
        <div style={{
          position: 'absolute', inset: -14, borderRadius: '50%',
          background: t.ringGradient,
          opacity: phase === 'pulse' ? 0.7 : 0.3,
          filter: 'blur(6px)',
          animation: 'spin 2.5s linear infinite',
          transition: 'opacity 0.4s',
        }} />
        {/* Icon circle */}
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: t.iconBg,
          border: `1.5px solid ${t.iconBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: t.iconShadow,
          position: 'relative',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: 42, lineHeight: 1, color: t.accent }}>₹</span>
        </div>
      </div>

      {/* App name */}
      <div style={{
        textAlign: 'center',
        animation: 'fadeUp 0.7s 0.3s ease both',
      }}>
        <div style={{
          fontSize: 28, fontWeight: 700, letterSpacing: '0.02em',
          background: `linear-gradient(90deg, ${t.accent}, ${t.accentB})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          RupeeTrack
        </div>
        <div style={{
          fontSize: 13, color: t.subtitleColor, marginTop: 4,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          Smart Money Manager
        </div>
      </div>

      {/* Loading dots */}
      <div style={{
        display: 'flex', gap: 8, marginTop: 8,
        animation: 'fadeUp 0.7s 0.6s ease both',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: t.dotColor,
            animation: `dotBounce 1s ${i * 0.16}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes logoIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50%       { transform: translateY(-18px) translateX(-50%); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
