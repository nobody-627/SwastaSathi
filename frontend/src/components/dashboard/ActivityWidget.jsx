import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Flame,
  RefreshCcw,
  Settings2,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useActivityStore } from '../../store/activityStore'

function ProgressRow({ label, value, goal, icon, color }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <span className="text-gray-500 text-xs">{value.toLocaleString()} / {goal.toLocaleString()}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="text-[11px] text-gray-400 font-semibold">{pct}% of goal</div>
    </div>
  )
}

function GoalsModal({ open, onClose, onSave, initial }) {
  const [goals, setGoals] = useState(initial)

  useEffect(() => {
    setGoals(initial)
  }, [initial.goalSteps, initial.goalCarbs])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ goalSteps: Number(goals.goalSteps) || 0, goalCarbs: Number(goals.goalCarbs) || 0 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-rose-500">Goals</p>
            <h3 className="text-lg font-bold text-gray-800">Daily targets</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-gray-700">Steps goal</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              value={goals.goalSteps}
              min={0}
              onChange={(e) => setGoals({ ...goals, goalSteps: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Carbs burned goal</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              value={goals.goalCarbs}
              min={0}
              onChange={(e) => setGoals({ ...goals, goalCarbs: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm font-semibold bg-rose-500 text-white px-4 py-2 rounded-lg shadow hover:bg-rose-600 transition"
            >
              Save goals
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ActivityWidget() {
  const { summary, history, loading, error, lastSynced, load, syncNow, updateGoals } = useActivityStore()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const warnLow = useMemo(() => {
    const now = new Date()
    return now.getHours() >= 18 && summary.steps < summary.goalSteps * 0.5
  }, [summary.goalSteps, summary.steps])

  const celebrate = summary.steps >= summary.goalSteps

  const lastSyncedLabel = lastSynced
    ? `Synced ${new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Not synced yet'

  const handleSaveGoals = async (goals) => {
    await updateGoals(goals)
    setShowSettings(false)
    load(summary.date)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase text-rose-500">Today's Activity</p>
          <h3 className="text-lg font-bold text-gray-800">Steps & Carbs</h3>
          <p className="text-xs text-gray-400">{lastSyncedLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-200 transition"
            aria-label="Edit goals"
          >
            <Settings2 size={16} />
          </button>
          <button
            onClick={syncNow}
            className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold shadow hover:bg-gray-800 transition"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
            Sync now
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {warnLow && (
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle size={14} />
          <span>Steps are below 50% of goal and it's past 6pm. Consider a short walk.</span>
        </div>
      )}

      {celebrate && (
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <Sparkles size={14} />
          <span>Goals hit! Great job staying active today.</span>
        </div>
      )}

      {summary.steps === 0 && summary.carbsBurned === 0 && !loading ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-4 text-sm text-gray-500 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-700">No activity yet today</p>
            <p className="text-xs text-gray-400">Sync your device or add data to see progress.</p>
          </div>
          <button
            onClick={syncNow}
            className="px-3 py-2 text-sm font-semibold bg-rose-50 text-rose-600 rounded-lg border border-rose-100 hover:bg-rose-100 transition"
          >
            Sync now
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ProgressRow
            label="Steps"
            value={summary.steps}
            goal={summary.goalSteps}
            icon={<Activity size={16} />}
            color="#f43f5e"
          />
          <ProgressRow
            label="Carbs burned"
            value={summary.carbsBurned}
            goal={summary.goalCarbs}
            icon={<Flame size={16} />}
            color="#fb923c"
          />
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Clock size={14} className="text-rose-400" />
            <span>Last 7 days</span>
          </div>
          <span className="text-[11px] text-gray-400">Steps vs Carbs</span>
        </div>

        {history?.length ? (
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs font-semibold text-gray-700">
                        <div>{payload[0].payload.date}</div>
                        <div className="text-rose-500">Steps: {payload.find(p => p.dataKey === 'steps')?.value}</div>
                        <div className="text-amber-500">Carbs: {payload.find(p => p.dataKey === 'carbsBurned')?.value}</div>
                      </div>
                    )
                  }}
                />
                <Line type="monotone" dataKey="steps" stroke="#f43f5e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="carbsBurned" stroke="#fb923c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-24 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
            No history yet
          </div>
        )}
      </div>

      <GoalsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveGoals}
        initial={{ goalSteps: summary.goalSteps, goalCarbs: summary.goalCarbs }}
      />
    </div>
  )
}
