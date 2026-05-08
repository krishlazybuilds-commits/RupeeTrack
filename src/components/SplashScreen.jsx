import { useEffect, useState } from 'react'

function getTheme() {
  const saved = localStorage.getItem('rupeetrack_theme')
  if (saved) return saved
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const THEMES = {
  dark: {
    bg: '#080c14',
    bgGrad: 'radial-gradient(ellipse 80% 60% at 50% 0%, #0d1a2e 0%, #080c14 100%)',
    accent: '#00d4aa',
    accentB: '#38bdf8',
    logoRing: 'conic-gradient(from 180deg, #00d4aa 0%, #38bdf8 55%, #00d4aa 100%)',
    titleColor: '#f1f5f9',
    subtitleColor: 'rgba(148,163,184,0.6)',
    progressTrack: 'rgba(255,255,255,0.06)',
    progressFill: 'linear-gradient(90deg, #00d4aa, #38bdf8)',
    glowColor: 'rgba(0,212,170,0.2)',
  },
  light: {
    bg: '#fafcff',
    bgGrad: 'radial-gradient(ellipse 80% 60% at 50% 0%, #e8f4f8 0%, #fafcff 100%)',
    accent: '#0f9980',
    accentB: '#0891b2',
    logoRing: 'conic-gradient(from 180deg, #0f9980 0%, #0891b2 55%, #0f9980 100%)',
    titleColor: '#0f172a',
    subtitleColor: 'rgba(71,85,105,0.7)',
    progressTrack: 'rgba(0,0,0,0.07)',
    progressFill: 'linear-gradient(90deg, #0f9980, #0891b2)',
    glowColor: 'rgba(15,153,128,0.15)',
  },
}

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('idle') // idle → reveal → progress → exit
  const [progress, setProgress] = useState(0)
  const theme = getTheme()
  const t = THEMES[theme]

  useEffect(() => {
    // Kick off reveal after paint
    const r0 = requestAnimationFrame(() => setPhase('reveal'))

    // Start progress bar after logo settles
    const t1 = setTimeout(() => setPhase('progress'), 500)

    // Animate progress bar from 0→100 over ~1000ms
    let raf
    let start = null
    const duration = 1000
    function tick(ts) {
      if (!start) start = ts
      const pct = Math.min(((ts - start) / duration) * 100, 100)
      setProgress(pct)
      if (pct < 100) raf = requestAnimationFrame(tick)
    }
    const t2 = setTimeout(() => { raf = requestAnimationFrame(tick) }, 600)

    // Exit
    const t3 = setTimeout(() => setPhase('exit'), 1700)
    const t4 = setTimeout(() => onDone(), 2100)

    return () => {
      cancelAnimationFrame(r0)
      cancelAnimationFrame(raf)
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
    }
  }, [onDone])

  const isExiting = phase === 'exit'
  const isRevealed = phase !== 'idle'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: t.bgGrad,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
        opacity: isExiting ? 0 : 1,
        transition: isExiting ? 'opacity 0.4s cubic-bezier(0.4,0,1,1)' : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Subtle noise overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
      }} />

      {/* Glow behind logo */}
      <div style={{
        position: 'absolute',
        width: 280, height: 280, borderRadius: '50%',
        background: t.glowColor,
        filter: 'blur(60px)',
        opacity: isRevealed ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }} />

      {/* === Logo block === */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 28,
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Icon */}
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          {/* Spinning gradient ring */}
          <div style={{
            position: 'absolute', inset: -3,
            borderRadius: '50%',
            background: t.logoRing,
            animation: 'spinRing 3s linear infinite',
            opacity: 0.85,
          }} />
          {/* Inner mask to make it a ring */}
          <div style={{
            position: 'absolute', inset: 2,
            borderRadius: '50%',
            background: theme === 'dark' ? '#080c14' : '#fafcff',
          }} />
          {/* Center symbol */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: 36, lineHeight: 1,
              background: t.logoRing,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}>₹</span>
          </div>
        </div>

        {/* App name + tagline */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em',
            color: t.titleColor,
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
            marginBottom: 6,
          }}>
            Rupee<span style={{
              background: t.progressFill,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Track</span>
          </div>
          <div style={{
            fontSize: 11.5, color: t.subtitleColor,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>
            Smart Money Manager
          </div>
        </div>
      </div>

      {/* === Progress bar === */}
      <div style={{
        position: 'absolute', bottom: 52,
        width: 160,
        opacity: phase === 'progress' || phase === 'exit' ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}>
        {/* Track */}
        <div style={{
          width: '100%', height: 3, borderRadius: 99,
          background: t.progressTrack,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Fill */}
          <div style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 99,
            background: t.progressFill,
            transition: 'width 0.04s linear',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Shimmer gleam */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
              animation: 'shimmer 1.2s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  )
}
