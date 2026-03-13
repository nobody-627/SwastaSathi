import { useNavigate } from 'react-router-dom'

export default function CTA() {
  const navigate = useNavigate()

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="gradient-card rounded-3xl p-10 lg:p-16 relative overflow-hidden shadow-2xl">
          {/* Decorative blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/5 rounded-full" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Available 24/7
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Protect your health with
              <br />AI-powered monitoring
            </h2>

            <p className="text-rose-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of patients and caregivers who trust SwasthSathi to watch over their health in real time.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/dashboard')}
                className="bg-white text-rose-600 hover:bg-rose-50 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Monitoring
              </button>
              <button onClick={() => navigate('/dashboard')}
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/60 font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Live Demo
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-10">
              {[
                { value: '10,000+', label: 'Active patients' },
                { value: '99.2%',   label: 'Alert accuracy'  },
                { value: '24/7',    label: 'AI monitoring'   },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-rose-200 text-xs font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
