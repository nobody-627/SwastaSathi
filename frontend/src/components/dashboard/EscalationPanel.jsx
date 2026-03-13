import { clsx } from 'clsx'
import { useAgentStore } from '../../store/agentStore'

const TIERS = [
  { key: 't1', label: 'YELLOW', desc: 'Notify patient',        color: '#fbbf24', threshold: '≥ 4.0', bg: '#fffbeb', border: '#fde68a' },
  { key: 't2', label: 'ORANGE', desc: 'Alert emergency contact', color: '#f97316', threshold: '≥ 6.0', bg: '#fff7ed', border: '#fed7aa' },
  { key: 't3', label: 'RED',    desc: 'Emergency services',     color: '#f43f5e', threshold: '≥ 8.0', bg: '#fff5f7', border: '#fecdd3' },
]

export function EscalationPanel() {
  const { escalation } = useAgentStore()
  return (
    <div className="sidebar-section">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Escalation Tiers</div>
      <div className="space-y-2">
        {TIERS.map(({ key, label, desc, color, threshold, bg, border }) => {
          const tier  = escalation[key]
          const armed = tier.armed
          return (
            <div
              key={key}
              className="rounded-lg p-2.5 border transition-all"
              style={{ background: bg, borderColor: border }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-bold" style={{ color }}>
                  {label} ({threshold})
                </span>
                <span className={clsx(
                  'text-[10px] font-bold',
                  armed ? 'text-emerald-500' : 'text-gray-400'
                )}>
                  {armed ? '✓ ARMED' : `FIRED ×${tier.firedCount}`}
                </span>
              </div>
              <div className="text-[10px] text-gray-400">{desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function BaselinePanel() {
  const { baseline, readings } = useAgentStore()
  const progress = Math.min(Math.round(readings.length / 20 * 100), 100)
  const calibrated = readings.length >= 20

  return (
    <div className="sidebar-section">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Baseline Calibration</div>

      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500 font-medium">
          {calibrated ? '✓ Calibrated' : `Calibrating (${readings.length}/20)`}
        </span>
        <span className="font-bold text-rose-500">{progress}%</span>
      </div>

      <div className="h-2 bg-rose-50 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {[
          { k: 'hr',   label: 'Heart Rate', unit: 'bpm' },
          { k: 'spo2', label: 'SpO2',       unit: '%'   },
          { k: 'temp', label: 'Temp',        unit: '°C'  },
          { k: 'hrv',  label: 'HRV',         unit: 'ms'  },
        ].map(({ k, label, unit }) => (
          <div key={k} className="flex justify-between text-[11px]">
            <span className="text-gray-400">{label}</span>
            <span className="font-semibold text-gray-600 font-mono">
              {baseline[k].toFixed(1)} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
