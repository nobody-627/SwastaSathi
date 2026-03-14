// backend/routes/emergency.js
import { Router } from 'express'
import { sendEmergencySMS } from '../services/smsService.js'
import { saveLocation, getLocation } from '../services/locationService.js'

const router = Router()

// In-memory call status storage (in production, use a database)
const callStatuses = new Map()

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

// POST /api/emergency-call  — trigger Vapi emergency call
router.post('/emergency-call', async (req, res) => {
  const { patient, alerts, contact } = req.body
  
  if (!patient || !alerts || !contact || !contact.name || !contact.phone) {
    return res.status(400).json({ error: 'Missing required fields: patient, alerts, contact.name, contact.phone' })
  }

  const apiKey = process.env.VAPI_API_KEY
  const assistantId = process.env.VAPI_ASSISTANT_ID
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID

  if (!apiKey || !assistantId || !phoneNumberId) {
    return res.status(500).json({ error: 'Vapi credentials not configured' })
  }

  try {
    const firstMessage = `Hello ${contact.name}, this is an automated emergency alert. Patient ${patient} needs immediate attention. ${alerts.join('. ')}. Please say confirmed to acknowledge.`

    const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId,
        phoneNumberId,
        customer: {
          number: contact.phone,
          name: contact.name
        },
        assistantOverrides: {
          firstMessage
        }
      })
    })

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text()
      console.error('[Vapi] API error:', vapiResponse.status, errorText)
      return res.status(vapiResponse.status).json({ error: 'Vapi API call failed', details: errorText })
    }

    const callData = await vapiResponse.json()
    
    // Store call status for polling
    callStatuses.set(callData.id, {
      id: callData.id,
      status: 'initiated',
      contact: contact.name,
      phone: contact.phone,
      patient,
      alerts,
      confirmed: false,
      createdAt: new Date().toISOString()
    })

    console.log(`[Vapi] Emergency call initiated: ${callData.id} to ${contact.name} (${contact.phone})`)
    
    res.json({ 
      success: true, 
      callId: callData.id,
      status: 'initiated'
    })

  } catch (error) {
    console.error('[Vapi] Emergency call error:', error)
    res.status(500).json({ error: 'Failed to initiate emergency call', details: error.message })
  }
})

// GET /api/call-status  — poll call status
router.get('/call-status', (req, res) => {
  const { callId } = req.query
  
  if (!callId) {
    return res.status(400).json({ error: 'callId is required' })
  }

  const callStatus = callStatuses.get(callId)
  
  if (!callStatus) {
    return res.status(404).json({ error: 'Call not found' })
  }

  res.json(callStatus)
})

// POST /api/vapi-webhook  — Vapi webhook handler
router.post('/vapi-webhook', (req, res) => {
  const event = req.body
  console.log('[Vapi Webhook] Received event:', event.type, event.id)

  try {
    switch (event.type) {
      case 'call-started':
        if (callStatuses.has(event.call.id)) {
          const status = callStatuses.get(event.call.id)
          status.status = 'calling'
          status.startedAt = new Date().toISOString()
          console.log(`[Vapi] Call started: ${event.call.id}`)
        }
        break

      case 'transcript':
        if (callStatuses.has(event.call.id)) {
          const status = callStatuses.get(event.call.id)
          const transcript = event.transcript?.toLowerCase()
          
          if (transcript && transcript.includes('confirmed')) {
            status.confirmed = true
            status.status = 'confirmed'
            status.confirmedAt = new Date().toISOString()
            console.log(`[Vapi] Call confirmed: ${event.call.id} by "${event.transcript}"`)
          }
          
          // Store transcript for logging
          if (!status.transcripts) status.transcripts = []
          status.transcripts.push({
            text: event.transcript,
            timestamp: new Date().toISOString(),
            role: event.role
          })
        }
        break

      case 'end-of-call-report':
        if (callStatuses.has(event.call.id)) {
          const status = callStatuses.get(event.call.id)
          status.status = 'ended'
          status.endedReason = event.endedReason
          status.endedAt = new Date().toISOString()
          status.summary = event.summary
          
          console.log(`[Vapi] Call ended: ${event.call.id}, reason: ${event.endedReason}`)
        }
        break

      default:
        console.log(`[Vapi Webhook] Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('[Vapi Webhook] Error processing event:', error)
    res.status(500).json({ error: 'Failed to process webhook' })
  }
})

export default router