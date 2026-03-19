import { DISEASE_MODELS, FEATURE_NAMES } from './modelWeights.js'

const DISEASE_KEYS = Object.keys(DISEASE_MODELS)

let llmQueue = Promise.resolve()

function enqueueLLM(task) {
  llmQueue = llmQueue
    .then(() => new Promise((resolve) => setTimeout(resolve, 2000)))
    .then(task)
    .catch(() => null)
  return llmQueue
}

const clamp01 = (v) => Math.max(0, Math.min(1, Number(v) || 0))

const DISEASE_PRIORS = {
  hypertension: 0.22,
  type2_diabetes: 0.14,
  cardiovascular: 0.16,
  respiratory: 0.11,
  stress_disorder: 0.18,
  sleep_apnea: 0.12,
  metabolic_syndrome: 0.17,
  atrial_fibrillation: 0.06,
  coronary_artery_disease: 0.09,
  heart_failure: 0.05,
  peripheral_artery_disease: 0.05,
  type1_diabetes: 0.03,
  prediabetes: 0.19,
  hypothyroidism: 0.08,
  hyperthyroidism: 0.04,
  gout: 0.05,
  chronic_obstructive_pulmonary_disease: 0.06,
  asthma: 0.08,
  pulmonary_hypertension: 0.03,
  major_depressive_disorder: 0.12,
  generalized_anxiety_disorder: 0.14,
  burnout_syndrome: 0.16,
  migraine_disorder: 0.09,
  chronic_kidney_disease: 0.07,
  adrenal_fatigue: 0.08,
  polycystic_ovary_syndrome: 0.07,
  osteoporosis: 0.06,
  fibromyalgia: 0.06,
  irritable_bowel_syndrome: 0.08,
  non_alcoholic_fatty_liver: 0.1,
}

const CALIBRATION_PARAMS = {
  hypertension: { a: 1.15, b: -0.05 },
  type2_diabetes: { a: 1.2, b: -0.08 },
  cardiovascular: { a: 1.1, b: -0.04 },
  respiratory: { a: 1.05, b: -0.02 },
  stress_disorder: { a: 0.95, b: 0.01 },
  sleep_apnea: { a: 1.0, b: 0 },
  metabolic_syndrome: { a: 1.08, b: -0.02 },
}

function logit(probability) {
  const clipped = Math.max(0.001, Math.min(0.999, probability))
  return Math.log(clipped / (1 - clipped))
}

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value))
}

function normalizeLifestyle(lifestyle) {
  return String(lifestyle || '').trim().toLowerCase()
}

export function getProfileAdjustedWeights(disease, userProfile = {}) {
  const model = DISEASE_MODELS[disease]
  if (!model) return null

  const adjustedWeights = [...model.weights]
  const age = Number(userProfile.age) || 0
  const bmi = Number(userProfile.bmi) || 0
  const lifestyle = normalizeLifestyle(userProfile.lifestyle)
  const smoker = Boolean(userProfile.smoker)
  const medicationCount = Array.isArray(userProfile.medications) ? userProfile.medications.length : 0

  FEATURE_NAMES.forEach((featureName, index) => {
    if (featureName === 'age_normalized' && age >= 55) adjustedWeights[index] *= 1.1
    if (featureName === 'bmi_normalized' && bmi >= 30) adjustedWeights[index] *= 1.08
    if (featureName === 'lifestyle_encoded' && lifestyle === 'sedentary') adjustedWeights[index] *= 0.85
    if (featureName === 'on_respiratory_medication' && smoker) adjustedWeights[index] *= 1.18
    if (featureName === 'medication_count' && medicationCount >= 3) adjustedWeights[index] *= 1.07
  })

  const biasShift = age >= 60 ? 0.08 : age >= 45 ? 0.04 : 0
  return {
    weights: adjustedWeights,
    bias: model.bias + biasShift,
  }
}

