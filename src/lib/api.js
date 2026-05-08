import { localApi } from './localStore'

// Use local storage when no VITE_API_BASE_URL is set (e.g. on mobile/offline)
const USE_LOCAL = !import.meta.env.VITE_API_BASE_URL

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

function buildUrl(path, params) {
  const url = path.startsWith('http') ? new URL(path) : new URL(`${BASE}${path}`, window.location.origin)
  const filteredParams = Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== '')
  filteredParams.forEach(([key, value]) => { url.searchParams.set(key, value) })
  return path.startsWith('http') || BASE.startsWith('http') ? url.toString() : `${url.pathname}${url.search}`
}

async function request(method, path, body, params) {
  let res
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (networkErr) {
    const e = new Error('Cannot reach the server — is the backend running?')
    e.isNetworkError = true
    throw e
  }
  const json = await res.json()
  if (!res.ok || !json.success) {
    const details = json.details?.length ? ` (${json.details.join('; ')})` : ''
    throw new Error((json.error || 'API error') + details)
  }
  return json.data
}

export const api = USE_LOCAL ? {
  getTransactions: (p)      => localApi.getTransactions(p),
  getTransaction:  (id)     => localApi.getTransaction(id),
  addTransaction:  (tx)     => localApi.addTransaction(tx),
  updateTransaction:(id, d) => localApi.updateTransaction(id, d),
  deleteTransaction:(id)    => localApi.deleteTransaction(id),
  deleteAllTransactions: ()  => localApi.deleteAllTransactions(),
  getStats:        (p)      => localApi.getStats(p),
  getBudgets:      ()       => localApi.getBudgets(),
  updateBudget:    (c, a)   => localApi.updateBudget(c, a),
  deleteBudget:    (c)      => localApi.deleteBudget(c),
  deleteAllBudgets: ()      => localApi.deleteAllBudgets(),
  getEmis:         ()       => localApi.getEmis(),
  addEmi:          (emi)    => localApi.addEmi(emi),
  updateEmi:       (id, d)  => localApi.updateEmi(id, d),
  payEmi:          (id, date) => localApi.payEmi(id, date),
  deleteEmi:       (id)    => localApi.deleteEmi(id),
  getMeta:         ()       => localApi.getMeta(),
  health:          ()       => localApi.health(),
} : {
  getTransactions: (params = {}) => request('GET', '/transactions', undefined, params),
  getTransaction:  (id)          => request('GET', `/transactions/${id}`),
  addTransaction:  (tx)          => request('POST', '/transactions', tx),
  updateTransaction:(id, data)   => request('PUT', `/transactions/${id}`, data),
  deleteTransaction:(id)         => request('DELETE', `/transactions/${id}`),
  deleteAllTransactions: ()      => request('DELETE', '/transactions'),
  getStats:        (params = {}) => request('GET', '/stats', undefined, params),
  getBudgets:      ()            => request('GET', '/budgets'),
  updateBudget:    (cat, amt)    => request('PUT', `/budgets/${encodeURIComponent(cat)}`, { amount: amt }),
  deleteBudget:    (cat)         => request('DELETE', `/budgets/${encodeURIComponent(cat)}`),
  deleteAllBudgets: ()           => request('DELETE', '/budgets'),
  getEmis:         ()            => request('GET', '/emis'),
  addEmi:          (emi)         => request('POST', '/emis', emi),
  updateEmi:       (id, data)    => request('PUT', `/emis/${id}`, data),
  payEmi:          (id, date)    => request('POST', `/emis/${id}/pay`, { date }),
  deleteEmi:       (id)          => request('DELETE', `/emis/${id}`),
  getMeta:         ()            => request('GET', '/meta'),
  health:          ()            => request('GET', '/health'),
}
