// IndexedDB backend - mirrors the server API for offline / mobile use.
// Android WebView keeps IndexedDB data across normal APK updates, so user data
// survives app upgrades while still working fully offline.

const DB_NAME = 'rupeetrack_db'
const DB_VERSION = 2
const TRANSACTIONS_STORE = 'transactions'
const BUDGETS_STORE = 'budgets'
const EMIS_STORE = 'emis'

// Legacy localStorage keys. We migrate them once into IndexedDB so existing
// users keep their data after this update.
const TRANSACTIONS_KEY = 'rupeetrack_transactions'
const BUDGETS_KEY = 'rupeetrack_budgets'
const EMIS_KEY = 'rupeetrack_emis'

function now() {
  return new Date().toISOString()
}

const SEED_TRANSACTIONS = [
  { id: 1, type: 'income',  amount: 85000, category: 'Salary',        description: 'Monthly salary',      date: '2026-05-01', created_at: now() },
  { id: 2, type: 'expense', amount: 22000, category: 'Rent',           description: 'House rent',           date: '2026-05-02', created_at: now() },
  { id: 3, type: 'expense', amount: 4500,  category: 'Groceries',      description: 'Big Bazaar shopping',  date: '2026-05-03', created_at: now() },
  { id: 4, type: 'income',  amount: 12000, category: 'Freelance',      description: 'Web design project',  date: '2026-05-03', created_at: now() },
  { id: 5, type: 'expense', amount: 1200,  category: 'Transport',      description: 'Ola/Uber monthly',    date: '2026-05-04', created_at: now() },
  { id: 6, type: 'expense', amount: 2800,  category: 'Food',           description: 'Swiggy & Zomato',     date: '2026-05-04', created_at: now() },
  { id: 7, type: 'expense', amount: 999,   category: 'Entertainment',  description: 'Netflix subscription',date: '2026-05-05', created_at: now() },
  { id: 8, type: 'income',  amount: 5000,  category: 'Investment',     description: 'Dividend received',   date: '2026-05-05', created_at: now() },
  { id: 9, type: 'expense', amount: 3500,  category: 'Shopping',       description: 'Myntra clothes',      date: '2026-05-06', created_at: now() },
  { id: 10,type: 'expense', amount: 800,   category: 'Utilities',      description: 'Electricity bill',    date: '2026-05-06', created_at: now() },
]

const SEED_BUDGETS = [
  { category: 'Rent',          amount: 25000 },
  { category: 'Groceries',     amount: 6000  },
  { category: 'Food',          amount: 4000  },
  { category: 'Transport',     amount: 2000  },
  { category: 'Entertainment', amount: 1500  },
  { category: 'Shopping',      amount: 5000  },
  { category: 'Utilities',     amount: 1500  },
  { category: 'Healthcare',    amount: 2000  },
  { category: 'Education',     amount: 3000  },
  { category: 'Travel',        amount: 5000  },
]

let dbPromise
let memoryFallback = {
  [TRANSACTIONS_STORE]: null,
  [BUDGETS_STORE]: null,
  [EMIS_STORE]: null,
}

function readLegacyJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function initMarkerKey(legacyKey) {
  return `${legacyKey}_indexeddb_initialized`
}

function isInitialized(legacyKey) {
  try { return localStorage.getItem(initMarkerKey(legacyKey)) === '1' } catch { return false }
}

function markInitialized(legacyKey) {
  try { localStorage.setItem(initMarkerKey(legacyKey), '1') } catch { /* ignore storage failures */ }
}

function openDb() {
  if (!('indexedDB' in window)) return Promise.resolve(null)
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(TRANSACTIONS_STORE)) {
        const txStore = db.createObjectStore(TRANSACTIONS_STORE, { keyPath: 'id' })
        txStore.createIndex('date', 'date', { unique: false })
        txStore.createIndex('type', 'type', { unique: false })
        txStore.createIndex('category', 'category', { unique: false })
      }
      if (!db.objectStoreNames.contains(BUDGETS_STORE)) {
        db.createObjectStore(BUDGETS_STORE, { keyPath: 'category' })
      }
      if (!db.objectStoreNames.contains(EMIS_STORE)) {
        db.createObjectStore(EMIS_STORE, { keyPath: 'id' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }).catch((e) => {
    console.warn('[localStore] IndexedDB unavailable, falling back to memory:', e?.message)
    return null
  })

  return dbPromise
}

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function getAll(storeName) {
  const db = await openDb()
  if (!db) {
    if (!memoryFallback[storeName]) {
      memoryFallback[storeName] = storeName === TRANSACTIONS_STORE
        ? readLegacyJson(TRANSACTIONS_KEY, SEED_TRANSACTIONS)
        : storeName === BUDGETS_STORE
          ? readLegacyJson(BUDGETS_KEY, SEED_BUDGETS)
          : readLegacyJson(EMIS_KEY, [])
    }
    return [...memoryFallback[storeName]]
  }

  const tx = db.transaction(storeName, 'readonly')
  return requestToPromise(tx.objectStore(storeName).getAll())
}

