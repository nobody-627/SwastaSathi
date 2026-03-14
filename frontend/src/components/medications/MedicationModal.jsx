import { useEffect, useState } from 'react'
import { X, Plus, Clock3 } from 'lucide-react'

const defaultTimes = {
  once: ['08:00'],
  twice: ['08:00', '20:00'],
  thrice: ['08:00', '14:00', '21:00'],
  custom: ['08:00'],
}

const toDisplayTime = (t) => {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = ((h + 11) % 12) + 1
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`
}

export default function MedicationModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: 'once',
    times: ['08:00'],
    instructions: '',
    prescribedBy: '',
    startDate: new Date().toISOString().slice(0, 10),
    active: true,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setErrors({})
      if (initial) {
        setForm({
          name: initial.name || '',
          dosage: initial.dosage || '',
          frequency: initial.frequency || 'once',
          times: initial.times || ['08:00'],
          instructions: initial.instructions || '',
          prescribedBy: initial.prescribedBy || '',
          startDate: initial.startDate || new Date().toISOString().slice(0, 10),
          active: initial.active ?? true,
        })
      } else {
        setForm({
          name: '',
          dosage: '',
          frequency: 'once',
          times: ['08:00'],
          instructions: '',
          prescribedBy: '',
          startDate: new Date().toISOString().slice(0, 10),
          active: true,
        })
      }
    }
  }, [open, initial])

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const updateFrequency = (value) => {
    setField('frequency', value)
    setField('times', defaultTimes[value] || ['08:00'])
  }

  const addTime = () => {
    setField('times', [...form.times, '08:00'])
  }

  const updateTime = (idx, value) => {
    const next = [...form.times]
    next[idx] = value
    setField('times', next)
  }

  const removeTime = (idx) => {
    const next = form.times.filter((_, i) => i !== idx)
    setField('times', next.length ? next : ['08:00'])
  }

  const validate = () => {
    const err = {}
    if (!form.name.trim()) err.name = 'Medication name is required'
    if (!form.dosage.trim()) err.dosage = 'Dosage is required'
    if (!form.frequency) err.frequency = 'Select a frequency'
    if (!form.times.length) err.times = 'At least one time is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const save = () => {
    if (!validate()) return
    onSave({ ...form, times: form.times.map((t) => t.trim()) })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{initial ? 'Edit Medication' : 'Add Medication'}</h3>
            <p className="text-sm text-slate-500">Configure reminder times and instructions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Medication Name
            <input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              placeholder="Metformin"
            />
            {errors.name && <span className="text-xs text-rose-600">{errors.name}</span>}
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Dosage
            <input
              value={form.dosage}
              onChange={(e) => setField('dosage', e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 font-mono"
              placeholder="500mg"
            />
            {errors.dosage && <span className="text-xs text-rose-600">{errors.dosage}</span>}
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Frequency
            <select
              value={form.frequency}
              onChange={(e) => updateFrequency(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            >
              <option value="once">Once daily</option>
              <option value="twice">Twice daily</option>
              <option value="thrice">Thrice daily</option>
              <option value="custom">Custom</option>
            </select>
            {errors.frequency && <span className="text-xs text-rose-600">{errors.frequency}</span>}
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Prescribed By
            <input
              value={form.prescribedBy}
              onChange={(e) => setField('prescribedBy', e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              placeholder="Dr. Sharma"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Start Date
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setField('active', e.target.checked)}
              className="h-4 w-4 text-rose-500 border-slate-300 rounded"
            />
            Active
          </label>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-[0.06em] text-slate-400">Time Slots</div>
            <button
              onClick={addTime}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add time
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {form.times.map((t, idx) => (
              <div key={`${t}-${idx}`} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <input
                  type="time"
                  value={t}
                  onChange={(e) => updateTime(idx, e.target.value)}
                  className="font-mono text-sm bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-400">{toDisplayTime(t)}</span>
                {form.times.length > 1 && (
                  <button
                    onClick={() => removeTime(idx)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.times && <div className="text-xs text-rose-600 mt-1">{errors.times}</div>}
        </div>

        <div className="mt-4">
          <label className="flex flex-col gap-1 text-sm text-slate-700">
            Instructions
            <textarea
              value={form.instructions}
              onChange={(e) => setField('instructions', e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              rows={3}
              placeholder="e.g., take after meals with water"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_16px_rgba(244,63,94,0.35)]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
