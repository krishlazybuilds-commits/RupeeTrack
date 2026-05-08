import Dashboard from './components/Dashboard'
import { ThemeProvider } from './lib/ThemeContext'
import './index.css'

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}
