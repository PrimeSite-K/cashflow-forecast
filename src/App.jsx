import { useState, useEffect, useMemo } from 'react'
import { generateDailyBalances, getWarningDates } from './engine'
import { loadEntries, saveEntries, loadInitialBalance, saveInitialBalance, loadThreshold, saveThreshold } from './storage'
import EntryManager from './EntryManager'
import ForecastChart from './ForecastChart'
import WarningPanel from './WarningPanel'
import AiAdvisor from './AiAdvisor'

const DEMO_ENTRIES = [
  { id: '1', name: 'Salary', amount: 5000, type: 'income', frequency: 'monthly', startDate: new Date().toISOString().slice(0,10), endDate: '' },
  { id: '2', name: 'Rent', amount: 1800, type: 'expense', frequency: 'monthly', startDate: new Date().toISOString().slice(0,10), endDate: '' },
  { id: '3', name: 'Groceries', amount: 400, type: 'expense', frequency: 'monthly', startDate: new Date().toISOString().slice(0,10), endDate: '' },
  { id: '4', name: 'Car Insurance', amount: 1200, type: 'expense', frequency: 'yearly', startDate: new Date().toISOString().slice(0,10), endDate: '' },
]

export default function App() {
  const [entries, setEntries] = useState(() => {
    const saved = loadEntries()
    return saved.length > 0 ? saved : DEMO_ENTRIES
  })
  const [initialBalance, setInitialBalance] = useState(() => loadInitialBalance() || 8000)
  const [threshold, setThreshold] = useState(() => loadThreshold())
  const [viewMode, setViewMode] = useState('monthly') // 'monthly' | 'weekly'
  const [balanceInput, setBalanceInput] = useState(String(loadInitialBalance() || 8000))
  const [thresholdInput, setThresholdInput] = useState(String(loadThreshold()))

  useEffect(() => { saveEntries(entries) }, [entries])
  useEffect(() => { saveInitialBalance(initialBalance) }, [initialBalance])
  useEffect(() => { saveThreshold(threshold) }, [threshold])

  const dailyData = useMemo(
    () => generateDailyBalances(initialBalance, entries, 180),
    [initialBalance, entries]
  )

  const warnings = useMemo(() => getWarningDates(dailyData, threshold), [dailyData, threshold])

  // Summary stats
  const monthlyIncome = entries.filter(e => e.type === 'income' && e.frequency === 'monthly').reduce((s, e) => s + e.amount, 0)
  const monthlyExpense = entries.filter(e => e.type === 'expense' && e.frequency === 'monthly').reduce((s, e) => s + e.amount, 0)
  const monthlySurplus = monthlyIncome - monthlyExpense

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">💰 Family Cash Flow</h1>
            <p className="text-xs text-gray-400">Your personal financial early-warning system</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 text-sm rounded-lg ${viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Monthly
            </button>
            <button onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-sm rounded-lg ${viewMode === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              Weekly
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Settings row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-xs text-gray-500 font-medium">Current Balance ($)</label>
            <input type="number" className="mt-1 w-full text-2xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
              value={balanceInput}
              onChange={e => setBalanceInput(e.target.value)}
              onBlur={() => { const v = parseFloat(balanceInput); if (!isNaN(v)) setInitialBalance(v) }} />
            <p className="text-xs text-gray-400 mt-1">All accounts combined</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-xs text-gray-500 font-medium">Monthly Surplus</label>
            <p className={`text-2xl font-bold mt-1 ${monthlySurplus >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {monthlySurplus >= 0 ? '+' : ''}${monthlySurplus.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">Income − Fixed expenses</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <label className="text-xs text-gray-500 font-medium">Warning Threshold ($)</label>
            <input type="number" className="mt-1 w-full text-2xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
              value={thresholdInput}
              onChange={e => setThresholdInput(e.target.value)}
              onBlur={() => { const v = parseFloat(thresholdInput); if (!isNaN(v)) setThreshold(v) }} />
            <p className="text-xs text-gray-400 mt-1">Alert when balance drops below</p>
          </div>
        </div>

        {/* Chart */}
        <ForecastChart data={dailyData} threshold={threshold} viewMode={viewMode} />

        {/* Warnings */}
        <WarningPanel warnings={warnings} threshold={threshold} />

        {/* Entry manager */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
          <EntryManager entries={entries} onChange={setEntries} />
        </div>

        {/* AI Advisor */}
        <AiAdvisor financialContext={{
          initialBalance,
          entries,
          dailyData,
          warnings,
          threshold,
        }} />
      </main>
    </div>
  )
}