async function replaceAll(storeName, rows) {
  const db = await openDb()
  if (!db) {
    memoryFallback[storeName] = [...rows]
    return
  }

  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    store.clear()
    rows.forEach(row => store.put(row))
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

async function putOne(storeName, row) {
  const db = await openDb()
  if (!db) {
    const rows = await getAll(storeName)
    const key = storeName === TRANSACTIONS_STORE ? 'id' : 'category'
    const idx = rows.findIndex(r => r[key] === row[key])
    if (idx === -1) rows.push(row)
    else rows[idx] = row
    memoryFallback[storeName] = rows
    return row
  }

  const tx = db.transaction(storeName, 'readwrite')
  await requestToPromise(tx.objectStore(storeName).put(row))
  return row
}

async function deleteOne(storeName, key) {
  const db = await openDb()
  if (!db) {
    const prop = storeName === TRANSACTIONS_STORE ? 'id' : 'category'
    memoryFallback[storeName] = (await getAll(storeName)).filter(r => r[prop] !== key)
    return
  }

  const tx = db.transaction(storeName, 'readwrite')
  await requestToPromise(tx.objectStore(storeName).delete(key))
}

async function ensureSeeded(storeName, legacyKey, seedRows) {
  const current = await getAll(storeName)
  if (current.length > 0) return current
  if (isInitialized(legacyKey)) return []

  const migrated = readLegacyJson(legacyKey, null)
  const rows = Array.isArray(migrated) ? migrated : seedRows
  await replaceAll(storeName, rows)
  markInitialized(legacyKey)
  return [...rows]
}

async function getTransactions() {
  const rows = await ensureSeeded(TRANSACTIONS_STORE, TRANSACTIONS_KEY, SEED_TRANSACTIONS)
  const normalized = rows.map(normalizeTransactionForStorage)
  if (JSON.stringify(rows) !== JSON.stringify(normalized)) {
    await replaceAll(TRANSACTIONS_STORE, normalized)
  }
  return normalized
}

async function getBudgets() {
  return ensureSeeded(BUDGETS_STORE, BUDGETS_KEY, SEED_BUDGETS)
}

function nextId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function assertValidTransactionDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) throw new Error('date must be in YYYY-MM-DD format')
  if (date > todayString()) throw new Error('date cannot be in the future')
}

function uppercaseDescription(value) {
  return String(value || '').trim().toUpperCase()
}

function normalizeTransactionForStorage(tx) {
  const fallback = tx.category ? String(tx.category).toUpperCase() : ''
  return {
    ...tx,
    description: uppercaseDescription(tx.description) || fallback,
  }
}

function enrichEmi(emi) {
  const paidInstallments = Number(emi.paidInstallments || 0)
  const totalInstallments = Number(emi.totalInstallments || 0)
  const principal = Number(emi.principal || 0)
  const paidAmount = paidInstallments * Number(emi.emiAmount || 0)
  const remainingAmount = Math.max(principal - paidAmount, 0)
  return {
    ...emi,
    paidInstallments,
    totalInstallments,
    remainingInstallments: totalInstallments > 0 ? Math.max(totalInstallments - paidInstallments, 0) : null,
    remainingAmount,
    progress: principal > 0 ? Math.min(Math.round((paidAmount / principal) * 100), 100) : 0,
    active: emi.active !== false && remainingAmount > 0,
  }
}

async function getEmis() {
  const rows = await ensureSeeded(EMIS_STORE, EMIS_KEY, [])
  return rows.map(enrichEmi).sort((a, b) => a.dueDay - b.dueDay || a.name.localeCompare(b.name))
}

