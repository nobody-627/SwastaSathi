import { Router } from "express"
import { v4 as uuid } from "uuid"

const router = Router()

// In-memory store
const medications = []

const todayStr = () => new Date().toISOString().slice(0, 10)

function resetIfNewDay(med) {
  if (med.takenDate !== todayStr()) {
    med.takenToday = []
    med.takenDate = todayStr()
  }
}

// GET /api/medications — list all
router.get("/", (req, res) => {
  const list = medications.map((m) => {
    resetIfNewDay(m)
    return m
  })
  res.json({ medications: list })
})

// POST /api/medications — create
router.post("/", (req, res) => {
  const { name, dosage, frequency, times, instructions, prescribedBy, startDate, active = true } = req.body || {}

  if (!name || !dosage || !frequency || !Array.isArray(times) || times.length === 0) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  const med = {
    id: uuid(),
    name: String(name).trim(),
    dosage: String(dosage).trim(),
    frequency,
    times: times.map((t) => String(t).trim()),
    instructions: instructions ? String(instructions).trim() : "",
    prescribedBy: prescribedBy ? String(prescribedBy).trim() : "",
    startDate: startDate || todayStr(),
    active: Boolean(active),
    takenToday: [],
    takenDate: todayStr(),
  }

  medications.push(med)
  res.status(201).json({ medication: med })
})

// PUT /api/medications/:id — update
router.put("/:id", (req, res) => {
  const idx = medications.findIndex((m) => m.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })

  const current = medications[idx]
  resetIfNewDay(current)

  const payload = req.body || {}
  const updated = {
    ...current,
    ...(payload.name !== undefined ? { name: String(payload.name).trim() } : {}),
    ...(payload.dosage !== undefined ? { dosage: String(payload.dosage).trim() } : {}),
    ...(payload.frequency !== undefined ? { frequency: payload.frequency } : {}),
    ...(payload.times ? { times: payload.times.map((t) => String(t).trim()) } : {}),
    ...(payload.instructions !== undefined ? { instructions: String(payload.instructions).trim() } : {}),
    ...(payload.prescribedBy !== undefined ? { prescribedBy: String(payload.prescribedBy).trim() } : {}),
    ...(payload.startDate !== undefined ? { startDate: payload.startDate } : {}),
    ...(payload.active !== undefined ? { active: Boolean(payload.active) } : {}),
  }

  medications[idx] = updated
  res.json({ medication: updated })
})

// DELETE /api/medications/:id — delete
router.delete("/:id", (req, res) => {
  const idx = medications.findIndex((m) => m.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: "Not found" })
  medications.splice(idx, 1)
  res.json({ ok: true })
})

// POST /api/medications/:id/taken — mark a dose as taken today
router.post("/:id/taken", (req, res) => {
  const { time } = req.body || {}
  const med = medications.find((m) => m.id === req.params.id)
  if (!med) return res.status(404).json({ error: "Not found" })
  if (!time) return res.status(400).json({ error: "time is required" })

  resetIfNewDay(med)

  if (!med.takenToday.includes(time)) {
    med.takenToday.push(time)
  }

  res.json({ medication: med })
})

export default router
