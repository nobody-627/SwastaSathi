import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { gaugeColor } from '../../hooks/useAgent'

const RISK_LABELS = {
  NORMAL:          { label: 'Normal',          short: 'All Clear'    },
  ELEVATED:        { label: 'Elevated',        short: 'Watch'        },
  CONCERNING:      { label: 'Concerning',      short: 'Alert'        },
  CARDIAC_DISTRESS:{ label: 'Cardiac Distress',short: 'High Risk'    },
  HYPOXIC_EVENT:   { label: 'Hypoxic Event',   short: 'Critical'     },
  STRESS_RESPONSE: { label: 'Stress Response', short: 'Stress'       },
  CRITICAL:        { label: 'Critical',        short: 'CRITICAL'     },
}

export default function RiskGauge({ score = 0, pattern = 'NORMAL', confidence = 0 }) {
  const pct    = Math.round(score * 10)
  const color  = gaugeColor(score)
  const meta   = RISK_LABELS[pattern] || RISK_LABELS.NORMAL

  const data = [
    { value: 100, fill: '#fde8ed' },
    { value: pct,  fill: color    },
  ]

  return (
    <div className="flex flex-col items-center">
      <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-1">
        Risk Assessment
      </div>

      <div className="relative w-full" style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height={160}>
          <RadialBarChart
            innerRadius={52}
            outerRadius={74}
            startAngle={220}
            endAngle={-40}
            data={data}
            barSize={14}
          >
            <RadialBar dataKey="value" cornerRadius={7} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold font-mono leading-none" style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color }}>
            {meta.short}
          </span>
        </div>
      </div>

      {/* Pattern label */}
      <div className="text-xs font-semibold text-gray-600 text-center mb-1">{meta.label}</div>

      {/* Confidence bar */}
      <div className="w-full px-2">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>AI Confidence</span>
          <span className="font-semibold text-gray-600">{confidence}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${confidence}%`, background: color }}
          />
        </div>
      </div>

      {/* Score legend */}
      <div className="flex items-center justify-between w-full mt-3 px-1">
        {[
          { c: '#10b981', l: 'Normal',   r: '0–3.9' },
          { c: '#fbbf24', l: 'Moderate', r: '4–5.9' },
          { c: '#f97316', l: 'High',     r: '6–7.9' },
          { c: '#f43f5e', l: 'Critical', r: '8–10'  },
        ].map(({ c, l, r }) => (
          <div key={l} className="flex flex-col items-center gap-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-[9px] text-gray-400 font-medium">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
