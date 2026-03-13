export function RiskScoreCard({ score = 28 }) {
  const r = 52, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r
  const arc = circumference * 0.75
  const filled = arc * (score / 100)

  const color = score < 40 ? '#10b981' : score < 70 ? '#f59e0b' : '#ef4444'
  const label = score < 40 ? 'Low Risk' : score < 70 ? 'Moderate' : 'High Risk'
  const badgeClass = score < 40
    ? 'bg-emerald-100 text-emerald-700'
    : score < 70
    ? 'bg-amber-100 text-amber-700'
    : 'bg-rose-100 text-rose-700'

  return (
    <div className="card p-5 flex flex-col items-center text-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Risk Score</p>

      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="-rotate-[135deg] w-full h-full">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6"
            strokeWidth="10" strokeDasharray={`${arc} ${circumference}`} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
            strokeWidth="10" strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-900">{score}</span>
          <span className="text-[10px] text-gray-400 font-semibold">/100</span>
        </div>
      </div>

      <span className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>

      <p className="text-xs text-gray-400 mt-2">Updated 3s ago</p>
    </div>
  )
}
