import { useNavigate } from 'react-router-dom'
import { VitalsCard }   from './VitalsCard'
import { RiskScoreCard } from './RiskScoreCard'
import { VitalsChart }   from './VitalsChart'

export default function DashboardPreview() {
  const navigate = useNavigate()

  return (
    <section id="dashboard" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Live Dashboard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Everything at a{' '}
            <span className="gradient-text">single glance</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A beautifully designed real-time dashboard that gives you instant insight into every vital parameter — powered by AI reasoning.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 lg:p-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 gradient-card rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">SwasthSathi Monitor</p>
                <p className="text-xs text-gray-400">Patient: Ramesh, 64 · Active Session</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-xs px-4 py-2">
                Open Live →
              </button>
            </div>
          </div>

          {/* Vitals grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <VitalsCard icon="💗" label="Heart Rate"    value="74"   unit="bpm" trend="stable" status="normal"  />
            <VitalsCard icon="🫁" label="Blood Oxygen"  value="97.3" unit="%"   trend="stable" status="normal"  />
            <VitalsCard icon="🌡" label="Temperature"   value="36.5" unit="°C"  trend="down"   status="normal"  />
            <VitalsCard icon="⚡" label="HRV"           value="43"   unit="ms"  trend="up"     status="warning" />
          </div>

          {/* Chart + gauge row */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <VitalsChart height={180} />
            </div>
            <RiskScoreCard score={28} />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ↑ Interactive preview — click "Open Live" to see the full AI agent dashboard
        </p>
      </div>
    </section>
  )
}
