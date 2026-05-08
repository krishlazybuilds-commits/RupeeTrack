// Custom category storage — persisted in localStorage
const CUSTOM_KEY = 'rupeetrack_custom_categories'

export function getCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    return raw ? JSON.parse(raw) : { income: [], expense: [] }
  } catch {
    return { income: [], expense: [] }
  }
}

export function addCustomCategory(type, name) {
  const cc = getCustomCategories()
  const trimmed = name.trim()
  if (!trimmed || cc[type].includes(trimmed)) return cc
  cc[type] = [...cc[type], trimmed]
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(cc)) } catch {}
  return cc
}

export function removeCustomCategory(type, name) {
  const cc = getCustomCategories()
  cc[type] = cc[type].filter(c => c !== name)
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(cc)) } catch {}
  return cc
}