export function ruleBasedScore(_, __, featureMap = {}) {
  const f = featureMap
  const s = Object.fromEntries(DISEASE_KEYS.map((disease) => [disease, 0]))

  if (f.systolic_mean > 130) s.hypertension += 0.3
  if (f.systolic_mean > 140) s.hypertension += 0.2
  if (f.diastolic_mean > 85) s.hypertension += 0.2
  if (f.pulse_pressure > 60) s.hypertension += 0.15
  if (f.age_normalized > 0.5) s.hypertension += 0.1
  if (f.bmi_normalized > 0.7) s.hypertension += 0.05

  if (f.bloodSugar_mean > 110) s.type2_diabetes += 0.25
  if (f.bloodSugar_mean > 126) s.type2_diabetes += 0.25
  if (f.bloodSugar_max > 140) s.type2_diabetes += 0.2
  if (f.bmi_normalized > 0.75) s.type2_diabetes += 0.15
  if (f.age_normalized > 0.45) s.type2_diabetes += 0.1
  if (f.lifestyle_encoded < 0.3) s.type2_diabetes += 0.05

  if (f.cardiac_stress_index > 2.5) s.cardiovascular += 0.25
  if (f.hrv_mean < 30) s.cardiovascular += 0.25
  if (f.systolic_mean > 135) s.cardiovascular += 0.2
  if (f.heartRate_mean > 90) s.cardiovascular += 0.15
  if (f.mean_arterial_pressure > 100) s.cardiovascular += 0.15

  if (f.spo2_mean < 96) s.respiratory += 0.3
  if (f.spo2_min < 94) s.respiratory += 0.3
  if (f.respiratoryRate_mean > 20) s.respiratory += 0.2
  if (f.oxygen_debt_score > 15) s.respiratory += 0.2

  if (f.stress_level_mean > 60) s.stress_disorder += 0.3
  if (f.hrv_mean < 35) s.stress_disorder += 0.25
  if (f.sleep_score_mean < 60) s.stress_disorder += 0.25
  if (f.heartRate_std > 15) s.stress_disorder += 0.2

  if (f.sleep_score_mean < 55) s.sleep_apnea += 0.3
  if (f.spo2_min < 95) s.sleep_apnea += 0.3
  if (f.hrv_std > 20) s.sleep_apnea += 0.2
  if (f.bmi_normalized > 0.7) s.sleep_apnea += 0.2

  if (f.metabolic_load > 1.3) s.metabolic_syndrome += 0.3
  if (f.bloodSugar_mean > 100) s.metabolic_syndrome += 0.2
  if (f.systolic_mean > 130) s.metabolic_syndrome += 0.2
  if (f.bmi_normalized > 0.65) s.metabolic_syndrome += 0.2
  if (f.lifestyle_encoded < 0.4) s.metabolic_syndrome += 0.1

  if (f.hrv_std > 18) s.atrial_fibrillation += 0.35
  if (f.heartRate_std > 18) s.atrial_fibrillation += 0.25
  if (f.hr_violations_count > 5) s.atrial_fibrillation += 0.25
  if (f.age_normalized > 0.55) s.atrial_fibrillation += 0.1

  if (f.age_x_systolic > 65) s.coronary_artery_disease += 0.25
  if (f.cardiac_stress_index > 3.2) s.coronary_artery_disease += 0.25
  if (f.hrv_mean < 28) s.coronary_artery_disease += 0.2
  if (f.bp_x_hr > 11000) s.coronary_artery_disease += 0.2

  if (f.oxygen_debt_score > 35) s.heart_failure += 0.3
  if (f.recovery_capacity < 20) s.heart_failure += 0.3
  if (f.respiratoryRate_mean > 22) s.heart_failure += 0.2
  if (f.steps_per_minute < 2) s.heart_failure += 0.1

  if (f.bloodSugar_std > 18 && f.age_normalized < 0.3) s.type1_diabetes += 0.35
  if (f.on_diabetes_medication > 0) s.type1_diabetes += 0.25
  if (f.bmi_normalized < 0.55) s.type1_diabetes += 0.15

  if (f.bloodSugar_mean > 100 && f.bloodSugar_mean <= 126) s.prediabetes += 0.35
  if (f.bmi_normalized > 0.6) s.prediabetes += 0.2
  if (f.metabolic_load > 1.15) s.prediabetes += 0.2

  if (f.bodyTemp_mean < 36.5) s.hypothyroidism += 0.25
  if (f.heartRate_mean < 60) s.hypothyroidism += 0.25
  if (f.steps_per_minute < 3) s.hypothyroidism += 0.15

  if (f.bodyTemp_max > 37.4) s.hyperthyroidism += 0.25
  if (f.heartRate_mean > 95) s.hyperthyroidism += 0.25
  if (f.thermal_stress > 3) s.hyperthyroidism += 0.2

  if (f.spo2_mean < 95 && f.respiratoryRate_mean > 18) s.chronic_obstructive_pulmonary_disease += 0.35
  if (f.spo2_10rec_min < 94) s.chronic_obstructive_pulmonary_disease += 0.25
  if (f.steps_per_minute < 3) s.chronic_obstructive_pulmonary_disease += 0.15

  if (f.respiratoryRate_std > 2.5) s.asthma += 0.3
  if (f.spo2_10rec_min < 95) s.asthma += 0.2
  if (f.activity_intensity_encoded > 1.2) s.asthma += 0.15

  if (f.stress_level_mean > 65 && f.hrv_mean < 30) s.generalized_anxiety_disorder += 0.3
  if (f.heartRate_std > 14) s.generalized_anxiety_disorder += 0.2
  if (f.sleep_score_mean < 60) s.generalized_anxiety_disorder += 0.15

  if (f.sleep_score_mean < 60 && f.steps_per_minute < 4) s.major_depressive_disorder += 0.3
  if (f.recovery_capacity < 22) s.major_depressive_disorder += 0.25
  if (f.activity_intensity_encoded < 0.5) s.major_depressive_disorder += 0.15

  if (f.sleep_x_stress > 3500) s.burnout_syndrome += 0.3
  if (f.hrv_trend < -1.5) s.burnout_syndrome += 0.2
  if (f.recovery_capacity < 18) s.burnout_syndrome += 0.2

  if (f.bp_violations_count > 6 && f.on_antihypertensive > 0) s.chronic_kidney_disease += 0.25
  if (f.sugar_violations_count > 6 && f.on_diabetes_medication > 0) s.chronic_kidney_disease += 0.25
  if (f.age_normalized > 0.5) s.chronic_kidney_disease += 0.15

  if (f.gender_encoded === 0 && f.bmi_x_sugar > 55) s.polycystic_ovary_syndrome += 0.35
  if (f.metabolic_load > 1.2) s.polycystic_ovary_syndrome += 0.2

  if (f.age_normalized > 0.6 && f.active_minutes_mean < 25) s.osteoporosis += 0.3
  if (f.gender_encoded === 0 && f.bmi_normalized < 0.55) s.osteoporosis += 0.2

  if (f.sleep_score_mean < 60 && f.stress_level_mean > 60) s.fibromyalgia += 0.25
  if (f.hrv_std > 18) s.fibromyalgia += 0.2

  if (f.stress_level_mean > 60 && f.autonomic_balance < 0.4) s.irritable_bowel_syndrome += 0.3
  if (f.sleep_score_mean < 60) s.irritable_bowel_syndrome += 0.1

  if (f.bmi_normalized > 0.7 && f.metabolic_load > 1.25) s.non_alcoholic_fatty_liver += 0.3
  if (f.steps_per_minute < 4) s.non_alcoholic_fatty_liver += 0.15

  return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, clamp01(v)]))
}

