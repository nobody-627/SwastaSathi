import { useEffect, useMemo, useState } from 'react'
import { useMLStore } from '../../store/mlStore'

const ICONS = {
  hypertension: '🩺',
  type2_diabetes: '🩸',
  cardiovascular: '🫀',
  respiratory: '🫁',
  stress_disorder: '🧠',
  sleep_apnea: '😴',
  metabolic_syndrome: '⚖️',
  atrial_fibrillation: '💗',
  coronary_artery_disease: '🫀',
  heart_failure: '❤️',
  chronic_obstructive_pulmonary_disease: '🌬️',
  major_depressive_disorder: '🌧️',
  generalized_anxiety_disorder: '😟',
  burnout_syndrome: '🪫',
}

const RISK_STYLES = {
  CRITICAL: { box: 'bg-red-50 border-red-300 text-red-900', bar: 'linear-gradient(90deg,#fca5a5,#ef4444)' },
  HIGH: { box: 'bg-orange-50 border-orange-300 text-orange-900', bar: 'linear-gradient(90deg,#fdba74,#ea580c)' },
  MODERATE: { box: 'bg-yellow-50 border-yellow-300 text-yellow-900', bar: 'linear-gradient(90deg,#fde047,#eab308)' },
  LOW: { box: 'bg-green-50 border-green-300 text-green-900', bar: 'linear-gradient(90deg,#86efac,#22c55e)' },
  MINIMAL: { box: 'bg-emerald-50 border-emerald-300 text-emerald-900', bar: 'linear-gradient(90deg,#a7f3d0,#10b981)' },
}

function Trend({ value }) {
  if (value === 'increasing' || value === 'up') return <span className="text-rose-500">↑</span>
  if (value === 'decreasing' || value === 'down') return <span className="text-emerald-500">↓</span>
  return <span className="text-slate-400">→</span>
}

export default function PredictionCard() {
  const { predictions, suppressedList, recordsAnalyzed, dataQuality, lastUpdated, reasoning, status, filterTrace } = useMLStore()
  const [openRows, setOpenRows] = useState({})
  const [ageSec, setAgeSec] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => {
      if (!lastUpdated) return
      setAgeSec(Math.max(0, Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000)))
    }, 1000)
    return () => clearInterval(iv)
  }, [lastUpdated])

  const progress = Math.min(100, Math.round((recordsAnalyzed / 20) * 100))
  const waitSecs = Math.max(0, Math.ceil((20 - recordsAnalyzed) * 3))
  const hasPredictions = predictions.length > 0
  const acuteCount = predictions.filter((prediction) => prediction.isAcute).length
  const cascadeRisk = predictions.some((prediction) => prediction.requiresImmediateCare)

  const dq = useMemo(() => dataQuality || { score: 0, issues: [] }, [dataQuality])

  return (
    <div id="ml-prediction-card" className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-bold text-slate-800">🧬 Disease Risk Predictions</div>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: '#fdf4ff', color: '#7e22ce' }}>
          ML Powered
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span>Data Quality</span>
          <span>{dq.score || 0}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-300 to-rose-500 transition-all duration-700" style={{ width: `${dq.score || 0}%` }} />
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Analyzing {recordsAnalyzed} records</div>
      </div>

      {recordsAnalyzed < 20 && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 mb-3">
          <div className="text-sm font-semibold text-rose-700">Building health pattern... {recordsAnalyzed}/20 records</div>
          <div className="h-2 bg-white rounded-full overflow-hidden mt-2">
            <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#fda4af,#f43f5e)' }} />
          </div>
          <div className="text-xs text-rose-500 mt-1">Predictions available in about {waitSecs} seconds</div>
        </div>
      )}

      {recordsAnalyzed >= 20 && !hasPredictions && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 mb-3">
          <div className="text-sm font-semibold text-emerald-700">✅ No high-risk patterns detected</div>
          <div className="text-xs text-emerald-600 mt-1">All monitored health parameters are within safe ranges.</div>
        </div>
      )}

      {hasPredictions && (
        <div className="space-y-3">
          {cascadeRisk && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              Cascade risk detected. One or more surfaced conditions need immediate review.
            </div>
          )}

          {predictions.map((p, idx) => {
            const style = RISK_STYLES[p.riskLevel] || RISK_STYLES.MINIMAL
            const open = !!openRows[idx]
            return (
              <div key={`${p.diseaseKey}-${idx}`} className={`rounded-xl border p-3 ${style.box}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{ICONS[p.diseaseKey] || '🧬'} {p.disease}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">{p.category}</span>
                      {p.medicationConfirmed && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Medication match</span>}
                      {p.isAcute && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">Acute</span>}
                    </div>
                  </div>
                  <div className="text-xs font-bold flex items-center gap-1">{p.riskLevel} <Trend value={p.trend} /></div>
                </div>
                <div className="h-2 bg-white/70 rounded-full overflow-hidden mt-2">
                  <div className="h-full transition-all duration-[1200ms]" style={{ width: `${p.probability}%`, background: style.bar }} />
                </div>
                <div className="mt-1 text-xs flex items-center justify-between">
                  <span>{p.probability}% probability</span>
                  <span className={`font-mono text-[11px] ${p.confidence >= 90 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    Confidence: {p.confidence}%
                  </span>
                </div>

                {!!p.whyShown?.length && (
                  <div className="mt-2 text-[11px] text-slate-600">
                    Why shown: {p.whyShown.join(', ')}
                  </div>
                )}
                {p.description && <div className="mt-1 text-[12px] text-slate-600">{p.description}</div>}

                <button
                  className="mt-2 text-xs font-semibold text-rose-600"
                  onClick={() => setOpenRows((s) => ({ ...s, [idx]: !open }))}
                >
                  {open ? 'Hide' : 'View'} Recommendations
                </button>

                {open && (
                  <div className="mt-2 space-y-2">
                    <div className="text-[13px] text-slate-700">
                      {(p.contributing_factors || []).map((f) => <div key={f}>▸ {f}</div>)}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(p.recommendations || []).map((r) => (
                        <span key={r} className="text-[11px] px-2 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!!suppressedList.length && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-semibold text-slate-700">Suppressed lower-priority signals</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suppressedList.slice(0, 6).map((item) => (
              <span key={`${item.disease}-${item.suppressedReason}`} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
                {item.disease.replaceAll('_', ' ')} {item.probability}%
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <div>Last analyzed: {lastUpdated ? `${ageSec}s ago` : 'never'}</div>
        <div>Based on {recordsAnalyzed} health records · {Object.keys(useMLStore.getState().allScores || {}).length ? 50 : 0} features</div>
        {acuteCount > 0 && <div>{acuteCount} acute prediction{acuteCount > 1 ? 's' : ''} surfaced</div>}
        {filterTrace?.length > 0 && <div>Smart filter trace entries: {filterTrace.length}</div>}
        {reasoning && <div className="italic mt-1">{reasoning}</div>}
        {status?.isReady === false && <div className="mt-1">Model status: warming up</div>}
      </div>
    </div>
  )
}
