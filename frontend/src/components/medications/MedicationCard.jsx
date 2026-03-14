import { Pill, Clock3, User, Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

const toDisplayTime = (t) => {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = ((h + 11) % 12) + 1
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`
}

export default function MedicationCard({ medication, onEdit, onDelete, onToggleActive, onMarkTaken }) {
  const { name, dosage, frequency, times = [], instructions, prescribedBy, active, takenToday = [] } = medication

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm animate-[fadeSlideIn_300ms_ease]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-[15px]">
            <Pill className="h-4 w-4 text-rose-500" />
            <span>{name}</span>
          </div>
          <div className="text-sm text-slate-500 font-mono mt-1">{dosage}</div>
        </div>
        <button
          onClick={() => onToggleActive(medication)}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
        >
          {active ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
          <span>{active ? 'Active' : 'Paused'}</span>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="text-xs uppercase tracking-[0.06em] text-slate-400">Frequency</div>
        <div className="text-xs uppercase tracking-[0.06em] text-slate-400">Prescribed By</div>
        <div className="text-sm font-semibold text-slate-700">{frequency === 'once' ? 'Once daily' : frequency === 'twice' ? 'Twice daily' : frequency === 'thrice' ? 'Thrice daily' : 'Custom'}</div>
        <div className="text-sm text-slate-700 flex items-center gap-2"><User className="h-4 w-4 text-slate-400" />{prescribedBy || '—'}</div>
      </div>

      <div className="mt-3">
        <div className="text-xs uppercase tracking-[0.06em] text-slate-400 mb-1">Time slots</div>
        <div className="flex flex-wrap gap-2">
          {times.map((t) => {
            const taken = takenToday.includes(t)
            const cls = taken
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
            return (
              <span
                key={t}
                className={`px-3 py-1 rounded-full text-xs font-mono border ${cls}`}
              >
                {toDisplayTime(t)}
              </span>
            )
          })}
        </div>
      </div>

      {instructions && (
        <div className="mt-3 text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <Clock3 className="h-4 w-4 inline text-rose-500 mr-2" />
          {instructions}
        </div>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(medication)}
            className="flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100"
          >
            <Edit3 className="h-4 w-4" /> Edit
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
        <div className="flex gap-2">
          {times.map((t) => (
            <button
              key={t}
              onClick={() => onMarkTaken(medication.id, t)}
              disabled={takenToday.includes(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                takenToday.includes(t)
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                  : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
              }`}
            >
              {takenToday.includes(t) ? 'Taken' : 'Mark Taken'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
