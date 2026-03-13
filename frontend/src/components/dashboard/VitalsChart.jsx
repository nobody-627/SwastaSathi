import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const CHART_META = {
  hr:   { label: 'Heart Rate (bpm)', color: '#f43f5e', normalMin: 60,   normalMax: 100  },
  spo2: { label: 'SpO2 (%)',         color: '#3b82f6', normalMin: 95,   normalMax: 100  },
  temp: { label: 'Temperature (°C)', color: '#8b5cf6', normalMin: 36.1, normalMax: 37.2 },
  hrv:  { label: 'HRV (ms)',         color: '#f59e0b', normalMin: 20,   normalMax: 70   },
}

function MiniChart({ readings, metricKey, height = 72 }) {
  const meta = CHART_META[metricKey]
  const data = readings.slice(-40).map((r, i) => ({ i, v: r[metricKey] }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-100 rounded-lg px-2 py-1 shadow-lg text-xs font-semibold" style={{ color: meta.color }}>
        {payload[0].value} {meta.label.split(' ').pop().replace(/[()]/g, '')}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-gray-500">{meta.label}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500">LIVE</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={meta.color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={meta.color} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#d1d5db' }} tickLine={false} axisLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={meta.normalMin} stroke={meta.color} strokeDasharray="3 3" strokeOpacity={0.3} />
          <ReferenceLine y={meta.normalMax} stroke={meta.color} strokeDasharray="3 3" strokeOpacity={0.3} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={meta.color}
            strokeWidth={2}
            fill={`url(#grad-${metricKey})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function VitalsChart({ readings }) {
  if (!readings.length) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
        Waiting for readings…
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {['hr', 'spo2', 'temp', 'hrv'].map(k => (
        <MiniChart key={k} readings={readings} metricKey={k} />
      ))}
    </div>
  )
}
