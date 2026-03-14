import { useEffect, useRef, useCallback } from 'react'
import { useAgentStore } from '../store/agentStore'
import { api } from '../api/client'

// ── Helpers ───────────────────────────────────────────────────
const noise = r => (Math.random() - 0.5) * r

export const ACTIVITIES = {
  resting:   { label: '😴 Resting',    hrMod: 0,   hrMax: 80,  spo2Min: 96, note: 'Baseline resting state' },
  walking:   { label: '🚶 Walking',    hrMod: +20, hrMax: 110, spo2Min: 95, note: 'Light activity' },
  running:   { label: '🏃 Running',    hrMod: +60, hrMax: 170, spo2Min: 93, note: 'Intense cardio' },
  cycling:   { label: '🚴 Cycling',    hrMod: +50, hrMax: 160, spo2Min: 93, note: 'Moderate-intense' },
  yoga:      { label: '🧘 Yoga',       hrMod: +10, hrMax: 100, spo2Min: 95, note: 'Light stretching' },
  sleeping:  { label: '🛌 Sleeping',   hrMod: -10, hrMax: 70,  spo2Min: 94, note: 'Sleep — HRV may dip' },
  climbing:  { label: '🧗 Climbing',   hrMod: +70, hrMax: 180, spo2Min: 92, note: 'High altitude risk' },
  swimming:  { label: '🏊 Swimming',   hrMod: +40, hrMax: 150, spo2Min: 94, note: 'Breath-hold risk' },
}

export function generateVital(baseline, mode) {
  if (!mode) return {
    hr:   Math.round(baseline.hr   + noise(8)),
    spo2: Math.round((baseline.spo2 + noise(2))   * 10) / 10,
    temp: Math.round((baseline.temp + noise(0.4))  * 10) / 10,
    hrv:  Math.round(baseline.hrv  + noise(10)),
    timestamp: Date.now(),
  }
  const presets = {
    cardiac: { hr: Math.round(130 + noise(15)), spo2: Math.round((93 + noise(2))*10)/10, temp: Math.round((37.1+noise(0.3))*10)/10, hrv: Math.round(10 + noise(4)) },
    hypoxic: { hr: Math.round(120 + noise(12)), spo2: Math.round((87 + noise(3))*10)/10, temp: Math.round((37.3+noise(0.2))*10)/10, hrv: Math.round(11 + noise(3)) },
    stress:  { hr: Math.round(105 + noise(10)), spo2: Math.round((94 + noise(2))*10)/10, temp: Math.round((37.2+noise(0.3))*10)/10, hrv: Math.round(17 + noise(5)) },
  }
  return { ...(presets[mode] || presets.cardiac), timestamp: Date.now() }
}

export function calcTrend(readings, key) {
  if (readings.length < 5) return 'stable'
  const last5 = readings.slice(-5).map(r => r[key])
  const delta = ((last5[4] - last5[0]) / (last5[0] || 1)) * 100
  return delta > 5 ? 'rising' : delta < -5 ? 'falling' : 'stable'
}

export function getVitalStatus(key, value) {
  if (key === 'hr')   return value > 120 || value < 50 ? 'critical' : value > 100 || value < 60 ? 'warning' : 'normal'
  if (key === 'spo2') return value < 90 ? 'critical' : value < 95 ? 'warning' : 'normal'
  if (key === 'temp') return value > 38 || value < 35.5 ? 'critical' : value > 37.2 ? 'warning' : 'normal'
  if (key === 'hrv')  return value < 15 || value > 90 ? 'critical' : value < 20 ? 'warning' : 'normal'
  return 'normal'
}

export function gaugeColor(score) {
  if (score >= 8) return '#f43f5e'
  if (score >= 6) return '#f97316'
  if (score >= 4) return '#fbbf24'
  return '#10b981'
}

