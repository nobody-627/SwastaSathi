import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import predictionEngine from '../ml/predictionEngine.js'
import healthDataStore from '../services/healthDataStore.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const FEEDBACK_FILE = path.join(__dirname, '../data/ml_feedback.json')

let cached = null
let cachedAt = 0

router.get('/predict', async (req, res) => {
  try {
    if (Date.now() - cachedAt < 10000 && cached) {
      return res.json(cached)
    }
    const records = healthDataStore.getRecords(60)
    const profile = await healthDataStore.getUserProfile()
    const result = await predictionEngine.predict(records, profile)
    cached = result
    cachedAt = Date.now()
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Prediction failed' })
  }
})

router.get('/history', (req, res) => {
  res.json({ history: predictionEngine.predictionHistory.slice(-20) })
})

router.get('/features', (req, res) => {
  res.json(predictionEngine.latestFeatures || { vector: [], names: [] })
})

router.get('/status', (req, res) => {
  const count = healthDataStore.getRecords(2000).length
  res.json({
    recordCount: count,
    isReady: count >= predictionEngine.minRecordsRequired,
    lastPrediction: predictionEngine.lastPredictionTime,
    modelStatus: {
      rules: 'ready',
      logistic: 'ready',
      llm: 'conditional',
    },
  })
})

router.post('/feedback', (req, res) => {
  try {
    const payload = {
      predictionId: req.body?.predictionId || null,
      disease: req.body?.disease || null,
      wasAccurate: !!req.body?.wasAccurate,
      timestamp: new Date().toISOString(),
    }

    let existing = []
    if (fs.existsSync(FEEDBACK_FILE)) {
      existing = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf8'))
      if (!Array.isArray(existing)) existing = []
    }
    existing.push(payload)
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(existing, null, 2), 'utf8')

    return res.json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Feedback save failed' })
  }
})

export default router
