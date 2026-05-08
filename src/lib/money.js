const MONEY_INPUT_PATTERN = /^\d*(?:\.\d{0,2})?$/

export function sanitizeMoneyInput(value) {
  const cleaned = String(value).replace(/[^\d.]/g, '')
  const [whole = '', ...decimalParts] = cleaned.split('.')
  const decimals = decimalParts.join('').slice(0, 2)

  if (!cleaned.includes('.')) return whole
  return `${whole}.${decimals}`
}

export function isValidMoneyInput(value) {
  return value !== '' && MONEY_INPUT_PATTERN.test(value) && Number.isFinite(Number(value))
}

export function getPositiveMoneyValue(value) {
  if (!isValidMoneyInput(value)) return null
  const amount = Number(value)
  return amount > 0 ? amount : null
}

export function getNonNegativeMoneyValue(value) {
  if (!isValidMoneyInput(value)) return null
  const amount = Number(value)
  return amount >= 0 ? amount : null
}

/** Shared currency formatter — ₹1,23,456 */
export const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN')
