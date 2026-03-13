// ─────────────────────────────────────────────────────────────
// TrustStrip
// ─────────────────────────────────────────────────────────────
export function TrustStrip() {
  const items = [
    { icon: '⌚', label: 'Wearable Integration' },
    { icon: '🤖', label: 'AI Monitoring' },
    { icon: '🚨', label: 'Emergency Detection' },
    { icon: '📊', label: 'Real-time Analytics' },
    { icon: '🔒', label: 'HIPAA Compliant' },
    { icon: '📱', label: 'Mobile Alerts' },
  ]
  return (
    <div className="bg-white border-y border-rose-50 py-5">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center md:justify-around gap-6">
        {items.map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-semibold text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Features
// ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🧠', title: 'AI Risk Detection', desc: 'Multi-signal pattern recognition assesses combined vitals rather than single thresholds, cutting false alerts by 70%.' },
  { icon: '📡', title: 'Real-time Monitoring', desc: 'Continuous 3-second vital reads from any wearable with instant AI analysis and personalized baseline learning.' },
  { icon: '🚨', title: 'Emergency Alerts', desc: '3-tier autonomous escalation: user notification → emergency contact → emergency services with GPS coordinates.' },
  { icon: '⌚', title: 'Wearable Integration', desc: 'Compatible with Apple Watch, Fitbit, Garmin, and all major medical-grade monitors via open APIs.' },
  { icon: '📈', title: 'Health Analytics', desc: 'Longitudinal trend analysis, weekly reports, deterioration prediction, and risk trajectory forecasting.' },
  { icon: '👨‍⚕️', title: 'Patient Dashboard', desc: 'Explainable AI — every alert includes plain-English reasoning so doctors and patients understand why.' },
]

export function Features() {
  return (
    <section id="features" className="section bg-gradient-to-b from-white to-rose-50/40">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            Platform Features
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Everything for <span className="gradient-text">complete health safety</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            A comprehensive suite of tools designed for patients, caregivers, and healthcare professionals.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} className="card p-7 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                {icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// HowItWorks
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, icon: '⌚', title: 'Connect Wearables',   desc: 'Pair your device in minutes' },
  { n: 2, icon: '📡', title: 'Stream Health Data',  desc: 'Continuous vital streaming' },
  { n: 3, icon: '🧠', title: 'AI Analyzes Vitals',  desc: 'Multi-signal pattern recognition' },
  { n: 4, icon: '🚨', title: 'Alerts Triggered',    desc: 'Tiered autonomous response' },
  { n: 5, icon: '🏥', title: 'Help Arrives',         desc: 'Emergency services dispatched' },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section bg-white">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Wearable to <span className="gradient-text">emergency response</span> in seconds
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-rose-200 via-rose-400 to-rose-200 z-0" />
          {STEPS.map(({ n, icon, title, desc }) => (
            <div key={n} className="flex-1 flex flex-col items-center text-center relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-xl shadow-lg shadow-rose-200 mb-4 hover:scale-110 transition-transform cursor-default">
                {icon}
              </div>
              <div className="absolute -top-2 -right-1 w-5 h-5 bg-white border-2 border-rose-400 rounded-full flex items-center justify-center hidden md:flex">
                <span className="text-[10px] font-bold text-rose-500">{n}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
              <p className="text-xs text-gray-400 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    initials: 'PM', color: '#fde8ed', name: 'Dr. Priya Mehta',
    role: 'Cardiologist, AIIMS Mumbai', rating: 5,
    review: "SwasthSathi detected my patient's cardiac anomaly 3 hours before any symptoms appeared. The explainable AI reasoning was remarkable — I knew exactly what to expect before he arrived.",
  },
  {
    initials: 'RS', color: '#eff6ff', name: 'Raj Sharma',
    role: 'Patient, 67 years', rating: 5,
    review: "My family finally has peace of mind. The AI monitors me 24/7 and my children are notified instantly if anything looks wrong. I feel safer at home than ever before.",
  },
  {
    initials: 'AN', color: '#f0fdf4', name: 'Dr. Anjali Nair',
    role: 'Emergency Medicine, Kokilaben Hospital', rating: 5,
    review: "When we receive a SwasthSathi alert, we already know exactly what we're dealing with — the vitals snapshot, risk score, and AI reasoning arrive before the patient does.",
  },
]

export function Testimonials() {
  return (
    <section className="section bg-gradient-to-b from-rose-50/40 to-white">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
            Trusted by <span className="gradient-text">doctors & patients</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ initials, color, name, role, rating, review }) => (
            <div key={name} className="bg-white rounded-2xl p-7 border border-rose-50 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100/40 transition-all duration-300">
              <div className="flex mb-4">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i} className="text-amber-400 text-sm">{s}</span>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-rose-500 text-sm flex-shrink-0"
                  style={{ background: color }}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{name}</div>
                  <div className="text-xs text-gray-400">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Pricing
// ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Starter', price: '₹499', period: '/mo',
    desc: 'For individuals monitoring personal health',
    features: ['1 wearable device', 'Basic AI monitoring', 'Email alerts', '7-day data history', 'Basic dashboard'],
    cta: 'Get Started',
  },
  {
    name: 'Pro', price: '₹1,499', period: '/mo', popular: true,
    desc: 'For patients with chronic conditions',
    features: ['3 wearable devices', 'Advanced AI + predictions', 'SMS + call alerts', '90-day history', 'Full dashboard + reports', 'Emergency contact alerts', 'Baseline learning'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise', price: 'Custom', period: '',
    desc: 'For hospitals and clinics',
    features: ['Unlimited devices', 'Enterprise AI suite', '24/7 dedicated support', 'Unlimited history', 'Multi-patient dashboard', 'EHR integration', 'Custom integrations', 'SLA guarantee'],
    cta: 'Contact Sales',
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="section bg-white">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map(({ name, price, period, desc, features, cta, popular }) => (
            <div key={name} className={`rounded-2xl p-8 relative transition-all duration-300 hover:-translate-y-2 ${
              popular
                ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-2xl shadow-rose-300'
                : 'bg-white border border-rose-100 shadow-sm hover:shadow-lg hover:shadow-rose-100/50'
            }`}>
              {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-rose-500 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-rose-100">
                  ⭐ Most Popular
                </div>
              )}
              <div className="mb-6">
                <div className={`text-sm font-bold mb-2 ${popular ? 'text-rose-100' : 'text-gray-400'}`}>{name}</div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold font-serif ${popular ? 'text-white' : 'text-gray-900'}`}>{price}</span>
                  <span className={`text-sm ${popular ? 'text-rose-200' : 'text-gray-400'}`}>{period}</span>
                </div>
                <p className={`text-sm mt-2 ${popular ? 'text-rose-100' : 'text-gray-500'}`}>{desc}</p>
              </div>
              <ul className="space-y-2.5 mb-8">
                {features.map(f => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${popular ? 'text-rose-50' : 'text-gray-600'}`}>
                    <span className={popular ? 'text-rose-200' : 'text-emerald-500'}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                popular
                  ? 'bg-white text-rose-600 hover:bg-rose-50 shadow-lg'
                  : 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-200'
              }`}>
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// CTA Banner
// ─────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import Button from './ui/Button'

export function CTA() {
  return (
    <section className="section">
      <div className="container">
        <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
              Protect your health with<br />AI-powered monitoring
            </h2>
            <p className="text-rose-100 text-lg mb-8 max-w-md mx-auto">
              Join 12,000+ patients and healthcare providers who trust SwasthSathi.
            </p>
            <Link to="/dashboard">
              <button className="bg-white text-rose-600 font-bold px-8 py-4 rounded-full text-base shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95">
                Start Monitoring Free →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
import { Heart } from 'lucide-react'

export function Footer() {
  const cols = [
    { title: 'Product',  links: ['Dashboard', 'Features', 'API Docs', 'Integrations', 'Changelog'] },
    { title: 'Company',  links: ['About Us', 'Careers', 'Press', 'Blog', 'Contact'] },
    { title: 'Support',  links: ['Help Center', 'Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Status'] },
  ]
  return (
    <footer className="bg-gray-950 text-gray-400 py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Heart size={14} className="text-white fill-white" />
              </div>
              <span className="text-white text-lg font-bold font-serif">SwasthSathi</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-xs">
              AI-powered health monitoring for patients, caregivers, and healthcare professionals across India.
            </p>
            <div className="flex gap-3">
              {['🐦', '💼', '📘', '📸'].map(icon => (
                <div key={icon} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-sm cursor-pointer hover:bg-gray-700 transition-colors">
                  {icon}
                </div>
              ))}
            </div>
          </div>
          {cols.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-bold text-sm mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-sm hover:text-rose-400 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between gap-3">
          <p className="text-xs">© 2026 SwasthSathi. All rights reserved.</p>
          <p className="text-xs">Made with ❤️ for better health in India</p>
        </div>
      </div>
    </footer>
  )
}
