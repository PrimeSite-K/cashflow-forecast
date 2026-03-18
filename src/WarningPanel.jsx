import { format, parseISO } from 'date-fns'
import { AlertTriangle } from 'lucide-react'

export default function WarningPanel({ warnings, threshold }) {
  if (warnings.length === 0) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700">
      ✅ No low-balance warnings in the next 180 days. You're on track!
    </div>
  )

  // Find the earliest and lowest
  const earliest = warnings[0]
  const lowest = warnings.reduce((a, b) => a.balance < b.balance ? a : b)

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-red-700 font-semibold">
        <AlertTriangle size={16} /> Cash Flow Warnings
      </div>
      <p className="text-sm text-red-600">
        ⚡ First warning: <strong>{format(parseISO(earliest.date), 'MMM d, yyyy')}</strong> — balance drops to <strong>${earliest.balance.toLocaleString()}</strong>
      </p>
      <p className="text-sm text-red-600">
        📉 Lowest point: <strong>{format(parseISO(lowest.date), 'MMM d, yyyy')}</strong> — <strong>${lowest.balance.toLocaleString()}</strong>
      </p>
      <p className="text-xs text-red-400">{warnings.length} day(s) below the ${threshold} threshold</p>
    </div>
  )
}
