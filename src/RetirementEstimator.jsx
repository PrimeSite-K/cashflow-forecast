import { useState } from 'react'

export default function RetirementEstimator({ initialBalance }) {
  const [monthlySaving, setMonthlySaving] = useState(800)
  const [years, setYears] = useState(8)
  const [monthlyExpense, setMonthlyExpense] = useState(3000)

  const savingsInput = initialBalance ?? 0

  // 0% interest — pure linear accumulation
  const accumulated = monthlySaving * 12 * years
  const total = savingsInput + accumulated

  // How many months can the total sustain monthly expenses
  const sustainMonths = monthlyExpense > 0 ? Math.floor(total / monthlyExpense) : Infinity
  const sustainYears = Math.floor(sustainMonths / 12)
  const sustainRemMonths = sustainMonths % 12

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">🎯 Retirement Estimator</h2>
        <p className="text-xs text-gray-400 mt-0.5">Simple projection · 0% interest · no compounding</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly saving */}
        <div>
          <label className="text-xs text-gray-500 font-medium">Monthly Savings ($)</label>
          <input
            type="number" min="0" step="50"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={monthlySaving}
            onChange={e => setMonthlySaving(Math.max(0, parseFloat(e.target.value) || 0))}
          />
          <p className="text-xs text-gray-400 mt-1">Amount added each month</p>
        </div>

        {/* Years to retirement */}
        <div>
          <label className="text-xs text-gray-500 font-medium">Years to Retirement</label>
          <input
            type="number" min="1" max="50" step="1"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={years}
            onChange={e => setYears(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <p className="text-xs text-gray-400 mt-1">How many years until you retire</p>
        </div>

        {/* Monthly expense in retirement */}
        <div>
          <label className="text-xs text-gray-500 font-medium">Monthly Expense in Retirement ($)</label>
          <input
            type="number" min="0" step="100"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={monthlyExpense}
            onChange={e => setMonthlyExpense(Math.max(0, parseFloat(e.target.value) || 0))}
          />
          <p className="text-xs text-gray-400 mt-1">Expected monthly spend after retiring</p>
        </div>
      </div>

      {/* Result breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Current balance</span>
          <span className="font-medium text-gray-800">${savingsInput.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            New savings&nbsp;
            <span className="text-gray-400 font-normal">
              (${monthlySaving.toLocaleString()} × 12 × {years} yrs)
            </span>
          </span>
          <span className="font-medium text-gray-800">+${accumulated.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-semibold text-gray-700">Estimated total at retirement</span>
          <span className="text-xl font-bold text-blue-600">${total.toLocaleString()}</span>
        </div>
      </div>

      {/* Sustainability */}
      {monthlyExpense > 0 && (
        <div className={`rounded-xl p-4 text-sm ${sustainYears >= 20 ? 'bg-green-50 text-green-700' : sustainYears >= 10 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
          <span className="font-semibold">Funds last: </span>
          {sustainYears > 0 ? `${sustainYears} yr${sustainYears !== 1 ? 's' : ''}` : ''}
          {sustainRemMonths > 0 ? ` ${sustainRemMonths} mo` : ''}
          {sustainYears === 0 && sustainRemMonths === 0 ? 'Less than 1 month' : ''}
          <span className="ml-1 font-normal opacity-75">at ${monthlyExpense.toLocaleString()}/mo spending</span>
        </div>
      )}
    </div>
  )
}
