import { useState } from 'react'

export default function RetirementEstimator({ initialBalance }) {
  const [monthlyContrib, setMonthlyContrib] = useState(800)
  const [years, setYears] = useState(8)

  const currentBalance = initialBalance ?? 0

  // 0% interest — pure linear accumulation (no compounding)
  const annualContrib = monthlyContrib * 12
  const newAccumulated = annualContrib * years
  const total = currentBalance + newAccumulated

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">🎯 Retirement Estimator</h2>
        <p className="text-xs text-gray-400 mt-0.5">Personal pension account · 0% interest · no compounding</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 font-medium">Monthly Contribution ($)</label>
          <input
            type="number" min="0" step="50"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={monthlyContrib}
            onChange={e => setMonthlyContrib(Math.max(0, parseFloat(e.target.value) || 0))}
          />
          <p className="text-xs text-gray-400 mt-1">Amount contributed each month</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium">Years to Retirement</label>
          <input
            type="number" min="1" max="50" step="1"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={years}
            onChange={e => setYears(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <p className="text-xs text-gray-400 mt-1">How many years until retirement</p>
        </div>
      </div>

      {/* Result breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Current balance</span>
          <span className="font-medium text-gray-800">${currentBalance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            New contributions&nbsp;
            <span className="text-gray-400">(${monthlyContrib.toLocaleString()} × 12 × {years} yrs)</span>
          </span>
          <span className="font-medium text-gray-800">+${newAccumulated.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-semibold text-gray-700">Estimated total at retirement</span>
          <span className="text-xl font-bold text-blue-600">${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
