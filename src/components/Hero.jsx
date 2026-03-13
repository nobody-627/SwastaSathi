import { useNavigate } from 'react-router-dom'
import { Badge } from '../ui/Badge'

// Inline mini dashboard preview card
function MiniCard({ icon, label, value, unit, color, status }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-card border border-gray-100 flex items-center gap-3">
      <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center text-base flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value} <span className="text-xs font-normal text-gray-400">{unit}</span></p>
      </div>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === 'normal' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
    </div>
  )
}

// Mini sparkline using SVG
function Sparkline({ color = '#f43f5e' }) {
  const pts = [40, 42, 38, 45, 43, 47, 44, 42, 48, 46, 44, 47]
  const max = Math.max(...pts), min = Math.min(...pts)
  const norm = pts.map(p => 36 - ((p - min) / (max - min)) * 30)
  const d = norm.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * (120 / (pts.length - 1))} ${y}`).join(' ')

  return (
    <svg viewBox="0 0 120 40" className="w-full h-10" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${d} L 120 40 L 0 40 Z`} fill={color} fillOpacity="0.08" />
    </svg>
  )
}

// Circular risk gauge SVG
function RiskGauge({ value = 28 }) {
  const r = 40, cx = 50, cy = 50
  const circumference = 2 * Math.PI * r
  const arc = (circumference * 0.75)
  const filled = arc * (value / 100)

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[135deg]">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6"
          strokeWidth="8" strokeDasharray={`${arc} ${circumference}`} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981"
          strokeWidth="8" strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-gray-900">{value}</span>
        <span className="text-[9px] text-gray-400 font-medium">RISK</span>
      </div>
    </div>
  )
}

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              AI-Powered Health Monitoring
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Monitor Your
              <span className="gradient-text block mt-1">Health with AI</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
              SwasthSathi continuously monitors your vitals, detects dangerous anomalies using AI,
              and autonomously alerts emergency contacts — before it's too late.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-10">
              {[
                { value: '21+', label: 'Hours earlier detection' },
                { value: '99.2%', label: 'Alert accuracy' },
                { value: '3s', label: 'Response time' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-black gradient-text">{s.value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/dashboard')} className="btn-primary text-base px-8 py-3.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Get Started Free
              </button>
              <button onClick={() => navigate('/dashboard')} className="btn-secondary text-base px-8 py-3.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Dashboard
              </button>
            </div>
          </div>

          {/* Right: Dashboard Preview Mockup */}
          <div className="relative animate-slide-up">
            {/* Floating badge */}
            <div className="absolute -top-4 -left-4 z-10 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 animate-float">
              <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Status</p>
                <p className="text-xs font-bold text-emerald-600">All Vitals Normal</p>
              </div>
            </div>

            {/* Alert badge */}
            <div className="absolute -bottom-4 -right-4 z-10 bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
              <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">AI Monitor</p>
                <p className="text-xs font-bold text-rose-600">Active Monitoring</p>
              </div>
            </div>

            {/* Main dashboard card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-rose-100/60 p-5 relative overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Patient: Ramesh, 64</p>
                  <p className="text-sm font-bold text-gray-900">Health Dashboard</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 rounded-full px-2.5 py-1 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Vitals grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <MiniCard icon="💗" label="Heart Rate"    value="74"   unit="bpm" color="bg-rose-50"    status="normal" />
                <MiniCard icon="🫁" label="Blood Oxygen"  value="97.3" unit="%"   color="bg-blue-50"   status="normal" />
                <MiniCard icon="🌡" label="Temperature"   value="36.5" unit="°C"  color="bg-orange-50" status="normal" />
                <MiniCard icon="⚡" label="HRV"           value="43"   unit="ms"  color="bg-violet-50" status="warning" />
              </div>

              {/* Chart + gauge row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Heart Rate History</p>
                  <Sparkline color="#f43f5e" />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-gray-400">60s ago</span>
                    <span className="text-[9px] text-gray-400">now</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
                  <RiskGauge value={22} />
                  <p className="text-[10px] text-gray-500 font-medium text-center">Low Risk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
