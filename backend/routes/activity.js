import { Router } from "express"
import jwt from "jsonwebtoken"

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret"
const DEFAULT_GOALS = { goalSteps: 8000, goalCarbs: 320 }
const MOCK_MODE = process.env.ACTIVITY_MOCK === "true" || !process.env.WEARABLE_ENABLED

// Per-user store: { goals, days: Map<date, { steps, carbsBurned }>, ingested: Set<eventKey> }
const activityStore = new Map()

const todayStr = () => new Date().toISOString().slice(0, 10)

function getUserId(req) {
  const auth = req.headers.authorization || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      return payload.sub || payload.email || "user"
    } catch (err) {
      // fall through to demo id
    }
  }
  return "demo-user"
}

function getUserState(userId) {
  if (!activityStore.has(userId)) {
    activityStore.set(userId, {
      goals: { ...DEFAULT_GOALS },
      days: new Map(),
      ingested: new Set(),
    })
  }
  return activityStore.get(userId)
}

function ensureDay(state, date) {
  if (!state.days.has(date)) {
    state.days.set(date, { steps: 0, carbsBurned: 0 })
  }
  return state.days.get(date)
}

function buildHistory(state, days = 7) {
  const results = []
  const base = new Date()
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const day = state.days.get(iso) || { steps: 0, carbsBurned: 0 }
    results.push({ date: iso, steps: Math.round(day.steps), carbsBurned: Math.round(day.carbsBurned) })
  }
  return results
}

function formatSummary(state, date) {
  const day = ensureDay(state, date)
  return {
    date,
    steps: Math.round(day.steps),
    carbsBurned: Math.round(day.carbsBurned),
    goalSteps: state.goals.goalSteps,
    goalCarbs: state.goals.goalCarbs,
    history: buildHistory(state),
  }
}

function seedMockData(state, anchorDate) {
  const baseSteps = 6000 + Math.random() * 2500
  const baseCarbs = 200 + Math.random() * 120
  const anchor = new Date(anchorDate)
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(anchor)
    d.setDate(anchor.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const steps = Math.max(0, Math.round(baseSteps + (Math.random() - 0.5) * 1500))
    const carbsBurned = Math.max(0, Math.round(baseCarbs + (Math.random() - 0.5) * 80))
    state.days.set(iso, { steps, carbsBurned })
  }
}

// GET /api/activity/summary?date=YYYY-MM-DD
router.get("/summary", (req, res) => {
  const userId = getUserId(req)
  const date = (req.query.date || todayStr()).slice(0, 10)
  const state = getUserState(userId)

  if (MOCK_MODE && state.days.size === 0) {
    seedMockData(state, date)
  }

  const summary = formatSummary(state, date)
  res.json(summary)
})

// POST /api/activity/ingest
router.post("/ingest", (req, res) => {
  const { stepsDelta = 0, carbsBurnedDelta = 0, source = "manual", capturedAt } = req.body || {}
  const ts = capturedAt ? new Date(capturedAt) : new Date()
  if (Number.isNaN(ts.getTime())) {
    return res.status(400).json({ error: "Invalid capturedAt" })
  }

  const userId = getUserId(req)
  const state = getUserState(userId)
  const date = ts.toISOString().slice(0, 10)
  const eventKey = `${source}|${ts.toISOString()}`

  if (state.ingested.has(eventKey)) {
    return res.json({ ok: true, duplicate: true, summary: formatSummary(state, date) })
  }

  state.ingested.add(eventKey)
  const day = ensureDay(state, date)
  day.steps += Number(stepsDelta) || 0
  day.carbsBurned += Number(carbsBurnedDelta) || 0

  return res.status(201).json({ ok: true, summary: formatSummary(state, date) })
})

// PUT /api/activity/goals
router.put("/goals", (req, res) => {
  const { goalSteps, goalCarbs } = req.body || {}
  const userId = getUserId(req)
  const state = getUserState(userId)

  if (goalSteps !== undefined) {
    state.goals.goalSteps = Math.max(0, Number(goalSteps) || 0)
  }
  if (goalCarbs !== undefined) {
    state.goals.goalCarbs = Math.max(0, Number(goalCarbs) || 0)
  }

  res.json({ goals: state.goals })
})

export default router
