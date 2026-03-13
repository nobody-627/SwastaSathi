const features = [
  {
    icon: (
      <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI Risk Detection',
    description: 'Claude AI continuously analyzes multi-signal vitals patterns to compute a composite risk score every 3 seconds.',
    color: 'bg-rose-50',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real-time Monitoring',
    description: 'Heart Rate, SpO₂, Temperature, and HRV monitored 24/7 through wearable device integration.',
    color: 'bg-blue-50',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Emergency Alerts',
    description: '3-tier escalation system: user notification → emergency contact → 911, all with cooldown management.',
    color: 'bg-red-50',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Wearable Integration',
    description: 'Seamlessly connects with fitness bands, smartwatches, and medical-grade wearable sensors.',
    color: 'bg-purple-50',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Health Analytics',
    description: 'Personalized baseline learning adapts thresholds to your unique body metrics over time.',
    color: 'bg-amber-50',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Patient Dashboard',
    description: 'Full explainability audit log — every AI decision logged with plain-English reasoning and timestamps.',
    color: 'bg-emerald-50',
  },
]

export function FeatureCard({ feature }) {
  return (
    <div className="card p-6 group">
      <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
        {feature.icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
    </div>
  )
}

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Built for{' '}
            <span className="gradient-text">life-critical monitoring</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Every feature is designed to close the gap between physiological deterioration and clinical response.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  )
}
