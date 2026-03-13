import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  LineChart, Line, RadialBarChart, RadialBar,
  ResponsiveContainer, Tooltip, ReferenceLine
} from "recharts"

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are SwastaSathi AI — an autonomous clinical escalation agent.
You analyze real-time patient vital signs and make risk assessments.
You MUST respond with ONLY a valid JSON object. No preamble, no explanation outside the JSON.

Respond with this exact JSON structure:
{
  "risk_score": <number 0.0-10.0>,
  "pattern": <"NORMAL"|"ELEVATED"|"CONCERNING"|"CARDIAC_DISTRESS"|"HYPOXIC_EVENT"|"STRESS_RESPONSE"|"CRITICAL">,
  "confidence": <integer 0-100>,
  "action": <"NONE"|"YELLOW_ALERT"|"ORANGE_ALERT"|"RED_ALERT">,
  "reasoning": <string: 1-3 plain English sentences explaining your reasoning>,
  "weights": { "hr": <0-1>, "spo2": <0-1>, "temp": <0-1>, "hrv": <0-1> }
}

Risk scoring rules:
- Single mild deviation: 2-4
- Single clear deviation: 4-6
- Multiple deviations or worsening trend: 6-8
- Critical multi-vital failure: 8-10
- Always consider trend: rising vitals score 1 point higher than stable equivalent
- HRV below 15ms combined with HR above 120: always score >= 8.0
- SpO2 below 90%: always score >= 8.0
`

const TIER_COLORS = {
  NORMAL:           { border: '#00F5FF', bg: 'rgba(0,245,255,0.05)',   text: '#00F5FF', label: 'NORMAL'       },
  ELEVATED:         { border: '#FFB800', bg: 'rgba(255,184,0,0.08)',   text: '#FFB800', label: 'ELEVATED'     },
  CONCERNING:       { border: '#FF6B35', bg: 'rgba(255,107,53,0.08)', text: '#FF6B35', label: 'CONCERNING'   },
  CARDIAC_DISTRESS: { border: '#FF2D6B', bg: 'rgba(255,45,107,0.10)', text: '#FF2D6B', label: 'CARDIAC 💗'   },
  HYPOXIC_EVENT:    { border: '#FF2D6B', bg: 'rgba(255,45,107,0.10)', text: '#FF2D6B', label: 'HYPOXIC 🫁'   },
  STRESS_RESPONSE:  { border: '#FFB800', bg: 'rgba(255,184,0,0.06)',  text: '#FFB800', label: 'STRESS ⚡'    },
  CRITICAL:         { border: '#FF2D6B', bg: 'rgba(255,45,107,0.15)', text: '#FF2D6B', label: 'CRITICAL 🔴'  },
}

const getVitalColor = (vital, value) => {
  if (vital === 'hr')   return value > 120 || value < 50   ? '#FF2D6B' : value > 100 ? '#FFB800' : '#00E5A0'
  if (vital === 'spo2') return value < 90                  ? '#FF2D6B' : value < 95  ? '#FFB800' : '#00F5FF'
  if (vital === 'temp') return value > 38 || value < 35.5  ? '#FF2D6B' : value > 37.2 ? '#FFB800' : '#7C3AED'
  if (vital === 'hrv')  return value < 15 || value > 90    ? '#FF2D6B' : value < 20  ? '#FFB800' : '#FFB800'
  return '#00F5FF'
}

const gaugeColor = (score) =>
  score >= 8 ? '#FF2D6B' : score >= 6 ? '#FF6B35' : score >= 4 ? '#FFB800' : '#00E5A0'

// ─── DATA FUNCTIONS ───────────────────────────────────────────────────────────

const defaultBaseline = { hr: 72, spo2: 97, temp: 36.6, hrv: 45 }

const generateVital = (baseline, anomalyMode) => {
  const noise = (range) => (Math.random() - 0.5) * range
  if (!anomalyMode) {
    return {
      hr:   Math.round(baseline.hr   + noise(8)),
      spo2: Math.round((baseline.spo2 + noise(2)) * 10) / 10,
      temp: Math.round((baseline.temp + noise(0.4)) * 10) / 10,
      hrv:  Math.round(baseline.hrv  + noise(10)),
      timestamp: Date.now()
    }
  }
  if (anomalyMode === 'cardiac') {
    return { hr: Math.round(130 + noise(15)), spo2: Math.round((93 + noise(2)) * 10) / 10,
             temp: Math.round((37.1 + noise(0.3)) * 10) / 10, hrv: Math.round(10 + noise(4)), timestamp: Date.now() }
  }
  if (anomalyMode === 'hypoxic') {
    return { hr: Math.round(120 + noise(12)), spo2: Math.round((87 + noise(3)) * 10) / 10,
             temp: Math.round((37.3 + noise(0.2)) * 10) / 10, hrv: Math.round(11 + noise(3)), timestamp: Date.now() }
  }
  if (anomalyMode === 'stress') {
    return { hr: Math.round(105 + noise(10)), spo2: Math.round((94 + noise(2)) * 10) / 10,
             temp: Math.round((37.2 + noise(0.3)) * 10) / 10, hrv: Math.round(17 + noise(5)), timestamp: Date.now() }
  }
}

const updateBaseline = (readings) => {
  if (readings.length < 5) return defaultBaseline
  const last20 = readings.slice(-20)
  return {
    hr:   last20.reduce((s, r) => s + r.hr,   0) / last20.length,
    spo2: last20.reduce((s, r) => s + r.spo2, 0) / last20.length,
    temp: last20.reduce((s, r) => s + r.temp, 0) / last20.length,
    hrv:  last20.reduce((s, r) => s + r.hrv,  0) / last20.length,
  }
}

const calcTrend = (readings, key) => {
  if (readings.length < 5) return 'stable'
  const last5 = readings.slice(-5).map(r => r[key])
  const first = last5[0], last = last5[last5.length - 1]
  const delta = ((last - first) / first) * 100
  if (delta > 5)  return 'rising'
  if (delta < -5) return 'falling'
  return 'stable'
}

const buildPrompt = (reading, baseline, trends, history, cycleNum) => {
  return `Patient vital reading #${cycleNum}:
