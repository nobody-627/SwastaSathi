import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuid } from 'uuid'
import { engineerFeatures } from '../ml/featureEngineer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const HISTORY_FILE = path.join(__dirname, '../data/health_history.json')
const MAX_RECORDS = 2000

let buffer = []
let pendingWrites = 0

function loadHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
    if (Array.isArray(parsed)) buffer = parsed.slice(-MAX_RECORDS)
  } catch (err) {
    console.warn('[HealthStore] Failed to load history:', err.message)
  }
}

function flushToDisk() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(buffer, null, 2), 'utf8')
  } catch (err) {
    console.warn('[HealthStore] Failed to persist history:', err.message)
  }
}

function toWindowMinutes(minutes) {
  const since = Date.now() - minutes * 60 * 1000
  return buffer.filter((r) => new Date(r.timestamp).getTime() >= since)
}

function valuesFor(records, selector) {
  return records.map(selector).map((v) => Number(v)).filter(Number.isFinite)
}

function trend(arr) {
  if (arr.length < 2) return 0
  return (arr[arr.length - 1] - arr[0]) / arr.length
}

function stat(records, selector) {
  const values = valuesFor(records, selector)
  if (!values.length) return { mean: 0, std: 0, min: 0, max: 0, trend: 0 }
  const m = values.reduce((s, v) => s + v, 0) / values.length
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length
  return {
    mean: m,
    std: Math.sqrt(variance),
    min: Math.min(...values),
    max: Math.max(...values),
    trend: trend(values),
  }
}

async function getActiveMedications() {
  try {
    const res = await fetch('http://localhost:3001/api/medications')
    const data = await res.json()
    const meds = Array.isArray(data?.medications) ? data.medications : []
    return meds.filter((m) => m.active !== false).map((m) => m.name).filter(Boolean)
  } catch {
    return []
  }
}

async function getUserProfile() {
  try {
    const latest = buffer[buffer.length - 1]
    if (latest?.profile) return latest.profile
  } catch {
    // no-op
  }
  return {
    age: 30,
    gender: 'other',
    bmi: 24,
    lifestyle: 'moderate',
    conditions: [],
  }
}

function addRecord(record) {
  const enriched = {
    id: record.id || uuid(),
    userId: record.userId || 'default_user',
    timestamp: record.timestamp || new Date().toISOString(),
    source: record.source || 'simulated',
    vitals: record.vitals || {},
    activity: record.activity || {},
    medications: Array.isArray(record.medications) ? record.medications : [],
    profile: record.profile || {},
    mlFeatures: null,
  }

  buffer.push(enriched)
  if (buffer.length > MAX_RECORDS) {
    buffer = buffer.slice(-(MAX_RECORDS - 200))
  }

  const recent = buffer.slice(-60)
  const { vector, names } = engineerFeatures(recent)
  enriched.mlFeatures = { vector, names }

  pendingWrites += 1
  if (pendingWrites >= 50) {
    flushToDisk()
    pendingWrites = 0
  }

  return enriched
}

function getRecords(n = 60) {
  return buffer.slice(-Math.max(1, n))
}

function getRecordsInWindow(minutes = 5) {
  return toWindowMinutes(minutes)
}

function getAggregated(windowMin = 5) {
  const records = toWindowMinutes(windowMin)
  return {
    heartRate: stat(records, (r) => r.vitals?.heartRate),
    hrv: stat(records, (r) => r.vitals?.hrv),
    spo2: stat(records, (r) => r.vitals?.spo2),
    systolic: stat(records, (r) => r.vitals?.bloodPressure?.systolic),
    diastolic: stat(records, (r) => r.vitals?.bloodPressure?.diastolic),
    bloodSugar: stat(records, (r) => r.vitals?.bloodSugar),
    bodyTemperature: stat(records, (r) => r.vitals?.bodyTemperature),
    respiratoryRate: stat(records, (r) => r.vitals?.respiratoryRate),
  }
}

function getForML() {
  const records = getRecords(60)
  const { vector, names } = engineerFeatures(records)
  return { vector, names, records }
}

function clear() {
  buffer = []
  pendingWrites = 0
}

loadHistory()

export default {
  addRecord,
  getRecords,
  getRecordsInWindow,
  getAggregated,
  getForML,
  getUserProfile,
  getActiveMedications,
  clear,
}
