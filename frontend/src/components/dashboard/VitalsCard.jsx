import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getVitalStatus } from '../../hooks/useAgent'
import { clsx } from 'clsx'

const STATUS_COLORS = {
  normal:   { bg: '#f0fdf4', border: '#bbf7d0', value: '#16a34a', icon: '#dcfce7' },
  warning:  { bg: '#fffbeb', border: '#fde68a', value: '#d97706', icon: '#fef3c7' },
  critical: { bg: '#fff5f7', border: '#fecdd3', value: '#f43f5e', icon: '#ffe4e8' },
}

const VITAL_META = {
  hr:   { label: 'Heart Rate',   unit: 'bpm',  normalRange: '60–100' },
  spo2: { label: 'SpO2',         unit: '%',    normalRange: '95–100' },
  temp: { label: 'Temperature',  unit: '°C',   normalRange: '36.1–37.2' },
  hrv:  { label: 'HRV',          unit: 'ms',   normalRange: '20–70' },
}

function TrendIcon({ trend }) {
  if (trend === 'rising')  return <TrendingUp  size={13} className="text-rose-400"  />
  if (trend === 'falling') return <TrendingDown size={13} className="text-blue-400" />
  return <Minus size={13} className="text-gray-300" />
}

export default function VitalsCard({ metricKey, value, trend, baseline, icon }) {
  const status  = getVitalStatus(metricKey, value)
  const colors  = STATUS_COLORS[status]
  const meta    = VITAL_META[metricKey]
  const dev     = baseline ? (value - baseline).toFixed(1) : null
  const devSign = dev > 0 ? '+' : ''

  return (
    <div
      className="rounded-xl p-4 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: colors.icon }}
        >
          {icon}
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon trend={trend} />
          <span className={clsx(
            'text-[10px] font-semibold capitalize',
            trend === 'rising'  ? 'text-rose-400' :
            trend === 'falling' ? 'text-blue-400' : 'text-gray-400'
          )}>
            {trend}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
        {meta.label}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-2">
        <span
          className="text-3xl font-bold font-mono leading-none"
          style={{ color: colors.value }}
        >
          {value}
        </span>
        <span className="text-xs text-gray-400">{meta.unit}</span>
      </div>

      {/* Deviation + normal range */}
      <div className="flex items-center justify-between">
        {dev !== null && (
          <span className={clsx(
            'text-[10px] font-semibold',
            parseFloat(dev) === 0 ? 'text-gray-400' :
            status === 'critical' ? 'text-rose-500' :
            status === 'warning'  ? 'text-amber-500' : 'text-emerald-600'
          )}>
            {devSign}{dev} from baseline
          </span>
        )}
        <span className="text-[10px] text-gray-300 ml-auto">
          {meta.normalRange} {meta.unit}
        </span>
      </div>

      {/* Status pill */}
      <div className="mt-2">
        <span className={clsx(
          'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
          status === 'normal'   ? 'bg-emerald-100 text-emerald-600' :
          status === 'warning'  ? 'bg-amber-100 text-amber-600' :
                                  'bg-rose-100 text-rose-600'
        )}>
          {status}
        </span>
      </div>
    </div>
  )
}
