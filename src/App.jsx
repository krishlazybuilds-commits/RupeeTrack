import { useState, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import SplashScreen from './components/SplashScreen'
import { ThemeProvider } from './lib/ThemeContext'
import './index.css'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const handleSplashDone = useCallback(() => setSplashDone(true), [])

  return (
    <ThemeProvider>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <Dashboard />
    </ThemeProvider>
  )
}
