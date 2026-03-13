import { Router } from 'express';
import { config } from 'dotenv';
config();

const router = Router();

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are SwasthSathi AI — an autonomous clinical escalation agent.
You analyze real-time patient vital signs and make risk assessments.
You MUST respond with ONLY a valid JSON object. No preamble, no explanation outside JSON.

Respond with exactly this structure:
{
  "risk_score": <number 0.0-10.0>,
  "pattern": <"NORMAL"|"ELEVATED"|"CONCERNING"|"CARDIAC_DISTRESS"|"HYPOXIC_EVENT"|"STRESS_RESPONSE"|"CRITICAL">,
  "confidence": <integer 0-100>,
  "action": <"NONE"|"YELLOW_ALERT"|"ORANGE_ALERT"|"RED_ALERT">,
  "reasoning": <string: 1-3 plain English sentences>,
  "weights": { "hr": <0-1>, "spo2": <0-1>, "temp": <0-1>, "hrv": <0-1> }
}

Rules:
- Single mild deviation: risk 2-4
- Single clear deviation: risk 4-6
- Multiple deviations or worsening trend: risk 6-8
- Critical multi-vital failure: risk 8-10
- Rising trend adds +1 to score
- HRV < 15ms + HR > 120: always score >= 8.0
- SpO2 < 90%: always score >= 8.0
- Action thresholds: NONE(<4), YELLOW_ALERT(4-5.9), ORANGE_ALERT(6-7.9), RED_ALERT(>=8)`;

// POST /api/agent/analyze
router.post('/analyze', async (req, res) => {
  const { reading, baseline, trends, history, cycleNum } = req.body;

  if (!reading) {
    return res.status(400).json({ error: 'Missing reading data' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    // Return mock response when no API key is configured
    const mock = buildMockResponse(reading, baseline);
    return res.json(mock);
  }

  const userPrompt = `Patient vital reading #${cycleNum || 1}:
Current: HR=${reading.hr}bpm, SpO2=${reading.spo2}%, Temp=${reading.temp}°C, HRV=${reading.hrv}ms
Personal baseline: HR=${(baseline?.hr || 72).toFixed(1)}bpm, SpO2=${(baseline?.spo2 || 97).toFixed(1)}%, Temp=${(baseline?.temp || 36.6).toFixed(1)}°C, HRV=${(baseline?.hrv || 45).toFixed(1)}ms
Deviations: HR=${(reading.hr - (baseline?.hr || 72)).toFixed(1)}, SpO2=${(reading.spo2 - (baseline?.spo2 || 97)).toFixed(1)}%, Temp=${(reading.temp - (baseline?.temp || 36.6)).toFixed(1)}, HRV=${(reading.hrv - (baseline?.hrv || 45)).toFixed(1)}ms
60-second trends: HR=${trends?.hr || 'stable'}, SpO2=${trends?.spo2 || 'stable'}, Temp=${trends?.temp || 'stable'}, HRV=${trends?.hrv || 'stable'}
Last risk score: ${history?.lastRisk || 0} | Last pattern: ${history?.lastPattern || 'NORMAL'}
Assess and respond with JSON only.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Agent] Groq API error:', errText);
      return res.json(buildMockResponse(reading, baseline));
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    return res.json(result);
  } catch (err) {
    console.error('[Agent] Error calling Groq API:', err.message);
    return res.json(buildMockResponse(reading, baseline));
  }
});

// GET /api/agent/status
router.get('/status', (req, res) => {
  const hasKey = !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  res.json({ aiEnabled: hasKey, model, status: 'ready' });
});

// ── Mock response when no API key ─────────────────────────────
function buildMockResponse(reading, baseline) {
  const b = baseline || { hr: 72, spo2: 97, temp: 36.6, hrv: 45 };
  const hrDev = reading.hr - b.hr;
  const spo2Dev = reading.spo2 - b.spo2;
  const hrvDev = reading.hrv - b.hrv;

  let risk = 1.0;
  let pattern = 'NORMAL';
  let action = 'NONE';
  let reasoning = 'All vital signs are within normal range. Patient baseline stable.';

  if (reading.spo2 < 90 || (reading.hrv < 15 && reading.hr > 120)) {
    risk = 8.5 + Math.random() * 1.5;
    pattern = reading.spo2 < 90 ? 'HYPOXIC_EVENT' : 'CARDIAC_DISTRESS';
    action = 'RED_ALERT';
    reasoning = `Critical multi-vital anomaly detected. SpO2 is ${reading.spo2}% (${spo2Dev.toFixed(1)}% below baseline) while HR is elevated at ${reading.hr}bpm. HRV of ${reading.hrv}ms indicates cardiac irregularity. Immediate escalation triggered.`;
  } else if (reading.hr > 110 || reading.spo2 < 93 || reading.hrv < 18) {
    risk = 6.0 + Math.random() * 1.5;
    pattern = reading.spo2 < 93 ? 'CONCERNING' : 'CARDIAC_DISTRESS';
    action = 'ORANGE_ALERT';
    reasoning = `Multiple vital signs showing concerning deviations. HR ${reading.hr}bpm is ${hrDev.toFixed(0)} above baseline. SpO2 at ${reading.spo2}% warrants monitoring. HRV irregularity detected.`;
  } else if (Math.abs(hrDev) > 15 || Math.abs(spo2Dev) > 2 || Math.abs(hrvDev) > 15) {
    risk = 4.0 + Math.random() * 1.5;
    pattern = 'ELEVATED';
    action = 'YELLOW_ALERT';
    reasoning = `Mild vital sign deviation detected. HR deviation of ${hrDev.toFixed(0)}bpm from personal baseline. Continuing to monitor for pattern development.`;
  } else {
    risk = 0.5 + Math.random() * 2.5;
    pattern = 'NORMAL';
    action = 'NONE';
    reasoning = `All vitals within personal baseline. HR: ${reading.hr}bpm, SpO2: ${reading.spo2}%, Temp: ${reading.temp}°C, HRV: ${reading.hrv}ms. No action required.`;
  }

  return {
    risk_score: Math.round(risk * 10) / 10,
    pattern,
    confidence: Math.round(75 + Math.random() * 20),
    action,
    reasoning,
    weights: { hr: 0.30, spo2: 0.35, temp: 0.15, hrv: 0.20 },
    mock: true,
  };
}

export default router;
