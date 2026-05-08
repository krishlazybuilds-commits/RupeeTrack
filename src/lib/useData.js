import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../lib/api'
import { useToast } from '../lib/ToastContext'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [backendDown,  setBackendDown]  = useState(false)
  const { toast } = useToast()
  // Keep a ref to latest transactions so callbacks don't go stale
  const txRef = useRef([])
  useEffect(() => { txRef.current = transactions }, [transactions])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getTransactions()
      setTransactions(data)
      setBackendDown(false)
    } catch (e) {
      if (e.isNetworkError) {
        setBackendDown(true)
      } else {
        toast('Failed to load transactions: ' + e.message)
      }
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Auto-retry every 30s when backend is down
  useEffect(() => {
    if (!backendDown) return
    const id = setInterval(() => load(), 30000)
    return () => clearInterval(id)
  }, [backendDown, load])

  useEffect(() => { load() }, [load])

  const addTransaction = useCallback(async (tx) => {
    // Optimistic: add a temp entry with a negative id
    const tempId = -Date.now()
    const optimistic = { ...tx, id: tempId, created_at: new Date().toISOString() }
    setTransactions(prev => [optimistic, ...prev])
    try {
      const created = await api.addTransaction(tx)
      // Replace the optimistic entry with the real one
      setTransactions(prev => prev.map(t => t.id === tempId ? created : t))
      return created
    } catch (e) {
      // Rollback
      setTransactions(prev => prev.filter(t => t.id !== tempId))
      toast('Failed to add transaction: ' + e.message)
      throw e
    }
  }, [toast])

  const deleteTransaction = useCallback(async (id) => {
    // Snapshot before optimistic remove so we can roll back
    const snapshot = txRef.current
    setTransactions(prev => prev.filter(t => t.id !== id))
    try {
      await api.deleteTransaction(id)
    } catch (e) {
      setTransactions(snapshot)
      toast('Failed to delete transaction: ' + e.message)
      throw e
    }
  }, [toast])

  const deleteAllTransactions = useCallback(async () => {
    const snapshot = txRef.current
    setTransactions([])
    try {
      await api.deleteAllTransactions()
    } catch (e) {
      setTransactions(snapshot)
      toast('Failed to delete all transactions: ' + e.message)
      throw e
    }
  }, [toast])

  const updateTransaction = useCallback(async (id, data) => {
    const prev = txRef.current.find(t => t.id === id)
    const optimistic = { ...prev, ...data }
    setTransactions(ts => ts.map(t => t.id === id ? optimistic : t))
    try {
      const updated = await api.updateTransaction(id, data)
      setTransactions(ts => ts.map(t => t.id === id ? updated : t))
      return updated
    } catch (e) {
      setTransactions(ts => ts.map(t => t.id === id ? prev : t))
      toast('Failed to update transaction: ' + e.message)
      throw e
    }
  }, [toast])

  return {
    transactions,
    loading,
    backendDown,
    refetch: load,
    addTransaction,
    deleteTransaction,
    deleteAllTransactions,
    updateTransaction,
  }
}

export function useBudgets() {
  const [budgets,  setBudgets]  = useState({})
  const [loading,  setLoading]  = useState(true)
  const { toast } = useToast()
  const budgetRef = useRef({})
  useEffect(() => { budgetRef.current = budgets }, [budgets])

  const load = useCallback(async () => {
    try {
      const rows = await api.getBudgets()
      const map = {}
      rows.forEach(b => { map[b.category] = b.amount })
      setBudgets(map)
    } catch (e) {
      console.warn('Budget load failed:', e.message)
      if (!e.isNetworkError) toast('Failed to load budgets: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const updateBudget = useCallback(async (category, amount) => {
    const prev = budgetRef.current[category]
    setBudgets(b => ({ ...b, [category]: amount }))
    try {
      await api.updateBudget(category, amount)
    } catch (e) {
      setBudgets(b => prev !== undefined ? { ...b, [category]: prev } : (() => { const n = { ...b }; delete n[category]; return n })())
      toast('Failed to update budget: ' + e.message)
      throw e
    }
  }, [toast])

  const deleteBudget = useCallback(async (category) => {
    const prev = budgetRef.current[category]
    setBudgets(b => { const n = { ...b }; delete n[category]; return n })
    try {
      await api.deleteBudget(category)
    } catch (e) {
      setBudgets(b => ({ ...b, [category]: prev }))
      toast('Failed to delete budget: ' + e.message)
      throw e
    }
  }, [toast])

  const deleteAllBudgets = useCallback(async () => {
    const snapshot = budgetRef.current
    setBudgets({})
    try {
      await api.deleteAllBudgets()
    } catch (e) {
      setBudgets(snapshot)
      toast('Failed to delete all budgets: ' + e.message)
      throw e
    }
  }, [toast])

  return { budgets, loading, updateBudget, deleteBudget, deleteAllBudgets, refetch: load }
}
