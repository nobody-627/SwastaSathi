import { engineerFeatures, getTrendSlope } from '../ml/featureEngineer.js'
import LogisticRegression from '../ml/logisticRegression.js'
import { FEATURE_NAMES, DISEASE_MODELS, DISEASE_KEYS } from '../ml/modelWeights.js'
import {
  ruleBasedScore,
  combineModels,
  applyBayesianCorrection,
  calibrateProbability,
} from '../ml/diseaseRiskModel.js'
import predictionEngine from '../ml/predictionEngine.js'
import { smartFilterPredictions } from '../ml/smartFilter.js'
import healthDataStore from '../services/healthDataStore.js'

function mockRecord(i, opts = {}) {
  const t = i / 60 * Math.PI * 2
  const highRisk = opts.highRisk
  const lowRisk = opts.lowRisk

  const hr = highRisk ? 120 + Math.sin(t) * 10 : lowRisk ? 65 + Math.sin(t) * 4 : 75 + Math.sin(t) * 8
  const spo2 = highRisk ? 93 + Math.sin(t) : lowRisk ? 99 : 97 + Math.sin(t)
  const systolic = highRisk ? 150 + Math.sin(t) * 6 : lowRisk ? 112 : 126 + Math.sin(t) * 7
  const diastolic = highRisk ? 96 + Math.cos(t) * 4 : lowRisk ? 72 : 82 + Math.cos(t) * 5
  const sugar = highRisk ? 148 + Math.sin(t) * 12 : lowRisk ? 88 : 102 + Math.sin(t) * 10
  const hrv = opts.missingHRV ? undefined : highRisk ? 22 + Math.cos(t) * 5 : lowRisk ? 58 + Math.cos(t) * 4 : 42 + Math.cos(t) * 7
  const stress = opts.missingStress ? undefined : highRisk ? 72 : lowRisk ? 25 : 48

  return {
    id: `r_${i}`,
    userId: 'default_user',
    timestamp: new Date(Date.now() - (60 - i) * 3000).toISOString(),
    source: 'simulated',
    vitals: {
      heartRate: hr,
      hrv,
      spo2,
      bloodPressure: { systolic, diastolic },
      bloodSugar: sugar,
      bodyTemperature: 36.8 + Math.sin(t) * 0.2,
      respiratoryRate: 16 + Math.sin(t),
    },
    activity: {
      type: highRisk ? 'resting' : 'walking',
      steps: i * 5,
      caloriesBurned: i * 0.6,
      activeMinutes: Math.max(1, Math.round(i / 3)),
      stressLevel: stress,
      sleepScore: highRisk ? 55 : 78,
    },
    medications: highRisk ? ['amlodipine', 'metformin'] : [],
    profile: {
      age: highRisk ? 52 : 30,
      gender: 'male',
      bmi: highRisk ? 31 : 23,
      lifestyle: highRisk ? 'sedentary' : 'active',
      conditions: highRisk ? ['hypertension'] : [],
    },
  }
}

function generateMockRecords(n, options = {}) {
  return Array.from({ length: n }, (_, i) => mockRecord(i, options))
}

function buildTestFeatures(overrides = {}) {
  const base = Object.fromEntries(FEATURE_NAMES.map((n) => [n, 0]))
  Object.assign(base, {
    systolic_mean: 115,
    diastolic_mean: 75,
    heartRate_mean: 68,
    spo2_mean: 99,
    spo2_min: 98,
    bloodSugar_mean: 90,
    bloodSugar_max: 95,
    hrv_mean: 55,
    bmi_normalized: 0.55,
    age_normalized: 0.30,
    lifestyle_encoded: 1,
    sleep_score_mean: 78,
    stress_level_mean: 24,
    recovery_capacity: 44,
    activity_intensity_encoded: 1.1,
    steps_per_minute: 7,
    respiratoryRate_mean: 16,
    spo2_10rec_min: 98,
    pulse_pressure: 40,
    mean_arterial_pressure: 88,
    cardiac_stress_index: 1.2,
    active_minutes_mean: 32,
    reading_consistency_score: 0.82,
    heartRate_10rec_mean: 70,
    heartRate_30rec_mean: 69,
  }, overrides)
  return FEATURE_NAMES.map((name) => base[name] ?? 0)
}

