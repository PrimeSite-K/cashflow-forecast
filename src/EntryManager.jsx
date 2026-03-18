import { useState } from 'react'
import { format } from 'date-fns'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'

const FREQUENCIES = [
  { value: 'once',      label: 'One-time' },
  { value: 'weekly',    label: 'Weekly' },
  { value: 'biweekly',  label: 'Every 2 weeks' },
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly',    label: 'Yearly' },
]

const EMPTY = {
  name: '', amount: '', type: 'expense',
  frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: ''
}

export default function EntryManager({ entries, onChange }) {
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [open, setOpen] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const entry = { ...form, amount: parseFloat(form.amount), id: editId || crypto.randomUUID() }
    if (editId) {
      onChange(entries.map(x => x.id === editId ? entry : x))
    } else {
      onChange([...entries, entry])
    }
    setForm(EMPTY); setEditId(null); setOpen(false)
  }

  function startEdit(entry) {
    setForm({ ...entry, amount: String(entry.amount) })
    setEditId(entry.id)
    setOpen(true)
  }

  function remove(id) {
    onChange(entries.filter(x => x.id !== id))
  }

  const incomes = entries.filter(e => e.type === 'income')
  const expenses = entries.filter(e => e.type === 'expense')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Cash Flow Entries</h2>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setOpen(true) }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
          <PlusCircle size={16} /> Add Entry
        </button>
      </div>

      {[{ label: '💰 Income', list: incomes }, { label: '💸 Expenses', list: expenses }].map(({ label, list }) => (
        <div key={label}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          {list.length === 0 && <p className="text-sm text-gray-400 italic">None yet</p>}
          <div className="space-y-1">
            {list.map(entry => (
              <div key={entry.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-800">{entry.name}</span>
                  <span className="ml-2 text-gray-500">${entry.amount.toLocaleString()}</span>
                  <span className="ml-2 text-xs text-gray-400">{FREQUENCIES.find(f => f.value === entry.frequency)?.label}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(entry)} className="text-gray-400 hover:text-blue-500"><Pencil size={14} /></button>
                  <button onClick={() => remove(entry.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h3 className="font-semibold text-gray-800">{editId ? 'Edit Entry' : 'New Entry'}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Name</label>
                <input required className="input" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Salary" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Amount ($)</label>
                <input required type="number" min="0" step="0.01" className="input" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Type</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Frequency</label>
                <select className="input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                  {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Start Date</label>
                <input required type="date" className="input" value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">End Date <span className="text-gray-400">(optional — leave blank for ongoing)</span></label>
                <input type="date" className="input" value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editId ? 'Save Changes' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
