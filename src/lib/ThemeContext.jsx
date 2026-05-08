import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

// Detect OS preference
function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('rupeetrack_theme')
    // Only use saved if the user explicitly toggled — otherwise follow system
    return saved || getSystemTheme()
  })

  // Keep in sync with OS changes if user hasn't overridden
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const handler = (e) => {
      // Only auto-follow system if there's no explicit user override saved
      if (!localStorage.getItem('rupeetrack_theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('rupeetrack_theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
