const steps = [
  {
    number: '01',
    title: 'Connect Wearables',
    description: 'Pair your wearable device or smartwatch with SwasthSathi in under 60 seconds.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-500',
  },
  {
    number: '02',
    title: 'Collect Health Data',
    description: 'HR, SpO₂, Temperature, and HRV are streamed every 3 seconds into the secure cloud.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'bg-purple-500',
    bg: 'bg-purple-50',
    text: 'text-purple-500',
  },
  {
    number: '03',
    title: 'AI Analyzes Vitals',
    description: 'Claude AI computes a multi-signal risk score, detects patterns like HYPOXIC_EVENT or CARDIAC_DISTRESS.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'bg-rose-500',
    bg: 'bg-rose-50',
    text: 'text-rose-500',
  },
  {
    number: '04',
    title: 'Alerts Triggered',
    description: 'When risk exceeds thresholds, the system autonomously escalates through Yellow → Orange → Red tiers.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    color: 'bg-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-500',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            From wearable to{' '}
            <span className="gradient-text">life-saving alert</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Four simple steps — from connecting your device to autonomous emergency response.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-100 z-0 -translate-y-1/2" style={{ width: 'calc(100% - 3rem)', left: '3rem' }} />
              )}

              <div className="card p-6 relative z-10 text-center">
                <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 relative`}>
                  <div className={`${step.text}`}>{step.icon}</div>
                  <div className={`absolute -top-2 -right-2 w-6 h-6 ${step.color} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-[9px] font-black">{idx + 1}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-300 mb-1">{step.number}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
