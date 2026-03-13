import { create } from 'zustand'

const DEFAULT_BASELINE = { hr: 72, spo2: 97, temp: 36.6, hrv: 45 }

export const useAgentStore = create((set, get) => ({
  // ── Vitals ───────────────────────────────────────────────────
  readings:  [],
  baseline:  { ...DEFAULT_BASELINE },
  latest:    { hr: 72, spo2: 97, temp: 36.6, hrv: 45, timestamp: Date.now() },
  currentActivity: 'resting',
  activityStartedAt: null,

  addReading(reading) {
    set(state => {
      const readings = [...state.readings.slice(-59), reading]
      // Rolling baseline after 5+ readings
      const baseline = readings.length >= 5
        ? (() => {
            const last = readings.slice(-20)
            return {
              hr:   last.reduce((s, r) => s + r.hr,   0) / last.length,
              spo2: last.reduce((s, r) => s + r.spo2, 0) / last.length,
              temp: last.reduce((s, r) => s + r.temp, 0) / last.length,
              hrv:  last.reduce((s, r) => s + r.hrv,  0) / last.length,
            }
          })()
        : state.baseline
      return { readings, baseline, latest: reading }
    })
  },

emergencyPhone: '+918600710162',
sessionId: `session_${Date.now()}`,
setEmergencyPhone: (phone) => set({ emergencyPhone: phone }),

  // ── Agent ────────────────────────────────────────────────────
  agent: {
    status:     'CALIBRATING',
    cycle:      0,
    riskScore:  0,
    pattern:    'NORMAL',
    confidence: 0,
    reasoning:  'Initializing SwasthSathi AI agent…',
    weights:    { hr: 0.30, spo2: 0.35, temp: 0.15, hrv: 0.20 },
    action:     'NONE',
    lastCallMs: 0,
    isMock:     false,
  },

  setAgent(patch) {
    set(state => ({ agent: { ...state.agent, ...patch } }))
  },

  // ── Escalation ───────────────────────────────────────────────
  escalation: {
    t1: { armed: true, cooldownUntil: 0, firedCount: 0 },
    t2: { armed: true, cooldownUntil: 0, firedCount: 0 },
    t3: { armed: true, cooldownUntil: 0, firedCount: 0 },
  },

  fireEscalation(tier, cooldownMs) {
    const now = Date.now()
    set(state => ({
      escalation: {
        ...state.escalation,
        [tier]: {
          armed: false,
          cooldownUntil: now + cooldownMs,
          firedCount: state.escalation[tier].firedCount + 1,
        },
      },
    }))
    // Re-arm after cooldown
    setTimeout(() => {
      set(state => ({
        escalation: {
          ...state.escalation,
          [tier]: { ...state.escalation[tier], armed: true },
        },
      }))
    }, cooldownMs)
  },

  // ── Audit log ────────────────────────────────────────────────
  auditLog: [],

  addLogEntry(entry) {
    set(state => ({ auditLog: [entry, ...state.auditLog].slice(0, 300) }))
  },

  clearLog() { set({ auditLog: [] }) },

  // ── Demo controls ────────────────────────────────────────────
  anomalyMode: null,
  isRunning:   true,
  showOverlay: false,

  setAnomalyMode(mode)   { set({ anomalyMode: mode }) },
  setRunning(v)          { set({ isRunning: v }) },
  setShowOverlay(v)      { set({ showOverlay: v }) },

  // ── Streaming text ───────────────────────────────────────────
  streamingText: '',
  setStreamingText(t)    { set({ streamingText: t }) },

  setActivity: (activity) => set({
    currentActivity: activity,
    activityStartedAt: Date.now(),
  }),
}))
