// backend/routes/emergency.js
import { Router } from 'express'
import { sendEmergencySMS } from '../services/smsService.js'
import { saveLocation, getLocation } from '../services/locationService.js'

const router = Router()

// POST /api/emergency/location  — frontend sends GPS coords
router.post('/location', (req, res) => {
  const { sessionId, lat, lng, accuracy } = req.body
  if (!sessionId || lat === undefined || lng === undefined)
    return res.status(400).json({ error: 'Missing fields' })

  const parsedLat = Number(lat)
  const parsedLng = Number(lng)
  const parsedAcc = accuracy !== undefined ? Number(accuracy) : undefined
  if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng))
    return res.status(400).json({ error: 'Invalid coordinates' })

  saveLocation(sessionId, parsedLat, parsedLng, parsedAcc)
  res.json({ ok: true })
})

// POST /api/emergency/alert  — called when RED_ALERT fires
router.post('/alert', async (req, res) => {
  const { sessionId, vitals, riskScore, pattern, phone } = req.body
  const location = getLocation(sessionId)
  const emergencyPhone = phone || process.env.EMERGENCY_PHONE

  if (!emergencyPhone)
    return res.status(400).json({ error: 'No emergency phone configured' })

  try {
    const result = await sendEmergencySMS(
      emergencyPhone, vitals, location, riskScore, pattern
    )
    res.json({ ok: true, location, result })
  } catch (err) {
    console.error('[Emergency] SMS failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/emergency/location?session=xxx  — get latest coords
router.get('/location', (req, res) => {
  const loc = getLocation(req.query.session)
  res.json({ location: loc })
})

export default router