function scoreMap(overrides = {}) {
  return Object.fromEntries(FEATURE_NAMES.map((n, i) => [n, buildTestFeatures(overrides)[i]]))
}

describe('Feature Engineering', () => {
  test('engineers correct number of features', () => {
    const mockRecords = generateMockRecords(60)
    const { vector, names } = engineerFeatures(mockRecords)
    expect(vector.length).toBe(names.length)
    expect(vector.length).toBeGreaterThanOrEqual(40)
  })

  test('handles missing fields gracefully', () => {
    const incompleteRecords = generateMockRecords(20, { missingHRV: true })
    const { vector } = engineerFeatures(incompleteRecords)
    expect(vector.every((v) => !Number.isNaN(v) && Number.isFinite(v))).toBe(true)
  })

  test('detects correct trend direction', () => {
    const increasing = [60, 65, 70, 75, 80, 85, 90]
    expect(getTrendSlope(increasing)).toBeGreaterThan(0)
  })
})

describe('Rule-Based Scoring', () => {
  test('flags hypertension correctly', () => {
    const vector = buildTestFeatures({ systolic_mean: 155, diastolic_mean: 95, pulse_pressure: 62 })
    const map = Object.fromEntries(FEATURE_NAMES.map((n, i) => [n, vector[i]]))
    const scores = ruleBasedScore(vector, FEATURE_NAMES, map)
    expect(scores.hypertension).toBeGreaterThan(0.6)
  })

  test('gives low score for healthy vitals', () => {
    const vector = buildTestFeatures()
    const map = Object.fromEntries(FEATURE_NAMES.map((n, i) => [n, vector[i]]))
    const scores = ruleBasedScore(vector, FEATURE_NAMES, map)
    Object.values(scores).forEach((s) => expect(s).toBeLessThanOrEqual(0.4))
  })

  test('returns scores for expanded disease library', () => {
    const vector = buildTestFeatures({ stress_level_mean: 75, sleep_score_mean: 48, hrv_trend: -2, recovery_capacity: 16 })
    const map = Object.fromEntries(FEATURE_NAMES.map((n, i) => [n, vector[i]]))
    const scores = ruleBasedScore(vector, FEATURE_NAMES, map)
    expect(Object.keys(scores)).toHaveLength(DISEASE_KEYS.length)
    expect(scores.burnout_syndrome).toBeGreaterThan(0)
  })
})

describe('Logistic Regression', () => {
  test('predict returns value between 0 and 1', () => {
    const model = new LogisticRegression(Array(FEATURE_NAMES.length).fill(0.1), -0.5, FEATURE_NAMES)
    const pred = model.predict(Array(FEATURE_NAMES.length).fill(1))
    expect(pred).toBeGreaterThanOrEqual(0)
    expect(pred).toBeLessThanOrEqual(1)
  })

  test('higher risk features to higher probability', () => {
    const lowRisk = buildTestFeatures({ systolic_mean: 115 })
    const highRisk = buildTestFeatures({ systolic_mean: 165 })
    const modelCfg = DISEASE_MODELS.hypertension
    const model = new LogisticRegression(modelCfg.weights, modelCfg.bias, FEATURE_NAMES)
    expect(model.predict(highRisk)).toBeGreaterThanOrEqual(model.predict(lowRisk))
  })
})

describe('Ensemble Combiner', () => {
  test('confidence > 0.80 filter scenario works', () => {
    const mockRuleScores = Object.fromEntries(DISEASE_KEYS.map((key) => [key, 0.1]))
    const mockLRScores = Object.fromEntries(DISEASE_KEYS.map((key) => [key, 0.1]))
    const mockLLMScores = Object.fromEntries(DISEASE_KEYS.map((key) => [key, 0.1]))
    mockRuleScores.hypertension = 0.85
    mockLRScores.hypertension = 0.82
    mockLLMScores.hypertension = 0.88
    const result = combineModels(mockRuleScores, mockLRScores, mockLLMScores)
    expect(result.hypertension.confidence).toBeGreaterThanOrEqual(0.8)
  })

  test('works without LLM scores', () => {
    const mockRuleScores = Object.fromEntries(DISEASE_KEYS.map((key) => [key, 0.1]))
    const mockLRScores = Object.fromEntries(DISEASE_KEYS.map((key) => [key, 0.1]))
    mockRuleScores.hypertension = 0.85
    mockLRScores.hypertension = 0.82
    const result = combineModels(mockRuleScores, mockLRScores, null)
    expect(result).toBeDefined()
    Object.values(result).forEach((r) => {
      expect(r.probability).toBeGreaterThanOrEqual(0)
      expect(r.probability).toBeLessThanOrEqual(1)
    })
  })
})

