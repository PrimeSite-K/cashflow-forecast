// Cashflow prediction engine
// Each entry: { id, name, amount, type: 'income'|'expense', frequency, startDate, endDate? }
// frequency: 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

import { addDays, addWeeks, addMonths, addQuarters, addYears, format, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'

export function generateDailyBalances(initialBalance, entries, days = 180) {
  const today = startOfDay(new Date())
  const result = []

  // Build a map of date -> net cash flow
  const flowMap = {}

  for (const entry of entries) {
    const start = startOfDay(parseISO(entry.startDate))
    const end = entry.endDate ? startOfDay(parseISO(entry.endDate)) : null
    const sign = entry.type === 'income' ? 1 : -1
    const amount = entry.amount * sign

    const occurrences = getOccurrences(start, entry.frequency, today, days, end)
    for (const date of occurrences) {
      const key = format(date, 'yyyy-MM-dd')
      flowMap[key] = (flowMap[key] || 0) + amount
    }
  }

  let balance = initialBalance
  for (let i = 0; i <= days; i++) {
    const date = addDays(today, i)
    const key = format(date, 'yyyy-MM-dd')
    balance += flowMap[key] || 0
    result.push({ date: key, balance: Math.round(balance * 100) / 100, flow: flowMap[key] || 0 })
  }

  return result
}

function getOccurrences(start, frequency, today, days, end) {
  const endDate = addDays(today, days)
  const dates = []
  let current = start

  if (frequency === 'once') {
    if (!isBefore(current, today) && !isAfter(current, endDate)) {
      dates.push(current)
    }
    return dates
  }

  // For recurring, find first occurrence >= today
  while (isBefore(current, today)) {
    current = nextOccurrence(current, frequency)
  }

  while (!isAfter(current, endDate)) {
    if (end && isAfter(current, end)) break
    dates.push(current)
    current = nextOccurrence(current, frequency)
  }

  return dates
}

function nextOccurrence(date, frequency) {
  switch (frequency) {
    case 'weekly':    return addWeeks(date, 1)
    case 'biweekly':  return addWeeks(date, 2)
    case 'monthly':   return addMonths(date, 1)
    case 'quarterly': return addQuarters(date, 1)
    case 'yearly':    return addYears(date, 1)
    default:          return addMonths(date, 1)
  }
}

export function getWarningDates(dailyBalances, threshold = 500) {
  return dailyBalances.filter(d => d.balance < threshold)
}

export function aggregateMonthly(dailyBalances) {
  const months = {}
  for (const d of dailyBalances) {
    const month = d.date.slice(0, 7)
    if (!months[month]) months[month] = { month, endBalance: d.balance, income: 0, expense: 0 }
    months[month].endBalance = d.balance
    if (d.flow > 0) months[month].income += d.flow
    if (d.flow < 0) months[month].expense += Math.abs(d.flow)
  }
  return Object.values(months)
}
