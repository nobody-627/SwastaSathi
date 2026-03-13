import { clsx } from 'clsx'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { useAgentStore } from '../../store/agentStore'

const MODES = [
  { id: null,      label: '↺ Normal',     bg: 'bg-emerald-50',  border: 'border-emerald-200', active: 'bg-emerald-500 text-white border-emerald-500' },
  { id: 'cardiac', label: '💗 Cardiac',   bg: 'bg-red-50',      border: 'border-red-200',     active: 'bg-red-500 text-white border-red-500'         },
  { id: 'hypoxic', label: '🫁 Hypoxic',   bg: 'bg-orange-50',   border: 'border-orange-200',  active: 'bg-orange-500 text-white border-orange-500'   },
  { id: 'stress',  label: '⚡ Stress',    bg: 'bg-yellow-50',   border: 'border-yellow-200',  active: 'bg-yellow-500 text-white border-yellow-500'   },
]

export default function DemoControls() {
  const { anomalyMode, isRunning, setAnomalyMode, setRunning } = useAgentStore()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1 hidden sm:block">
        Scenario:
      </span>

      {MODES.map(({ id, label, bg, border, active }) => (
        <button
          key={String(id)}
          onClick={() => setAnomalyMode(id)}
          className={clsx(
            'text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95',
            anomalyMode === id
              ? active
              : `${bg} ${border} text-gray-600 hover:border-gray-400`
          )}
        >
          {label}
        </button>
      ))}

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

      {/* Play/Pause */}
      <button
        onClick={() => setRunning(!isRunning)}
        className={clsx(
          'flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95',
          isRunning
            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
            : 'bg-rose-50 border-rose-200 text-rose-500'
        )}
      >
        {isRunning
          ? <><Pause size={11} /> Pause</>
          : <><Play  size={11} /> Resume</>
        }
      </button>
    </div>
  )
}
