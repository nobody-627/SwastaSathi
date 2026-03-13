import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'

const SAMPLE_DATA = [
  { t: '0s', hr: 72, spo2: 97 },
  { t: '3s', hr: 74, spo2: 97 },
  { t: '6s', hr: 73, spo2: 98 },
  { t: '9s', hr: 76, spo2: 97 },
  { t: '12s', hr: 75, spo2: 96 },
  { t: '15s', hr: 78, spo2: 97 },
  { t: '18s', hr: 77, spo2: 97 },
  { t: '21s', hr: 74, spo2: 98 },
  { t: '24s', hr: 76, spo2: 97 },
  { t: '27s', hr: 79, spo2: 96 },
  { t: '30s', hr: 78, spo2: 97 },
  { t: '33s', hr: 75, spo2: 97 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value} {p.dataKey === 'hr' ? 'bpm' : '%'}
        </p>
      ))}
    </div>
  )
}

export function VitalsChart({ data = SAMPLE_DATA, height = 160 }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-gray-900">Vitals History</p>
          <p className="text-xs text-gray-400">Last 30 seconds</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 rounded-full" />
            <span className="text-gray-500">Heart Rate</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-400 rounded-full" />
            <span className="text-gray-500">SpO₂</span>
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={72} stroke="#f43f5e" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Area type="monotone" dataKey="hr" name="Heart Rate" stroke="#f43f5e"
            strokeWidth={2} fill="url(#hrGrad)" dot={false} activeDot={{ r: 4, fill: '#f43f5e' }} />
          <Area type="monotone" dataKey="spo2" name="SpO₂" stroke="#60a5fa"
            strokeWidth={2} fill="url(#spo2Grad)" dot={false} activeDot={{ r: 4, fill: '#60a5fa' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
