import { useState } from 'react'

export default function RetirementEstimator() {
  const [currentBalance, setCurrentBalance] = useState(200000)
  const [monthlyContrib, setMonthlyContrib] = useState(800)
  const [years, setYears] = useState(8)

  // 0% interest — pure linear accumulation (no compounding)
  const newAccumulated = monthlyContrib * 12 * years
  const total = currentBalance + newAccumulated

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">🎯 退休测算</h2>
        <p className="text-xs text-gray-400 mt-0.5">个人养老金账户 · 0% 利率 · 不计复利</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-gray-500 font-medium">养老金账户现有余额（元）</label>
          <input
            type="number" min="0" step="1000"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={currentBalance}
            onChange={e => setCurrentBalance(Math.max(0, parseFloat(e.target.value) || 0))}
          />
          <p className="text-xs text-gray-400 mt-1">个人养老金账户当前余额</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium">每月缴存金额（元）</label>
          <input
            type="number" min="0" step="50"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={monthlyContrib}
            onChange={e => setMonthlyContrib(Math.max(0, parseFloat(e.target.value) || 0))}
          />
          <p className="text-xs text-gray-400 mt-1">每月新增缴存金额</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium">距退休年数（年）</label>
          <input
            type="number" min="1" max="50" step="1"
            className="mt-1 w-full text-xl font-bold text-gray-800 outline-none border-b border-gray-200 pb-1"
            value={years}
            onChange={e => setYears(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <p className="text-xs text-gray-400 mt-1">距退休还有多少年</p>
        </div>
      </div>

      {/* Result breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">现有余额</span>
          <span className="font-medium text-gray-800">¥{currentBalance.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            新增累计&nbsp;
            <span className="text-gray-400">（¥{monthlyContrib.toLocaleString()} × 12个月 × {years}年）</span>
          </span>
          <span className="font-medium text-gray-800">+¥{newAccumulated.toLocaleString()}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="font-semibold text-gray-700">退休时预计总额</span>
          <span className="text-xl font-bold text-blue-600">¥{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
