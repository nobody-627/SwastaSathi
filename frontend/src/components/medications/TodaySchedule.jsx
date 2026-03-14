import { useEffect } from 'react'
import { Clock3, CheckCircle2, AlarmClock } from 'lucide-react'
import { useMedicationStore } from '../../store/medicationStore'

const toDisplayTime = (t) => {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = ((h + 11) % 12) + 1
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`
}

export default function TodaySchedule({ title = "Today's Medications" }) {
  const { medications, loadMedications, markTaken } = useMedicationStore()

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  const items = medications.flatMap((med) =>
    med.times.map((time) => ({
      med,
      time,
      taken: (med.takenToday || []).includes(time),
    }))
  ).sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.06em] text-slate-400">Schedule</div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>
        <Clock3 className="h-5 w-5 text-rose-500" />
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-slate-500">No medications scheduled.</div>
      ) : (
        <div className="space-y-3">
          {items.map(({ med, time, taken }) => (
            <div key={`${med.id}-${time}`} className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2">
              <div>
                <div className="text-xs uppercase tracking-[0.06em] text-slate-400">{med.name}</div>
                <div className="text-sm font-semibold text-slate-800">{med.dosage}</div>
                <div className="text-xs text-slate-500 font-mono">{toDisplayTime(time)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${taken ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {taken ? 'Taken' : 'Pending'}
                </span>
                <button
                  disabled={taken}
                  onClick={() => markTaken(med.id, time)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${taken ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' : 'text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.3)]'}`}
                >
                  {taken ? <CheckCircle2 className="h-4 w-4" /> : <AlarmClock className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
