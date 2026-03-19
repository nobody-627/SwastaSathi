import { useEffect, useMemo, useState } from 'react'
import { useMLStore } from '../../store/mlStore'

export default function PredictionBanner() {
  const { hasNewPrediction, predictions, setHasNewPrediction } = useMLStore()
  const [seconds, setSeconds] = useState(10)

  const top = useMemo(() => (predictions || [])[0], [predictions])
  const acuteCount = useMemo(() => (predictions || []).filter((prediction) => prediction.isAcute).length, [predictions])

  useEffect(() => {
    if (!hasNewPrediction) return
    setSeconds(10)
    const iv = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(iv)
          setHasNewPrediction(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [hasNewPrediction, setHasNewPrediction])

  if (!hasNewPrediction || !top) return null

  const pct = (seconds / 10) * 100

  return (
    <div className={`fixed bottom-6 right-6 w-[340px] bg-white rounded-xl shadow-xl border-l-4 z-[1000] animate-[slidein_.3s_ease] ${acuteCount > 0 ? 'border-red-600' : 'border-rose-500'}`}>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-800">🧬 {predictions.length} surfaced risk{predictions.length > 1 ? 's' : ''}</div>
            <div className="text-[13px] text-rose-600 mt-1">{top.disease} - {top.probability}% probability</div>
            <div className="text-[12px] text-slate-400 font-mono mt-0.5">Confidence: {top.confidence}%</div>
            {acuteCount > 0 && <div className="text-[12px] text-red-600 font-semibold mt-1">Cascade alert: acute condition surfaced</div>}
          </div>
          <button className="text-slate-400" onClick={() => setHasNewPrediction(false)}>x</button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200"
            onClick={() => document.getElementById('ml-prediction-card')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View Details
          </button>
        </div>
      </div>
      <div className="h-1 bg-slate-100 rounded-b-xl overflow-hidden">
        <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
