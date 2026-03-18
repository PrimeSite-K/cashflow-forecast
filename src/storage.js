// localStorage persistence
const KEYS = {
  entries: 'cf_entries',
  balance: 'cf_initial_balance',
  threshold: 'cf_warning_threshold',
}

export function loadEntries() {
  try { return JSON.parse(localStorage.getItem(KEYS.entries)) || [] } catch { return [] }
}

export function saveEntries(entries) {
  localStorage.setItem(KEYS.entries, JSON.stringify(entries))
}

export function loadInitialBalance() {
  const v = localStorage.getItem(KEYS.balance)
  return v !== null ? parseFloat(v) : 0
}

export function saveInitialBalance(val) {
  localStorage.setItem(KEYS.balance, String(val))
}

export function loadThreshold() {
  const v = localStorage.getItem(KEYS.threshold)
  return v !== null ? parseFloat(v) : 500
}

export function saveThreshold(val) {
  localStorage.setItem(KEYS.threshold, String(val))
}
