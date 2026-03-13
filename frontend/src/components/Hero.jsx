import { Link } from 'react-router-dom'
import { Heart, Shield, Zap, ArrowRight, Activity } from 'lucide-react'
import Button from './ui/Button'

function MiniVitalCard({ icon, label, value, color, delay = 0 }) {
  return (
    <div
      className="bg-white rounded-xl p-3 border border-rose-50 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center`} style={{ background: `${color}18` }}>
          {icon}
        </div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="hero-gradient min-h-screen flex items-center section pt-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              AI-Powered Healthcare Platform
            </span>

            <h1 className="text-5xl md:text-6xl font-serif font-normal leading-tight text-gray-900 mb-6">
              AI Powered{' '}
              <span className="gradient-text">Health Monitoring</span>
              <br />at Your Fingertips
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              SwasthSathi continuously monitors vital signs from your wearable devices,
              detects anomalies using advanced AI, and autonomously alerts emergency
              services — keeping you safe 24/7.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/dashboard">
                <Button size="lg">
                  Get Started Free <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { n: '12K+', l: 'Patients Monitored' },
                { n: '99.2%', l: 'Detection Accuracy' },
                { n: '< 3s',  l: 'Response Time' },
                { n: '24/7',  l: 'AI Monitoring' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <div className="text-2xl font-bold font-serif text-rose-500">{n}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="animate-fade-up lg:animate-float" style={{ animationDelay: '150ms' }}>
            <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-rose-100 border border-rose-50 relative">

              {/* Header bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-gray-700">Live Patient Dashboard</span>
                </div>
                <span className="badge-rose text-[11px]">AI Active ✓</span>
              </div>

              {/* Vitals grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <MiniVitalCard icon={<Heart size={14} className="text-rose-500 fill-rose-200" />}   label="Heart Rate"   value="78 bpm"  color="#f43f5e" />
                <MiniVitalCard icon={<Activity size={14} className="text-blue-500" />}               label="SpO2"         value="97%"     color="#3b82f6" delay={50} />
                <MiniVitalCard icon={<Shield size={14} className="text-violet-500" />}               label="Temperature"  value="36.6°C"  color="#8b5cf6" delay={100} />
                <MiniVitalCard icon={<Zap size={14} className="text-amber-500" />}                   label="HRV"          value="45 ms"   color="#f59e0b" delay={150} />
              </div>

              {/* Risk gauge preview */}
              <div className="bg-gradient-to-r from-emerald-50 to-rose-50 rounded-xl p-3 flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-400 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">1.2</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Risk Score: Normal</div>
                  <div className="text-xs text-gray-400">AI confidence: 94% · Cycle #128</div>
                </div>
              </div>

              {/* Status line */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-700">
                  All vitals normal — AI monitoring active
                </span>
              </div>

              {/* Decorative badge */}
              <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                LIVE
              </div>
            </div>

            {/* Floating alert card */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-xl border border-orange-100 flex items-center gap-2 max-w-xs hidden lg:flex">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-base">⚠️</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">Alert Sent</div>
                <div className="text-[10px] text-gray-400">Emergency contact notified · 2s ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