Current: HR=${reading.hr}bpm, SpO2=${reading.spo2}%, Temp=${reading.temp}°C, HRV=${reading.hrv}ms
Personal baseline: HR=${baseline.hr.toFixed(1)}bpm, SpO2=${baseline.spo2.toFixed(1)}%, Temp=${baseline.temp.toFixed(1)}°C, HRV=${baseline.hrv.toFixed(1)}ms
Deviations from baseline: HR=${(reading.hr - baseline.hr).toFixed(1)}, SpO2=${(reading.spo2 - baseline.spo2).toFixed(1)}%, Temp=${(reading.temp - baseline.temp).toFixed(1)}, HRV=${(reading.hrv - baseline.hrv).toFixed(1)}ms
60-second trends: HR=${trends.hr}, SpO2=${trends.spo2}, Temp=${trends.temp}, HRV=${trends.hrv}
Last risk score: ${history.lastRisk} | Last pattern: ${history.lastPattern}
Assess this reading and respond with JSON only.`
}

const callClaudeAPI = async (prompt) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }]
      })
    })
    const data = await response.json()
    const text = data.content.map(b => b.text || "").join("")
    const clean = text.replace(/```json|```/g, "").trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error("SwastaSathi API error:", err)
    return null
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SwastaSathiDashboard() {
  const navigate = useNavigate()
  // State declarations
  const [readings, setReadings]   = useState([])
  const [baseline, setBaseline]   = useState(defaultBaseline)
  const [agent, setAgent]         = useState({
    status: 'CALIBRATING',
    cycle: 0,
    riskScore: 0,
    pattern: 'NORMAL',
    confidence: 0,
    reasoning: 'Initializing SwastaSathi agent...',
    weights: { hr: 0.30, spo2: 0.35, temp: 0.15, hrv: 0.20 },
    action: 'NONE',
    lastCallMs: 0
  })
  const [escalation, setEscalation] = useState({
    tier1: { armed: true, cooldownUntil: 0, firedCount: 0 },
    tier2: { armed: true, cooldownUntil: 0, firedCount: 0 },
    tier3: { armed: true, cooldownUntil: 0, firedCount: 0 },
  })
  const [auditLog, setAuditLog]     = useState([])
  const [anomalyMode, setAnomalyMode] = useState(null)
  const [isRunning, setIsRunning]   = useState(true)
  const [logFilter, setLogFilter]   = useState('ALL')
  const [showOverlay, setShowOverlay] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [expandedEntry, setExpandedEntry] = useState(null)

  const cycleRef      = useRef(0)
  const lastRiskRef   = useRef({ lastRisk: 0, lastPattern: 'NORMAL' })
  const logContainerRef = useRef(null)
  const streamIntervalRef = useRef(null)

  // ─── Handler Functions ───────────────────────────────────────────────────

  const handleEscalation = useCallback((result) => {
    const now = Date.now()
    setEscalation(prev => {
      const next = { ...prev }
      if (result.risk_score >= 4.0 && result.action === 'YELLOW_ALERT' && now > prev.tier1.cooldownUntil) {
        next.tier1 = { armed: false, cooldownUntil: now + 300000, firedCount: prev.tier1.firedCount + 1 }
      }
      if (result.risk_score >= 6.0 && result.action === 'ORANGE_ALERT' && now > prev.tier2.cooldownUntil) {
        next.tier2 = { armed: false, cooldownUntil: now + 600000, firedCount: prev.tier2.firedCount + 1 }
      }
      if (result.risk_score >= 8.0 && result.action === 'RED_ALERT' && now > prev.tier3.cooldownUntil) {
        next.tier3 = { armed: false, cooldownUntil: now + 60000, firedCount: prev.tier3.firedCount + 1 }
        setShowOverlay(true)
      }
      return next
    })
  }, [])

  const addLogEntry = useCallback((result, reading) => {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      reading: { ...reading },
      riskScore: result.risk_score,
      pattern: result.pattern,
      confidence: result.confidence,
      action: result.action,
      reasoning: result.reasoning,
      tier: result.risk_score >= 8 ? 'CRITICAL' :
            result.risk_score >= 6 ? 'ORANGE' :
            result.risk_score >= 4 ? 'WARN' : 'NORMAL',
    }
    setAuditLog(prev => [entry, ...prev].slice(0, 200))
  }, [])

  const streamText = useCallback((text) => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
    setStreamingText('')
    let i = 0
    streamIntervalRef.current = setInterval(() => {
      if (i < text.length) {
        setStreamingText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(streamIntervalRef.current)
      }
    }, 15)
  }, [])

  const exportCSV = useCallback(() => {
    const headers = ['timestamp', 'hr', 'spo2', 'temp', 'hrv', 'risk_score', 'pattern', 'confidence', 'action', 'reasoning']
    const rows = auditLog.map(e =>
      [e.timestamp, e.reading.hr, e.reading.spo2, e.reading.temp, e.reading.hrv,
       e.riskScore, e.pattern, e.confidence, e.action, `"${e.reasoning}"`].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'swastasathi_audit.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [auditLog])

  const timeAgo = (ms) => {
    const diff = Date.now() - ms
    if (diff < 5000)  return 'just now'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    return `${Math.floor(diff / 60000)}m ago`
  }

  // ─── Main Agent Loop ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(async () => {
      cycleRef.current += 1

      const newReading = generateVital(baseline, anomalyMode)

      setReadings(prev => {
        const next = [...prev.slice(-59), newReading]
        const newBaseline = updateBaseline(next)
        setBaseline(newBaseline)
        return next
      })

      const trends = {
        hr:   calcTrend(readings, 'hr'),
        spo2: calcTrend(readings, 'spo2'),
        temp: calcTrend(readings, 'temp'),
        hrv:  calcTrend(readings, 'hrv'),
      }

      if (cycleRef.current >= 3) {
        setAgent(prev => ({ ...prev, status: 'ASSESSING' }))
        const prompt = buildPrompt(newReading, baseline, trends, lastRiskRef.current, cycleRef.current)
        const result = await callClaudeAPI(prompt)
        if (result) {
          lastRiskRef.current = { lastRisk: result.risk_score, lastPattern: result.pattern }
          setAgent({
            status: result.action !== 'NONE' ? 'ALERTING' : 'MONITORING',
            cycle: cycleRef.current,
            riskScore: result.risk_score,
            pattern: result.pattern,
            confidence: result.confidence,
            reasoning: result.reasoning,
            weights: result.weights,
            action: result.action,
            lastCallMs: Date.now()
          })
          handleEscalation(result)
          addLogEntry(result, newReading)
          streamText(result.reasoning)
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isRunning, anomalyMode])

  // ─── Derived Values ───────────────────────────────────────────────────────

  const currentReading = readings[readings.length - 1] || { hr: 72, spo2: 97, temp: 36.6, hrv: 45 }
  const calibrated     = readings.length >= 20
  const calibProgress  = Math.min((readings.length / 20) * 100, 100)

  const filteredLog = auditLog.filter(e => {
    if (logFilter === 'ALL')      return true
    if (logFilter === 'WARN')     return e.tier === 'WARN'
    if (logFilter === 'ALERT')    return e.tier === 'ORANGE'
    if (logFilter === 'CRITICAL') return e.tier === 'CRITICAL'
    return true
  })

  const getVitalStatus = (vital, value) => {
    if (vital === 'hr')   return value > 120 || value < 50   ? 'critical' : value > 100 ? 'warning' : 'normal'
    if (vital === 'spo2') return value < 90                  ? 'critical' : value < 95  ? 'warning' : 'normal'
    if (vital === 'temp') return value > 38 || value < 35.5  ? 'critical' : value > 37.2 ? 'warning' : 'normal'
    if (vital === 'hrv')  return value < 15 || value > 90    ? 'critical' : value < 20  ? 'warning' : 'normal'
    return 'normal'
  }

  const getTrendArrow = (vital) => {
    const trend = calcTrend(readings, vital)
    if (trend === 'rising')  return '↑'
    if (trend === 'falling') return '↓'
    return '→'
  }

  const getCooldownLabel = (tier) => {
    const now = Date.now()
    if (tier.cooldownUntil <= now) return 'ARMED'
    const secs = Math.ceil((tier.cooldownUntil - now) / 1000)
    return `COOLDOWN: ${secs}s`
  }

  // ─── UI helpers ───────────────────────────────────────────────────────────

  const statusToTone = (status) => {
    if (status === 'critical') return { ring: 'ring-rose-200', border: 'border-rose-200', bg: 'bg-rose-50/60', text: 'text-rose-600' }
    if (status === 'warning')  return { ring: 'ring-amber-200', border: 'border-amber-200', bg: 'bg-amber-50/60', text: 'text-amber-600' }
    return { ring: 'ring-gray-100', border: 'border-gray-100', bg: 'bg-white', text: 'text-emerald-600' }
  }

  // ─── Sub-Components ───────────────────────────────────────────────────────

  const VitalCard = ({ label, vital, value, unit, icon }) => {
    const status  = getVitalStatus(vital, value)
    const color   = getVitalColor(vital, value)
    const sparkData = readings.slice(-30).map((r, i) => ({ i, v: r[vital] }))
    const trend   = getTrendArrow(vital)
    const deviation = (value - baseline[vital]).toFixed(1)
    const devLabel  = deviation > 0 ? `+${deviation}` : `${deviation}`

    const tone = statusToTone(status)

    return (
      <div className={`relative card p-5 flex-1 ${tone.bg} border ${tone.border} ring-1 ${tone.ring}`}>
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{icon} {label}</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl sm:text-4xl font-black" style={{ color }}>{value}</span>
          <span className="text-sm text-gray-400 font-medium pb-1">{unit}</span>
          <span className="pb-1 ml-auto text-xs font-semibold text-gray-400">
            <span className={trend === '↑' ? 'text-amber-500' : trend === '↓' ? 'text-rose-500' : 'text-gray-400'}>
              {trend}
            </span>
            <span className="ml-2">{devLabel}</span>
          </span>
        </div>

        <div className="h-12 mt-3">
          {sparkData.length > 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
                <ReferenceLine y={baseline[vital]} stroke="rgba(17,24,39,0.10)" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    )
  }

  const RiskGauge = () => {
    const score = agent.riskScore
    const gColor = gaugeColor(score)
    const tc = TIER_COLORS[agent.pattern] || TIER_COLORS.NORMAL

    return (
      <div className="text-center py-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Risk Score</p>

        <div className="relative inline-block" style={{ color: gColor }}>
          <RadialBarChart width={230} height={230}
            cx={115} cy={115} innerRadius={75} outerRadius={105}
            data={[{ name: 'bg', value: 10, fill: 'rgba(17,24,39,0.06)' }, { name: 'risk', value: score, fill: gColor }]}
            startAngle={200} endAngle={-20}>
            <RadialBar dataKey="value" cornerRadius={6} />
          </RadialBarChart>

          {/* Center overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-black" style={{ color: gColor }}>{score.toFixed(1)}</div>
            <div className="text-[11px] font-semibold mt-1" style={{ color: tc.text }}>{tc.label}</div>
            <div className="text-xs text-gray-400 mt-1">{agent.confidence}% confidence</div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="bg-gray-100 rounded-full h-1 mt-3 mx-6">
          <div className="h-1 rounded-full transition-[width] duration-500" style={{ width: `${agent.confidence}%`, background: gColor }} />
        </div>
      </div>
    )
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  const agentStatusColors = {
    CALIBRATING: '#FFB800',
    MONITORING:  '#00E5A0',
    ASSESSING:   '#00F5FF',
    ALERTING:    '#FF6B35',
    EMERGENCY:   '#FF2D6B',
  }
  const agentBadgeColor = agentStatusColors[agent.status] || '#64748B'
  const isCritical = agent.riskScore >= 8

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header (matches DashboardPreview vibe) */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="btn-secondary text-xs px-4 py-2">
                ← Home
              </button>
              <div className="w-10 h-10 gradient-card rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">SwastaSathi Monitor</p>
                <p className="text-xs text-gray-400">Patient: Ramesh, 64 · Active Session</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                LIVE
              </div>
              <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: agentBadgeColor }} />
                {agent.status}
              </span>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Agent status</p>
              <div className="space-y-2">
                {[
                  { label: 'State',   value: agent.status,  color: agentBadgeColor },
                  { label: 'Cycle',   value: `#${agent.cycle}`, color: '#111827' },
                  { label: 'Last AI', value: agent.lastCallMs ? timeAgo(agent.lastCallMs) : '—', color: '#6B7280' },
                  { label: 'Pattern', value: (TIER_COLORS[agent.pattern] || TIER_COLORS.NORMAL).label, color: (TIER_COLORS[agent.pattern] || TIER_COLORS.NORMAL).text },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">{item.label}</span>
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-[width] duration-300 bg-rose-500" style={{ width: `${calibProgress}%` }} />
                </div>
                <p className={`text-xs font-semibold mt-2 ${calibrated ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {calibrated ? '✓ Calibrated' : `Calibrating (${readings.length}/20)`}
                </p>
              </div>
            </div>

            <div className="card p-5">
              <RiskGauge />
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Escalation status</p>
              <div className="space-y-3">
                {[
                  { label: 'Tier 1 — Yellow', desc: 'User notification', tier: escalation.tier1, color: '#f59e0b', risk: '4.0–5.9' },
                  { label: 'Tier 2 — Orange', desc: 'Emergency contact', tier: escalation.tier2, color: '#fb923c', risk: '6.0–7.9' },
                  { label: 'Tier 3 — Red',    desc: 'Emergency services', tier: escalation.tier3, color: '#ef4444', risk: '≥ 8.0'   },
                ].map((t) => (
                  <div key={t.label} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold" style={{ color: t.color }}>{t.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.desc} · Risk {t.risk} · Fired: {t.tier.firedCount}×</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${t.tier.cooldownUntil > Date.now() ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {getCooldownLabel(t.tier)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal baseline</p>
              <div className="space-y-2">
                {[
                  { label: 'Heart Rate', key: 'hr',   unit: 'bpm' },
                  { label: 'SpO2',       key: 'spo2', unit: '%'   },
                  { label: 'Temp',       key: 'temp', unit: '°C'  },
                  { label: 'HRV',        key: 'hrv',  unit: 'ms'  },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">{item.label}</span>
                    <span className="text-xs font-bold text-gray-900">{baseline[item.key].toFixed(1)} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Demo controls</p>
              <div className="space-y-2">
                {[
                  { label: 'Inject: Cardiac Distress', mode: 'cardiac' },
                  { label: 'Inject: Hypoxic Event',    mode: 'hypoxic' },
                  { label: 'Inject: Stress Pattern',   mode: 'stress'  },
                  { label: 'Reset to Normal',          mode: null      },
                ].map(btn => (
                  <button
                    key={btn.label}
                    onClick={() => setAnomalyMode(btn.mode)}
                    className={`w-full text-left btn-secondary text-xs px-4 py-2 ${anomalyMode === btn.mode ? 'ring-2 ring-rose-200' : ''}`}
                  >
                    {btn.label}
                  </button>
                ))}
                <button
                  onClick={() => setIsRunning(p => !p)}
                  className={`w-full text-left text-xs px-4 py-2 rounded-xl font-semibold transition-all duration-200 border-2 ${
                    isRunning
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  {isRunning ? 'Pause Monitoring' : 'Resume Monitoring'}
                </button>
              </div>
            </div>
          </aside>

          {/* Center content */}
          <main className="lg:col-span-6 space-y-4 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <VitalCard label="Heart Rate"   vital="hr"   value={currentReading.hr}   unit="bpm" icon="💗" />
              <VitalCard label="Blood Oxygen" vital="spo2" value={currentReading.spo2} unit="%"   icon="🫁" />
              <VitalCard label="Temperature"  vital="temp" value={currentReading.temp} unit="°C"  icon="🌡" />
              <VitalCard label="HRV"          vital="hrv"  value={currentReading.hrv}  unit="ms"  icon="⚡" />
            </div>

            <div className="card p-6 border border-rose-100">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Agent reasoning</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {(TIER_COLORS[agent.pattern] || TIER_COLORS.NORMAL).label}
                    <span className="text-gray-400 font-semibold"> · </span>
                    <span style={{ color: gaugeColor(agent.riskScore) }}>{agent.riskScore.toFixed(1)}/10</span>
                    <span className="text-gray-400 font-semibold"> · </span>
                    <span className="text-gray-500">{agent.confidence}% confidence</span>
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${agent.action !== 'NONE' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {agent.action}
                </span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed min-h-[44px]">
                {streamingText || agent.reasoning}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {Object.entries(agent.weights || {}).map(([key, val]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{key.toUpperCase()}</span>
                      <span className="text-xs font-bold text-gray-700">×{val?.toFixed(2)}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-1 mt-2">
                      <div
                        className="h-1 rounded-full transition-[width] duration-500"
                        style={{ width: `${(val || 0) * 100}%`, background: getVitalColor(key, currentReading[key]) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { vital: 'hr',   label: 'HR',   unit: 'bpm', color: '#10b981' },
                { vital: 'spo2', label: 'SpO2', unit: '%',   color: '#0ea5e9' },
                { vital: 'temp', label: 'Temp', unit: '°C',  color: '#7c3aed' },
                { vital: 'hrv',  label: 'HRV',  unit: 'ms',  color: '#f59e0b' },
              ].map(({ vital, label, unit, color }) => (
                <div key={vital} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-bold" style={{ color }}>{currentReading[vital]} {unit}</p>
                  </div>
                  <div className="h-16">
                    {readings.length > 1 && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={readings.slice(-30).map((r, i) => ({ i, v: r[vital] }))}>
                          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
                          <ReferenceLine y={baseline[vital]} stroke="rgba(17,24,39,0.10)" strokeDasharray="2 2" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {readings.length === 0 && (
              <div className="card p-6 flex items-center justify-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-600">Agent initializing…</span>
              </div>
            )}

            {showOverlay && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 max-w-xl w-full">
                  <p className="text-sm font-semibold text-rose-600 uppercase tracking-wider mb-2">Critical alert</p>
                  <p className="text-2xl font-extrabold text-gray-900 mb-3">
                    Emergency escalation triggered
                  </p>
                  <p className="text-sm text-gray-600 mb-5">
                    {(TIER_COLORS[agent.pattern] || TIER_COLORS.NORMAL).label} · Risk: {agent.riskScore.toFixed(1)}/10 · {agent.confidence}% confidence
                  </p>
                  <div className="space-y-2 mb-5">
                    {[
                      'Emergency services mock-notified',
                      'Emergency contact SMS sent with vitals snapshot',
                      'Location transmitted to responders',
                    ].map(line => (
                      <div key={line} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {line}
                      </div>
                    ))}
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed mb-5">
                    {agent.reasoning}
                  </div>
                  <button className="btn-primary w-full justify-center" onClick={() => setShowOverlay(false)}>
                    I'm okay — false alarm
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Right panel */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Audit log</p>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                    {auditLog.length} events
                  </span>
                </div>
                <button onClick={exportCSV} className="btn-secondary text-xs px-3 py-1.5">Export CSV</button>
              </div>

              <div className="grid grid-cols-4 border-b border-gray-100">
                {['ALL', 'WARN', 'ALERT', 'CRITICAL'].map(f => (
                  <button
                    key={f}
                    onClick={() => setLogFilter(f)}
                    className={`py-2 text-[10px] font-semibold tracking-wider ${
                      logFilter === f ? 'text-rose-600 border-b-2 border-rose-500 bg-rose-50/40' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div ref={logContainerRef} className="max-h-[calc(100vh-18rem)] overflow-y-auto">
                {filteredLog.length === 0 && (
                  <div className="p-6 text-center text-sm text-gray-400">No events yet…</div>
                )}
                {filteredLog.map(entry => {
                  const tc = TIER_COLORS[entry.pattern] || TIER_COLORS.NORMAL
                  const isExpanded = expandedEntry === entry.id

                  const tone =
                    entry.tier === 'CRITICAL' ? 'border-l-4 border-rose-500 bg-rose-50/60'
                    : entry.tier === 'ORANGE' ? 'border-l-4 border-orange-400 bg-orange-50/40'
                    : entry.tier === 'WARN' ? 'border-l-4 border-amber-400 bg-amber-50/40'
                    : 'border-l-4 border-emerald-400 bg-emerald-50/30'

                  return (
                    <button
                      key={entry.id}
                      onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 ${tone}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-semibold">{entry.timestamp}</span>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: tc.bg, color: tc.text }}>
                          {tc.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        HR:{entry.reading.hr} · SpO2:{entry.reading.spo2}% · T:{entry.reading.temp}°C · HRV:{entry.reading.hrv}ms · Risk:{entry.riskScore.toFixed(1)}
                      </div>
                      {(entry.tier !== 'NORMAL' || isExpanded) && (
                        <div className="text-xs text-gray-600 mt-2 italic leading-relaxed">
                          {entry.reasoning}
                        </div>
                      )}
                      {isExpanded && (
                        <div className="text-[11px] text-gray-500 mt-2">
                          Conf: {entry.confidence}% · Action: {entry.action}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