// Call this once when dashboard mounts
export function useLocationTracking(sessionId) {
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        // Send to backend every time position updates
        api.post('/emergency/location', {
          sessionId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }).catch(() => {})
      },
      (err) => console.warn('[GPS]', err.message),
      { enableHighAccuracy: true, maximumAge: 10000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [sessionId])
}

// ── Main hook ─────────────────────────────────────────────────
export function useAgent() {
  const store       = useAgentStore()
  const cycleRef    = useRef(0)
  const lastRiskRef = useRef({ lastRisk: 0, lastPattern: 'NORMAL' })
  const sessionId   = useRef(`session_${Date.now()}`)

  const streamText = useCallback((text) => {
    store.setStreamingText('')
    let i = 0
    const iv = setInterval(() => {
      if (i < text.length) {
        store.setStreamingText(text.slice(0, i + 1))
        i++
      } else clearInterval(iv)
    }, 14)
  }, [store])

  const handleEscalation = useCallback((result) => {
    const now = Date.now()
    const { escalation, fireEscalation, setShowOverlay } = store
    if (result.risk_score >= 4 && result.action === 'YELLOW_ALERT' && now > escalation.t1.cooldownUntil)
      fireEscalation('t1', 300_000)
    if (result.risk_score >= 6 && result.action === 'ORANGE_ALERT' && now > escalation.t2.cooldownUntil)
      fireEscalation('t2', 600_000)
    if (result.risk_score >= 8 && result.action === 'RED_ALERT' && now > escalation.t3.cooldownUntil) {
      fireEscalation('t3', 60_000)
      setShowOverlay(true)
      // Fire emergency SMS to the configured contact
      const { emergencyPhone, latest } = useAgentStore.getState()
      api.post('/emergency/alert', {
        sessionId: sessionId.current,
        vitals: latest,
        riskScore: result.risk_score,
        pattern: result.pattern,
        phone: emergencyPhone,
      }).catch(console.error)
      
      // Send webhook notification for red alert
      fetch('https://pushkar776.app.n8n.cloud/webhook-test/ac1f3627-e635-44db-bcd2-c6063d777c8e', {
        method: 'GET',
        mode: 'no-cors'
      }).catch(() => {
        console.warn('Webhook notification failed')
      })
    }
    
  }, [store])
  

  useEffect(() => {
    if (!store.isRunning) return

    const iv = setInterval(async () => {
      cycleRef.current += 1

      // 1. Generate reading
      const reading = generateVital(store.baseline, store.anomalyMode)
      store.addReading(reading)

      if (cycleRef.current < 3) {
        store.setAgent({ status: 'CALIBRATING', cycle: cycleRef.current })
        return
      }

      // 2. Calc trends from current readings snapshot
      const readings = useAgentStore.getState().readings
      const baseline = useAgentStore.getState().baseline
      const { currentActivity, activityStartedAt } = useAgentStore.getState()
      const activityMeta = ACTIVITIES[currentActivity] || ACTIVITIES.resting
      const trends = {
        hr:   calcTrend(readings, 'hr'),
        spo2: calcTrend(readings, 'spo2'),
        temp: calcTrend(readings, 'temp'),
        hrv:  calcTrend(readings, 'hrv'),
      }

      store.setAgent({ status: 'ASSESSING', cycle: cycleRef.current })

      // 3. Call backend API
      let result = null
      try {
        result = await api.agent.analyze({
          reading,
          baseline,
          trends,
          history: lastRiskRef.current,
          cycleNum: cycleRef.current,
          activity: {
            type: currentActivity,
            label: activityMeta.label,
            durationMinutes: activityStartedAt
              ? Math.round((Date.now() - activityStartedAt) / 60000)
              : 0,
            expectedHRRange: `${60 + activityMeta.hrMod}–${activityMeta.hrMax}`,
            expectedSpo2Min: activityMeta.spo2Min,
            note: activityMeta.note,
          },
        })
      } catch (e) {
        console.warn('[Agent] API call failed, using local fallback:', e.message)
        result = buildLocalFallback(reading, baseline)
      }

      if (!result) return

      lastRiskRef.current = { lastRisk: result.risk_score, lastPattern: result.pattern }

      // 4. Update agent state
      store.setAgent({
        status:     result.risk_score >= 8 ? 'EMERGENCY' : result.action !== 'NONE' ? 'ALERTING' : 'MONITORING',
        riskScore:  result.risk_score,
        pattern:    result.pattern,
        confidence: result.confidence,
        reasoning:  result.reasoning,
        weights:    result.weights || { hr: 0.30, spo2: 0.35, temp: 0.15, hrv: 0.20 },
        action:     result.action,
        lastCallMs: Date.now(),
        isMock:     result.mock || false,
      })

      // 5. Stream reasoning text
      streamText(result.reasoning)

      // 6. Handle escalation
      handleEscalation(result)

      // 7. Add audit log entry
      const tier = result.risk_score >= 8 ? 'critical' : result.risk_score >= 6 ? 'orange' : result.risk_score >= 4 ? 'warn' : 'normal'
      const entry = {
        id:        Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        reading:   { ...reading },
        riskScore: result.risk_score,
        pattern:   result.pattern,
        confidence:result.confidence,
        action:    result.action,
        reasoning: result.reasoning,
        tier,
      }
      store.addLogEntry(entry)

      // 8. Persist to backend (fire-and-forget)
      api.vitals.log(entry, sessionId.current).catch(() => {})

    }, 3000)

    return () => clearInterval(iv)
  }, [store.isRunning, store.anomalyMode, streamText, handleEscalation])

  return { sessionId: sessionId.current }
}

