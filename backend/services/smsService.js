// backend/services/smsService.js
import axios from 'axios'

// ── Fast2SMS (India) ──────────────────────────────────────────
export async function sendFast2SMS(phone, message) {
  if (!process.env.FAST2SMS_API_KEY) throw new Error('Fast2SMS API key not configured')

  const numbers = Array.isArray(phone) ? phone : [phone]
  const cleaned = numbers.map(p => String(p).replace(/\D/g, '')).join(',')

  const response = await axios.post(
    'https://www.fast2sms.com/dev/bulkV2',
    {
      route: 'q',                    // quick transactional
      message,
      language: 'english',
      flash: 0,
      numbers: cleaned,
    },
    {
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data
}

// ── Twilio (Global) ───────────────────────────────────────────
export async function sendTwilioSMS(phone, message) {
  const sid   = process.env.TWILIO_ACCOUNT_SID?.trim()
  const token = process.env.TWILIO_AUTH_TOKEN?.trim()
  const from  = process.env.TWILIO_FROM_NUMBER?.trim()

  if (!sid || !token || !from) {
    throw new Error('Twilio credentials not configured')
  }

  const { default: twilio } = await import('twilio')
  const client = twilio(sid, token)
  return client.messages.create({
    body: message,
    from,
    to: phone,
  })
}

// ── Auto-detect which service to use ─────────────────────────
export async function sendEmergencySMS(phone, vitals, location, riskScore, pattern) {
  // Build Google Maps link from coordinates
  const mapsLink = location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : 'Location unavailable'

  const message =
    `🚨 SWASTHSATHI EMERGENCY ALERT 🚨\n` +
    `Patient needs immediate help!\n\n` +
    `Risk Score: ${riskScore}/10 — ${pattern}\n` +
    `HR: ${vitals.hr}bpm | SpO2: ${vitals.spo2}%\n` +
    `Temp: ${vitals.temp}°C | HRV: ${vitals.hrv}ms\n\n` +
    `📍 Live Location:\n${mapsLink}\n\n` +
    `Time: ${new Date().toLocaleTimeString('en-IN')}\n` +
    `Please send help immediately or call an ambulance:\n` +
    `🚑 Dial 108 (National Ambulance)`

  // Use Twilio first (requested); optional Fast2SMS fallback if Twilio is missing
  if (process.env.TWILIO_ACCOUNT_SID) return sendTwilioSMS(phone, message)
  if (process.env.FAST2SMS_API_KEY) return sendFast2SMS(phone, message)

  console.log('[SMS] No provider configured. Would have sent:\n', message)
  return { mock: true, message }
}