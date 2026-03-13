import { clsx } from 'clsx'
import { useAgentStore } from '../../store/agentStore'

const STATUS_STYLES = {
  CALIBRATING: { dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-600 border-blue-200'   },
  ASSESSING:   { dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-600 border-amber-200'},
  MONITORING:  { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200'},
  ALERTING:    { dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-600 border-orange-200'},
  EMERGENCY:   { dot: 'bg-rose-500 animate-pulse', badge: 'bg-rose-50 text-rose-600 border-rose-200'},
}

const WEIGHT_COLORS = {
  hr:   '#f43f5e',
  spo2: '#3b82f6',
  temp: '#8b5cf6',
  hrv:  '#f59e0b',
}

export default function AgentPanel() {
  const { agent, streamingText } = useAgentStore()
  const style = STATUS_STYLES[agent.status] || STATUS_STYLES.MONITORING

  return (
    <div className="flex flex-col gap-4">

      {/* Status header */}
      <div className="sidebar-section">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Agent Status</div>
        <div className="flex items-center gap-2 mb-3">
          <div className={clsx('w-2.5 h-2.5 rounded-full', style.dot)} />
          <span className={clsx('text-xs font-bold px-2.5 py-0.5 rounded-full border', style.badge)}>
            {agent.status}
          </span>
        </div>
        <div className="space-y-2">
          {[
            { l: 'Pattern',    v: agent.pattern    },
            { l: 'Confidence', v: `${agent.confidence}%` },
            { l: 'Cycle',      v: `#${agent.cycle}`},
            { l: 'Mode',       v: agent.isMock ? 'Local AI' : 'Claude API' },
          ].map(({ l, v }) => (
            <div key={l} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-400">{l}</span>
              <span className="font-semibold text-gray-700">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning */}
      <div className="sidebar-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-md bg-purple-50 flex items-center justify-center text-xs">🧠</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Reasoning</div>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed italic min-h-[48px]">
          {streamingText || agent.reasoning}
          <span className="animate-blink text-rose-400 font-bold">|</span>
        </p>
      </div>

      {/* Signal weights */}
      <div className="sidebar-section">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Signal Weights</div>
        <div className="space-y-2.5">
          {Object.entries(agent.weights || {}).map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-semibold text-gray-500 uppercase">{k}</span>
                <span className="text-gray-400">{Math.round(v * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${v * 100}%`, background: WEIGHT_COLORS[k] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
