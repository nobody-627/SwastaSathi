function StarRating({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < count ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const testimonials = [
  {
    name: 'Dr. Priya Mehta',
    title: 'Cardiologist, Apollo Hospitals',
    rating: 5,
    review: 'SwasthSathi\'s multi-signal AI detection is far superior to single-threshold alerts. I\'ve recommended it to all my post-cardiac patients. The explainability audit log is exactly what we need for clinical review.',
    initials: 'PM',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    name: 'Rajan Sharma',
    title: 'Patient, Age 67',
    rating: 5,
    review: 'I live alone and this gives me — and my daughter — complete peace of mind. When my heart rate spiked last month, the system alerted Priya before I even realized something was wrong.',
    initials: 'RS',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Dr. Anita Krishnan',
    title: 'Emergency Medicine, AIIMS',
    rating: 5,
    review: 'The 3-tier escalation with cooldowns is brilliantly designed. No alert fatigue, yet no missed emergencies. The AI reasoning behind each decision is transparent and clinically sound.',
    initials: 'AK',
    color: 'bg-emerald-100 text-emerald-600',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-rose-100 text-rose-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Trusted by{' '}
            <span className="gradient-text">doctors & patients</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            See what healthcare professionals and patients say about SwasthSathi.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="card p-6 flex flex-col">
              {/* Quote */}
              <svg className="w-8 h-8 text-rose-200 mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>

              <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-6">{t.review}</p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.title}</p>
                </div>
                <div className="ml-auto">
                  <StarRating count={t.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
