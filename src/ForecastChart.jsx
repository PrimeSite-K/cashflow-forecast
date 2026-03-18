import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const { balance, flow } = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-blue-600">Balance: <strong>${balance.toLocaleString()}</strong></p>
      {flow !== 0 && (
        <p className={flow > 0 ? 'text-green-600' : 'text-red-500'}>
          {flow > 0 ? '+' : ''}{flow.toLocaleString()}
        </p>
      )}
    </div>
  )
}

export default function ForecastChart({ data, threshold, viewMode }) {
  // Aggregate to monthly if needed
  const chartData = viewMode === 'monthly'
    ? aggregateMonthlyForChart(data)
    : data.filter((_, i) => i % 7 === 0) // weekly ticks for daily view

  const minBalance = Math.min(...data.map(d => d.balance))
  const hasWarning = minBalance < threshold

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Cash Flow Forecast</h2>
        {hasWarning && (
          <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-full">
            ⚠️ Low balance ahead
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
            tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={threshold} stroke="#ef4444" strokeDasharray="4 4"
            label={{ value: `⚠ $${threshold}`, position: 'insideTopRight', fontSize: 11, fill: '#ef4444' }} />
          <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2}
            fill="url(#balanceGrad)" dot={false} activeDot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function aggregateMonthlyForChart(data) {
  const months = {}
  for (const d of data) {
    const month = d.date.slice(0, 7)
    months[month] = { label: month, balance: d.balance, flow: (months[month]?.flow || 0) + d.flow }
  }
  return Object.values(months)
}
