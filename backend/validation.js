const { CATEGORIES, CATEGORY_SET } = require('./constants')

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
}

function isValidMonth(value) {
  return /^\d{4}-\d{2}$/.test(String(value || ''))
}

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function normalizeTransactionInput(input = {}, { partial = false } = {}) {
  const errors = []
  const normalized = {}

  const has = (key) => Object.prototype.hasOwnProperty.call(input, key)

  if (!partial || has('type')) {
    if (!['income', 'expense'].includes(input.type)) {
      errors.push('type must be income or expense')
    } else {
      normalized.type = input.type
    }
  }

  if (!partial || has('amount')) {
    const amount = Number(input.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push('amount must be a positive number')
    } else {
      normalized.amount = amount
    }
  }

  if (!partial || has('category')) {
    const category = String(input.category || '').trim()
    if (!category) {
      errors.push('category is required')
    } else if (!CATEGORY_SET.has(category)) {
      errors.push(`category must be one of: ${Array.from(CATEGORY_SET).join(', ')}`)
    } else {
      normalized.category = category
    }
  }

  if (!partial || has('date')) {
    if (!isValidDate(input.date)) {
      errors.push('date must be in YYYY-MM-DD format')
    } else if (input.date > todayString()) {
      errors.push('date cannot be in the future')
    } else {
      normalized.date = input.date
    }
  }

  if (has('description') || !partial) {
    const description = String(input.description || '').trim().toUpperCase()
    if (description.length > 200) {
      errors.push('description must be 200 characters or fewer')
    } else {
      normalized.description = description
    }
  }

  if (normalized.type && normalized.category) {
    if (!CATEGORIES[normalized.type].includes(normalized.category)) {
      errors.push(`${normalized.category} is not a valid ${normalized.type} category`)
    }
  }

  return { errors, value: normalized }
}

function normalizeBudgetInput(input = {}) {
  const amount = Number(input.amount)
  if (!Number.isFinite(amount) || amount < 0) {
    return { errors: ['amount must be a non-negative number'], value: null }
  }

  return { errors: [], value: { amount } }
}

function normalizeEmiInput(input = {}, { partial = false } = {}) {
  const errors = []
  const normalized = {}
  const has = (key) => Object.prototype.hasOwnProperty.call(input, key)

  if (!partial || has('name')) {
    const name = String(input.name || '').trim()
    if (!name) errors.push('name is required')
    else if (name.length > 80) errors.push('name must be 80 characters or fewer')
    else normalized.name = name
  }

  if (!partial || has('lender')) {
    const lender = String(input.lender || '').trim()
    if (lender.length > 80) errors.push('lender must be 80 characters or fewer')
    else normalized.lender = lender
  }

  for (const key of ['principal', 'emiAmount']) {
    if (!partial || has(key)) {
      const amount = Number(input[key])
      if (!Number.isFinite(amount) || amount <= 0) errors.push(`${key} must be a positive number`)
      else normalized[key] = amount
    }
  }

  if (!partial || has('paidInstallments')) {
    const paid = Number(input.paidInstallments || 0)
    if (!Number.isInteger(paid) || paid < 0) errors.push('paidInstallments must be a non-negative integer')
    else normalized.paidInstallments = paid
  }

  if (!partial || has('totalInstallments')) {
    const total = Number(input.totalInstallments)
    if (!Number.isInteger(total) || total <= 0) errors.push('totalInstallments must be a positive integer')
    else normalized.totalInstallments = total
  }

  if (!partial || has('dueDay')) {
    const dueDay = Number(input.dueDay)
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) errors.push('dueDay must be between 1 and 31')
    else normalized.dueDay = dueDay
  }

  if (!partial || has('startDate')) {
    if (!isValidDate(input.startDate)) errors.push('startDate must be in YYYY-MM-DD format')
    else normalized.startDate = input.startDate
  }

  if (has('category') || !partial) {
    const category = String(input.category || 'EMI').trim()
    normalized.category = category || 'EMI'
  }

  if (has('notes') || !partial) {
    const notes = String(input.notes || '').trim()
    if (notes.length > 200) errors.push('notes must be 200 characters or fewer')
    else normalized.notes = notes
  }

  if (has('active') || !partial) normalized.active = input.active !== false

  const paid = normalized.paidInstallments ?? Number(input.paidInstallments || 0)
  const total = normalized.totalInstallments ?? Number(input.totalInstallments)
  if (Number.isInteger(paid) && Number.isInteger(total) && paid > total) {
    errors.push('paidInstallments cannot exceed totalInstallments')
  }

  return { errors, value: normalized }
}

module.exports = {
  isValidDate,
  isValidMonth,
  normalizeTransactionInput,
  normalizeBudgetInput,
  normalizeEmiInput,
}
