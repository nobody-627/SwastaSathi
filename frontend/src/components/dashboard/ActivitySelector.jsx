import { clsx } from 'clsx'
import { useAgentStore } from '../../store/agentStore'
import { ACTIVITIES } from '../../hooks/useAgent'

export default function ActivitySelector() {
  const { currentActivity, setActivity } = useAgentStore()

  return (
    <div className="sidebar-section">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Current Activity
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {Object.entries(ACTIVITIES).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setActivity(key)}
            className={clsx(
              'text-[11px] font-semibold px-2 py-1.5 rounded-lg border transition-all text-left',
              currentActivity === key
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-rose-200 hover:text-rose-500'
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 italic">
        AI adjusts risk thresholds based on your activity
      </p>
    </div>
  )
}