describe('Calibration and Filtering', () => {
  test('bayesian correction increases probability for high-risk profile', () => {
    const base = 0.4
    const corrected = applyBayesianCorrection('type2_diabetes', base, { age: 61, bmi: 33 })
    expect(corrected).toBeGreaterThan(base)
  })

  test('probability calibration stays bounded', () => {
    const calibrated = calibrateProbability('hypertension', 0.72)
    expect(calibrated).toBeGreaterThanOrEqual(0)
    expect(calibrated).toBeLessThanOrEqual(1)
  })

  test('smart filter limits featured predictions and tracks suppressed list', () => {
    const predictions = [
      { disease: 'hypertension', probability: 81, confidence: 84, category: 'Cardiovascular', isAcute: false, trend: 'up' },
      { disease: 'coronary_artery_disease', probability: 74, confidence: 78, category: 'Cardiovascular', isAcute: true, trend: 'up' },
      { disease: 'type2_diabetes', probability: 69, confidence: 76, category: 'Metabolic', isAcute: false, trend: 'stable' },
      { disease: 'burnout_syndrome', probability: 63, confidence: 72, category: 'Mental Health', isAcute: false, trend: 'up' },
      { disease: 'asthma', probability: 29, confidence: 65, category: 'Respiratory', isAcute: true, trend: 'up' },
    ]
    const filtered = smartFilterPredictions(predictions, { medications: ['amlodipine'], age: 58 })
    expect(filtered.predictions.length).toBeLessThanOrEqual(3)
    expect(filtered.suppressedList.length).toBeGreaterThan(0)
    expect(filtered.filterTrace.length).toBeGreaterThan(0)
  })
})

describe('End-to-End Prediction', () => {
  const mockProfile = { age: 45, gender: 'male', bmi: 28.5, lifestyle: 'sedentary', conditions: [] }

  test('full pipeline returns valid prediction with 60 records', async () => {
    const mockRecords = generateMockRecords(60, { highRisk: true })
    const result = await predictionEngine.predict(mockRecords, mockProfile)
    expect(result.recordsAnalyzed).toBe(60)
    expect(result.predictions).toBeInstanceOf(Array)
    expect(result.suppressedList).toBeInstanceOf(Array)
    result.predictions.forEach((p) => {
      expect(p.confidence).toBeGreaterThanOrEqual(40)
      expect(p.probability).toBeGreaterThanOrEqual(0)
      expect(p.probability).toBeLessThanOrEqual(100)
    })
  })

  test('returns insufficient_data when < 20 records', async () => {
    const result = await predictionEngine.predict(generateMockRecords(10), mockProfile)
    expect(result.status).toBe('insufficient_data')
  })

  test('handles missing columns gracefully', async () => {
    const incompleteRecords = generateMockRecords(30, { missingHRV: true, missingStress: true })
    const result = await predictionEngine.predict(incompleteRecords, mockProfile)
    expect(result).toBeDefined()
    expect(result.dataQuality.issues.length).toBeGreaterThan(0)
  })

  test('returns expanded score map', async () => {
    const result = await predictionEngine.predict(generateMockRecords(60, { highRisk: true }), mockProfile)
    expect(Object.keys(result.allScores)).toHaveLength(DISEASE_KEYS.length)
  })
})

describe('Integration', () => {
  test('healthDataStore feeds engine with >=20 records', async () => {
    healthDataStore.clear()
    for (let i = 0; i < 25; i += 1) {
      healthDataStore.addRecord(mockRecord(i, { highRisk: true }))
    }
    const records = healthDataStore.getRecords(60)
    const result = await predictionEngine.predict(records, await healthDataStore.getUserProfile())
    expect(result.recordsAnalyzed).toBeGreaterThanOrEqual(20)
  }, 25000)
})