// Local fallback when backend unavailable
function buildLocalFallback(reading, baseline) {
  const b = baseline || { hr: 72, spo2: 97, temp: 36.6, hrv: 45 }
  const hrD = reading.hr - b.hr
  const sD  = reading.spo2 - b.spo2

  if (reading.spo2 < 90 || (reading.hrv < 15 && reading.hr > 120)) {
    return { risk_score: 8.5 + Math.random(), pattern: reading.spo2 < 90 ? 'HYPOXIC_EVENT' : 'CARDIAC_DISTRESS', confidence: 88, action: 'RED_ALERT', reasoning: `Critical vitals detected. SpO2 ${reading.spo2}%, HR ${reading.hr}bpm, HRV ${reading.hrv}ms — immediate escalation required.`, weights: { hr:.30,spo2:.35,temp:.15,hrv:.20 }, mock: true }
  }
  if (reading.hr > 110 || reading.spo2 < 93 || reading.hrv < 18) {
    return { risk_score: 6 + Math.random() * 1.5, pattern: 'CONCERNING', confidence: 80, action: 'ORANGE_ALERT', reasoning: `Multiple vital deviations: HR ${hrD.toFixed(0)}bpm above baseline, SpO2 ${sD.toFixed(1)}% below normal. Monitoring closely.`, weights: { hr:.30,spo2:.35,temp:.15,hrv:.20 }, mock: true }
  }
  if (Math.abs(hrD) > 15 || Math.abs(sD) > 2) {
    return { risk_score: 4 + Math.random() * 1.5, pattern: 'ELEVATED', confidence: 75, action: 'YELLOW_ALERT', reasoning: `Mild deviation: HR ${reading.hr}bpm (${hrD > 0 ? '+' : ''}${hrD.toFixed(0)} from baseline). Continuing to monitor.`, weights: { hr:.30,spo2:.35,temp:.15,hrv:.20 }, mock: true }
  }
  return { risk_score: 0.5 + Math.random() * 2, pattern: 'NORMAL', confidence: 92, action: 'NONE', reasoning: `All vitals within personal baseline. HR ${reading.hr}bpm, SpO2 ${reading.spo2}%, Temp ${reading.temp}°C, HRV ${reading.hrv}ms.`, weights: { hr:.30,spo2:.35,temp:.15,hrv:.20 }, mock: true }
}
