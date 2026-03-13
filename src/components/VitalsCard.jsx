import { Badge } from '../ui/Badge'

export function VitalsCard({ icon, label, value, unit, trend, status = 'normal' }) {
  const statusColors = {
    normal:   { dot: 'bg-emerald-400', badge: 'normal',  text: 'Normal' },
    warning:  { dot: 'bg-amber-400',   badge: 'warning', text: 'Elevated' },
    critical: { dot: 'bg-rose-500',    badge: 'critical',text: 'Critical' },
  }
  const s = statusColors[status]

  const trendIcon = trend === 'up'
    ? <svg className="w-3 h-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
    : trend === 'down'
    ? <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
    : <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        <Badge variant={s.badge} className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 ${s.dot} rounded-full`} />
          {s.text}
        </Badge>
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        <span className="text-sm text-gray-400 font-medium pb-1">{unit}</span>
        <span className="pb-1 ml-auto">{trendIcon}</span>
      </div>
    </div>
  )
}