export const localApi = {
  getTransactions: async ({ type, category, search, from, to, limit, offset } = {}) => {
    let txs = (await getTransactions()).map(normalizeTransactionForStorage)
    if (type)     txs = txs.filter(t => t.type === type)
    if (category) txs = txs.filter(t => t.category === category)
    if (search)   txs = txs.filter(t => t.description?.toLowerCase().includes(search.toLowerCase()))
    if (from)     txs = txs.filter(t => t.date >= from)
    if (to)       txs = txs.filter(t => t.date <= to)
    txs = [...txs].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    if (offset) txs = txs.slice(Number(offset))
    if (limit)  txs = txs.slice(0, Number(limit))
    return txs
  },

  getTransaction: async (id) => {
    const tx = (await getTransactions()).map(normalizeTransactionForStorage).find(t => t.id === Number(id))
    if (!tx) throw new Error('Not found')
    return tx
  },

  addTransaction: async (data) => {
    assertValidTransactionDate(data.date)
    const tx = normalizeTransactionForStorage({ ...data, id: nextId(), created_at: now() })
    await putOne(TRANSACTIONS_STORE, tx)
    return tx
  },

  updateTransaction: async (id, data) => {
    if (data.date !== undefined) assertValidTransactionDate(data.date)
    const txs = await getTransactions()
    const prev = txs.find(t => t.id === Number(id))
    if (!prev) throw new Error('Not found')
    const updated = normalizeTransactionForStorage({ ...prev, ...data })
    await putOne(TRANSACTIONS_STORE, updated)
    return updated
  },

  deleteTransaction: async (id) => {
    await deleteOne(TRANSACTIONS_STORE, Number(id))
    return true
  },

  deleteAllTransactions: async () => {
    await replaceAll(TRANSACTIONS_STORE, [])
    return true
  },

  getStats: async ({ type, from, to } = {}) => {
    let txs = (await getTransactions()).map(normalizeTransactionForStorage)
    if (type) txs = txs.filter(t => t.type === type)
    if (from) txs = txs.filter(t => t.date >= from)
    if (to)   txs = txs.filter(t => t.date <= to)

    const byCategory = {}
    txs.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
    })
    const total = txs.reduce((s, t) => s + t.amount, 0)
    return { total, byCategory }
  },

  getBudgets: async () => getBudgets(),

  updateBudget: async (category, amount) => {
    const budget = { category, amount }
    await putOne(BUDGETS_STORE, budget)
    return budget
  },

  deleteBudget: async (category) => {
    await deleteOne(BUDGETS_STORE, category)
    return true
  },

  deleteAllBudgets: async () => {
    await replaceAll(BUDGETS_STORE, [])
    return true
  },

  getEmis: async () => getEmis(),

  addEmi: async (data) => {
    const emi = enrichEmi({ ...data, id: nextId(), paidInstallments: Number(data.paidInstallments || 0), active: data.active !== false, created_at: now(), updated_at: now() })
    await putOne(EMIS_STORE, emi)
    return emi
  },

  updateEmi: async (id, data) => {
    const prev = (await getEmis()).find(e => e.id === Number(id))
    if (!prev) throw new Error('Not found')
    const updated = enrichEmi({ ...prev, ...data, updated_at: now() })
    await putOne(EMIS_STORE, updated)
    return updated
  },

  payEmi: async (id, date = todayString()) => {
    const prev = (await getEmis()).find(e => e.id === Number(id))
    if (!prev) throw new Error('Not found')
    if (prev.paidInstallments >= prev.totalInstallments) throw new Error('EMI is already completed')
    const emi = enrichEmi({ ...prev, paidInstallments: prev.paidInstallments + 1, lastPaidDate: date, updated_at: now() })
    await putOne(EMIS_STORE, emi)
    const transaction = await localApi.addTransaction({ type: 'expense', amount: emi.emiAmount, category: 'Other', description: `${emi.name} EMI`, date })
    return { emi, transaction }
  },

  deleteEmi: async (id) => {
    await deleteOne(EMIS_STORE, Number(id))
    return true
  },

  getMeta: async () => ({
    categories: { income: ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'],
      expense: ['Rent', 'Groceries', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Travel', 'Other'] }
  }),

  health: async () => ({ status: 'local-indexeddb' }),
}
