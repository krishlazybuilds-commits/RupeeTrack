const express = require('express')
const cors = require('cors')
const db = require('./db')
const { PORT, ALLOWED_ORIGINS, APP_NAME } = require('./config')
const { CATEGORIES, CATEGORY_SET } = require('./constants')
const { isValidDate, isValidMonth, normalizeTransactionInput, normalizeBudgetInput, normalizeEmiInput } = require('./validation')

function createApp() {
  const app = express()

  app.use(cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS === '*' || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
  }))
  app.use(express.json())

  const ok  = (res, data, meta) => res.json(meta ? { success: true, data, meta } : { success: true, data })
  const err = (res, message, code = 400, details) => {
    const payload = { success: false, error: message }
    if (details?.length) payload.details = details
    return res.status(code).json(payload)
  }

  // Safe db write — wraps every write in try/catch to prevent crash on disk errors
  function safeWrite(fn) {
    try {
      return fn()
    } catch (e) {
      console.error('[DB write error]', e)
      throw new Error('Database write failed')
    }
  }

  // Use Date.now() + random suffix to avoid race conditions with counter-based IDs
  function nextId() {
    return Date.now() + Math.floor(Math.random() * 1000)
  }

  function listTransactions(filters = {}) {
    const { type, month, from, to, category, q } = filters
    let results = db.get('transactions').value()

    if (type && ['income', 'expense'].includes(type)) results = results.filter(tx => tx.type === type)
    if (month && isValidMonth(month)) results = results.filter(tx => tx.date.startsWith(month))
    if (from && isValidDate(from)) results = results.filter(tx => tx.date >= from)
    if (to && isValidDate(to)) results = results.filter(tx => tx.date <= to)
    if (category) results = results.filter(tx => tx.category === category)
    if (q) {
      const term = String(q).trim().toLowerCase()
      results = results.filter(tx =>
        [tx.category, tx.description, tx.type, tx.date]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(term)),
      )
    }

    return [...results].sort((a, b) => b.date.localeCompare(a.date) || (b.id > a.id ? 1 : b.id < a.id ? -1 : 0))
  }

  function computeStats(transactions) {
    const income  = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0)
    const expense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0)

    const byCategoryMap = {}
    transactions.filter(tx => tx.type === 'expense').forEach(tx => {
      byCategoryMap[tx.category] = (byCategoryMap[tx.category] || 0) + tx.amount
    })

    const dailyMap = {}
    transactions.forEach(tx => {
      if (!dailyMap[tx.date]) dailyMap[tx.date] = { date: tx.date, income: 0, expense: 0 }
      dailyMap[tx.date][tx.type] += tx.amount
    })

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
      byCategory: Object.entries(byCategoryMap).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total),
      daily: Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)),
      transactionCount: transactions.length,
    }
  }

  // ── Meta & health ──────────────────────────────────────────────
  app.get('/', (_req, res) => {
    ok(res, { name: APP_NAME, version: '1.0.0', port: PORT,
      endpoints: ['/api/health', '/api/meta', '/api/transactions', '/api/budgets', '/api/stats'] })
  })

  app.get('/api/meta', (_req, res) => {
    ok(res, { categories: CATEGORIES, supportedFilters: ['type', 'month', 'from', 'to', 'category', 'q', 'limit'], currency: 'INR' })
  })

  app.get('/api/health', (_req, res) => {
    ok(res, { status: 'ok', time: new Date().toISOString(), app: APP_NAME })
  })

  // ── Transactions ───────────────────────────────────────────────
  app.get('/api/transactions', (req, res) => {
    const { limit } = req.query
    const results = listTransactions(req.query)
    const parsedLimit = limit === undefined ? null : Number(limit)
    if (limit !== undefined && (!Number.isInteger(parsedLimit) || parsedLimit <= 0)) {
      return err(res, 'limit must be a positive integer')
    }
    const data = parsedLimit ? results.slice(0, parsedLimit) : results
    return ok(res, data, { total: results.length })
  })

  app.get('/api/transactions/:id', (req, res) => {
    const tx = db.get('transactions').find({ id: Number(req.params.id) }).value()
    if (!tx) return err(res, 'Transaction not found', 404)
    return ok(res, tx)
  })

  app.post('/api/transactions', (req, res) => {
    const { errors, value } = normalizeTransactionInput(req.body)
    if (errors.length) return err(res, 'Invalid transaction payload', 422, errors)

    const now = new Date().toISOString()
    const tx = { id: nextId(), ...value, description: value.description || value.category.toUpperCase(), created_at: now, updated_at: now }

    try {
      safeWrite(() => db.get('transactions').push(tx).write())
      return res.status(201).json({ success: true, data: tx })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  app.put('/api/transactions/:id', (req, res) => {
    const id = Number(req.params.id)
    const existing = db.get('transactions').find({ id }).value()
    if (!existing) return err(res, 'Transaction not found', 404)

    const { errors, value } = normalizeTransactionInput(req.body, { partial: true })
    if (errors.length) return err(res, 'Invalid transaction payload', 422, errors)

    const updated = {
      ...existing, ...value,
      description: value.description !== undefined
        ? (value.description || value.category || existing.category).toUpperCase()
        : existing.description?.toUpperCase(),
      updated_at: new Date().toISOString(),
    }

    if (!CATEGORIES[updated.type].includes(updated.category)) {
      return err(res, 'Updated category does not match transaction type', 422)
    }

    try {
      safeWrite(() => db.get('transactions').find({ id }).assign(updated).write())
      return ok(res, updated)
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  app.delete('/api/transactions/:id', (req, res) => {
    const id = Number(req.params.id)
    const tx = db.get('transactions').find({ id }).value()
    if (!tx) return err(res, 'Transaction not found', 404)

    try {
      safeWrite(() => db.get('transactions').remove({ id }).write())
      return ok(res, { id })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  // DELETE ALL transactions
  app.delete('/api/transactions', (_req, res) => {
    try {
      safeWrite(() => db.set('transactions', []).write())
      return ok(res, { deleted: true })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  // ── Stats ──────────────────────────────────────────────────────
  app.get('/api/stats', (req, res) => {
    const transactions = listTransactions(req.query)
    return ok(res, computeStats(transactions))
  })

  // ── Budgets ────────────────────────────────────────────────────
  app.get('/api/budgets', (_req, res) => {
    const budgets = db.get('budgets').sortBy('category').value()
    return ok(res, budgets)
  })

  app.put('/api/budgets/:category', (req, res) => {
    const category = decodeURIComponent(req.params.category)
    if (!CATEGORY_SET.has(category)) return err(res, 'Unknown category', 422)

    const { errors, value } = normalizeBudgetInput(req.body)
    if (errors.length) return err(res, 'Invalid budget payload', 422, errors)

    try {
      const existing = db.get('budgets').find({ category }).value()
      if (existing) {
        safeWrite(() => db.get('budgets').find({ category }).assign({ amount: value.amount }).write())
      } else {
        safeWrite(() => db.get('budgets').push({ id: nextId(), category, amount: value.amount }).write())
      }
      return ok(res, db.get('budgets').find({ category }).value())
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  app.delete('/api/budgets/:category', (req, res) => {
    const category = decodeURIComponent(req.params.category)
    const existing = db.get('budgets').find({ category }).value()
    if (!existing) return err(res, 'Budget not found', 404)

    try {
      safeWrite(() => db.get('budgets').remove({ category }).write())
      return ok(res, { category })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  // DELETE ALL budgets
  app.delete('/api/budgets', (_req, res) => {
    try {
      safeWrite(() => db.set('budgets', []).write())
      return ok(res, { deleted: true })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  // ── EMI Payments ─────────────────────────────────────────────────
  function enrichEmi(emi) {
    const paidInstallments = Number(emi.paidInstallments || 0)
    const totalInstallments = Number(emi.totalInstallments || 0)
    const principal = Number(emi.principal || 0)
    const paidAmount = paidInstallments * Number(emi.emiAmount || 0)
    const remainingAmount = Math.max(principal - paidAmount, 0)
    const progress = principal > 0 ? Math.min(Math.round((paidAmount / principal) * 100), 100) : 0
    return {
      ...emi,
      paidInstallments,
      totalInstallments,
      remainingInstallments: totalInstallments > 0 ? Math.max(totalInstallments - paidInstallments, 0) : null,
      remainingAmount,
      progress,
      active: emi.active !== false && remainingAmount > 0,
    }
  }

  app.get('/api/emis', (_req, res) => {
    const emis = db.get('emis').value().map(enrichEmi).sort((a, b) => a.dueDay - b.dueDay || a.name.localeCompare(b.name))
    return ok(res, emis)
  })

  app.post('/api/emis', (req, res) => {
    const { errors, value } = normalizeEmiInput(req.body)
    if (errors.length) return err(res, 'Invalid EMI payload', 422, errors)

    const now = new Date().toISOString()
    const emi = enrichEmi({ id: nextId(), ...value, created_at: now, updated_at: now })

    try {
      safeWrite(() => db.get('emis').push(emi).write())
      return res.status(201).json({ success: true, data: emi })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  app.put('/api/emis/:id', (req, res) => {
    const id = Number(req.params.id)
    const existing = db.get('emis').find({ id }).value()
    if (!existing) return err(res, 'EMI not found', 404)

    const { errors, value } = normalizeEmiInput(req.body, { partial: true })
    if (errors.length) return err(res, 'Invalid EMI payload', 422, errors)

    const updated = enrichEmi({ ...existing, ...value, updated_at: new Date().toISOString() })
    try {
      safeWrite(() => db.get('emis').find({ id }).assign(updated).write())
      return ok(res, updated)
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  app.post('/api/emis/:id/pay', (req, res) => {
    const id = Number(req.params.id)
    const existing = db.get('emis').find({ id }).value()
    if (!existing) return err(res, 'EMI not found', 404)
    if (!enrichEmi(existing).active) return err(res, 'EMI is already completed', 422)

    const paymentDate = isValidDate(req.body?.date) ? req.body.date : new Date().toISOString().slice(0, 10)
    const updated = enrichEmi({ ...existing, paidInstallments: Number(existing.paidInstallments || 0) + 1, lastPaidDate: paymentDate, updated_at: new Date().toISOString() })
    const tx = {
      id: nextId(),
      type: 'expense',
      amount: updated.emiAmount,
      category: CATEGORY_SET.has(updated.category) ? updated.category : 'Other',
      description: `${updated.name} EMI`.toUpperCase(),
      date: paymentDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      safeWrite(() => {
        db.get('emis').find({ id }).assign(updated).write()
        db.get('transactions').push(tx).write()
      })
      return ok(res, { emi: updated, transaction: tx })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  app.delete('/api/emis/:id', (req, res) => {
    const id = Number(req.params.id)
    const existing = db.get('emis').find({ id }).value()
    if (!existing) return err(res, 'EMI not found', 404)

    try {
      safeWrite(() => db.get('emis').remove({ id }).write())
      return ok(res, { id })
    } catch (e) {
      return err(res, e.message, 500)
    }
  })

  // ── Global error handler ───────────────────────────────────────
  app.use((error, _req, res, _next) => {
    if (String(error?.message || '').includes('CORS')) {
      return err(res, error.message, 403)
    }
    console.error(error)
    return err(res, 'Internal server error', 500)
  })

  return app
}

module.exports = { createApp }
