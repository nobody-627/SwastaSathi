import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { useMedicationStore } from '../../store/medicationStore'

const toDisplayTime = (t) => {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = ((h + 11) % 12) + 1
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`
}

export default function ReminderBanner({ className = '' }) {
  const { medications, getDueNow, markTaken, loadMedications } = useMedicationStore()
  const [hidden, setHidden] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const due = useMemo(() => getDueNow(), [medications, tick, getDueNow])

  if (hidden || !due.length) return null

  return (
    <div className={`border-b px-4 sm:px-6 py-3 bg-amber-50 border-amber-200 ${className}`}>
      <div className="max-w-screen-xl mx-auto flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Medication Reminder</span>
        </div>
        <div className="flex flex-wrap gap-2 flex-1">
          {due.map((med) => {
            const pendingTime = med.times.find((t) => !(med.takenToday || []).includes(t))
            return (
              <div key={med.id} className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-sm text-slate-800 font-semibold">
                  💊 {med.name} {med.dosage}
                </span>
                {pendingTime && (
                  <span className="text-xs font-mono text-amber-700">due {toDisplayTime(pendingTime)}</span>
                )}
                {pendingTime && (
                  <button
                    onClick={() => markTaken(med.id, pendingTime)}
                    className="text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg px-2.5 py-1 shadow"
                  >
                    Mark as Taken
                  </button>
                )}
                {!pendingTime && (
                  <span className="text-xs text-emerald-700 flex items-center gap-1"><CheckCircle className="h-3 w-3" />All taken</span>
                )}
              </div>
            )
          })}
        </div>
        <button
          onClick={() => setHidden(true)}
          className="text-xs text-slate-500 hover:text-rose-600"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
