import { useNavigate } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/month',
    description: 'Perfect for individuals monitoring personal health metrics.',
    features: [
      '1 patient profile',
      'HR, SpO₂ monitoring',
      'Basic AI risk scoring',
      'Email alerts',
      '7-day audit log',
      'Community support',
    ],
    missing: ['Emergency escalation', 'HRV monitoring', 'Custom baselines'],
    cta: 'Get Started Free',
    highlighted: false,
    badge: null,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    description: 'For patients who need 24/7 autonomous monitoring with full AI integration.',
    features: [
      '3 patient profiles',
      'All 4 vitals (HR, SpO₂, Temp, HRV)',
      'Full Claude AI reasoning',
      '3-Tier emergency escalation',
      'Emergency contact SMS',
      'Unlimited audit log + CSV export',
      'Personalized baseline learning',
      'Priority support',
    ],
    missing: [],
    cta: 'Start 14-Day Free Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: '₹2,999',
    period: '/month',
    description: 'For clinics, hospitals, and care facilities managing multiple patients.',
    features: [
      'Unlimited patient profiles',
      'Multi-device wearable support',
      'Custom AI models & thresholds',
      'Hospital-grade escalation',
      'HIPAA compliance tools',
      'EHR/EMR integration',
      'Custom audit reporting',
      'Dedicated account manager',
      '24/7 concierge support',
    ],
    missing: [],
    cta: 'Contact Sales',
    highlighted: false,
    badge: null,
  },
]

function Check() {
  return (
    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Simple,{' '}
            <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map(plan => (
            <div key={plan.name}
              className={`rounded-2xl border-2 ${plan.highlighted
                ? 'border-rose-400 bg-white shadow-2xl shadow-rose-100 relative'
                : 'border-gray-100 bg-white shadow-card'} overflow-hidden`}>
              {plan.badge && (
                <div className="absolute top-0 inset-x-0 text-center">
                  <span className="inline-block gradient-card text-white text-xs font-bold px-4 py-1 rounded-b-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`p-6 ${plan.badge ? 'pt-9' : ''}`}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{plan.description}</p>

                <div className="mb-6 flex items-end gap-1">
                  <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-400 pb-1">{plan.period}</span>
                </div>

                <button
                  onClick={() => navigate('/dashboard')}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${plan.highlighted
                    ? 'btn-primary'
                    : 'bg-gray-50 hover:bg-rose-50 text-gray-700 hover:text-rose-600 border border-gray-200 hover:border-rose-200'}`}>
                  {plan.cta}
                </button>
              </div>

              <div className="px-6 pb-6 space-y-2.5">
                <div className="border-t border-gray-100 pt-4 mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">What's included</p>
                </div>
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check />
                    <span className="text-sm text-gray-600">{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Cross />
                    <span className="text-sm text-gray-400">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          All plans include 256-bit encryption and secure cloud storage. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