function stripJson(text) {
  return String(text || '').replace(/```json|```/gi, '').trim()
}

function timeoutPromise(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

  const req = fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 500,
      messages: [
        { role: 'system', content: 'Respond with JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  })

  const response = await Promise.race([req, timeoutPromise(8000)])
  if (!response.ok) return null
  const data = await response.json()
  const content = stripJson(data?.choices?.[0]?.message?.content)
  return JSON.parse(content)
}

function buildLLMPrompt(featureMap, topRisks, userProfile) {
  const profile = userProfile || {}
  const conditions = Array.isArray(profile.conditions) ? profile.conditions.join(', ') : 'none'
  const meds = Array.isArray(profile.medications) ? profile.medications.join(', ') : 'none'
  const responseShape = `{${DISEASE_KEYS.map((key) => `'${key}':0.0`).join(', ')},'reasoning':'...'}`

  return [
    'You are a medical AI analyzing patient health patterns.',
    `Patient Profile: ${profile.age || 30}yo ${profile.gender || 'other'}, BMI ${profile.bmi || 24}, ${profile.lifestyle || 'moderate'} lifestyle`,
    `Known conditions: ${conditions}`,
    `Current medications: ${meds}`,
    'Health Pattern Analysis (last 3 minutes of wearable data):',
    `- Heart Rate: ${featureMap.heartRate_mean?.toFixed(2)}±${featureMap.heartRate_std?.toFixed(2)} bpm, trend: ${featureMap.heartRate_trend?.toFixed(4)}`,
    `- HRV: ${featureMap.hrv_mean?.toFixed(2)}ms (autonomic balance: ${featureMap.autonomic_balance?.toFixed(2)})`,
    `- SpO2: ${featureMap.spo2_mean?.toFixed(2)}% (min: ${featureMap.spo2_min?.toFixed(2)}%)`,
    `- Blood Pressure: ${featureMap.systolic_mean?.toFixed(2)}/${featureMap.diastolic_mean?.toFixed(2)} mmHg (MAP: ${featureMap.mean_arterial_pressure?.toFixed(2)})`,
    `- Blood Sugar: ${featureMap.bloodSugar_mean?.toFixed(2)} mg/dL`,
    `- Temperature: ${featureMap.bodyTemp_mean?.toFixed(2)}C`,
    `- Stress Level: ${featureMap.stress_level_mean?.toFixed(2)}/100, Sleep Score: ${featureMap.sleep_score_mean?.toFixed(2)}/100`,
    `- Activity Intensity: ${featureMap.activity_intensity_encoded?.toFixed(2)}, Cardiac Stress Index: ${featureMap.cardiac_stress_index?.toFixed(2)}`,
    `Rule-based model flagged these risks: ${topRisks.map((r) => `${r.disease}:${r.score.toFixed(2)}`).join(', ')}`,
    'Based ONLY on the data patterns above, assess the probability (0.0-1.0) for each condition.',
    `Respond ONLY with valid JSON: ${responseShape}`,
  ].join('\n')
}

export async function llmAnalyze(_, __, topRisks, userProfile, featureMap) {
  try {
    const prompt = buildLLMPrompt(featureMap || {}, topRisks || [], userProfile || {})
    const parsed = await enqueueLLM(() => callGroq(prompt))
    if (!parsed || typeof parsed !== 'object') return null

    const scores = {}
    DISEASE_KEYS.forEach((k) => {
      scores[k] = clamp01(parsed[k])
    })
    scores.reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning : null
    return scores
  } catch {
    return null
  }
}

export function applyBayesianCorrection(disease, probability, userProfile = {}) {
  const prior = DISEASE_PRIORS[disease] ?? 0.08
  let adjustedPrior = prior

  if ((Number(userProfile.age) || 0) >= 55 && ['hypertension', 'cardiovascular', 'coronary_artery_disease', 'chronic_kidney_disease'].includes(disease)) {
    adjustedPrior += 0.04
  }

  if ((Number(userProfile.bmi) || 0) >= 30 && ['type2_diabetes', 'metabolic_syndrome', 'non_alcoholic_fatty_liver'].includes(disease)) {
    adjustedPrior += 0.05
  }

  if (userProfile.smoker && ['respiratory', 'chronic_obstructive_pulmonary_disease', 'coronary_artery_disease'].includes(disease)) {
    adjustedPrior += 0.05
  }

  adjustedPrior = Math.max(0.01, Math.min(0.45, adjustedPrior))
  const priorShift = adjustedPrior - prior
  return clamp01(probability + priorShift * 0.75)
}

export function calibrateProbability(disease, probability) {
  const params = CALIBRATION_PARAMS[disease] || { a: 1, b: 0 }
  return clamp01(sigmoid(params.a * logit(probability) + params.b))
}

export function combineModels(ruleScores, lrScores, llmScores) {
  const combined = {}

  DISEASE_KEYS.forEach((disease) => {
    const rule = clamp01(ruleScores[disease])
    const lr = clamp01(lrScores[disease])
    const llm = llmScores ? clamp01(llmScores[disease]) : null

    const probability = llm === null
      ? clamp01(rule * 0.5 + lr * 0.5)
      : clamp01(rule * 0.3 + lr * 0.3 + llm * 0.4)

    const arr = llm === null ? [rule, lr] : [rule, lr, llm]
    const m = arr.reduce((s, v) => s + v, 0) / arr.length
    const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length
    const agreement = clamp01(1 - Math.sqrt(variance))
    const confidence = clamp01(probability * 0.6 + agreement * 0.4)

    combined[disease] = {
      probability,
      confidence,
      components: { rule, lr, llm },
    }
  })

  return combined
}

export function getRiskLevel(probability) {
  if (probability >= 0.75) return 'CRITICAL'
  if (probability >= 0.55) return 'HIGH'
  if (probability >= 0.35) return 'MODERATE'
  if (probability >= 0.15) return 'LOW'
  return 'MINIMAL'
}

export function getCurrentProvider() {
  if (process.env.GROQ_API_KEY) return 'groq'
  return 'none'
}

export { FEATURE_NAMES }
