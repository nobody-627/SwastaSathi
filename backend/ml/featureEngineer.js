import { FEATURE_NAMES } from './modelWeights.js'

const MED_MAP = {
  antihypertensive: ['amlodipine', 'lisinopril', 'metoprolol', 'atenolol', 'losartan', 'valsartan', 'ramipril', 'hydrochlorothiazide'],
  diabetes: ['metformin', 'insulin', 'glipizide', 'sitagliptin', 'empagliflozin'],
  cardiac: ['aspirin', 'warfarin', 'clopidogrel', 'digoxin', 'furosemide'],
  respiratory: ['salbutamol', 'budesonide', 'montelukast', 'theophylline'],
}

const ACTIVITY_ENCODING = {
  resting: 0,
  walking: 1,
  cycling: 2,
  running: 3,
}

const safeNum = (v, d = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

const mean = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0)
const min = (arr) => (arr.length ? Math.min(...arr) : 0)
const max = (arr) => (arr.length ? Math.max(...arr) : 0)
const std = (arr) => {
  if (!arr.length) return 0
  const m = mean(arr)
  const variance = mean(arr.map((v) => (v - m) ** 2))
  return Math.sqrt(variance)
}
const tail = (arr, count) => arr.slice(Math.max(0, arr.length - count))

export function getTrendSlope(values) {
  if (!Array.isArray(values) || values.length < 2) return 0
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = mean(values)
  let num = 0
  let den = 0
  for (let i = 0; i < n; i += 1) {
    const dx = i - xMean
    num += dx * (values[i] - yMean)
    den += dx * dx
  }
  return den === 0 ? 0 : num / den
}

export function medicationCategories(medicationNames = []) {
  const meds = medicationNames.map((m) => String(m || '').toLowerCase())
  const has = (key) => MED_MAP[key].some((needle) => meds.some((m) => m.includes(needle)))
  return {
    on_antihypertensive: has('antihypertensive') ? 1 : 0,
    on_diabetes_medication: has('diabetes') ? 1 : 0,
    on_cardiac_medication: has('cardiac') ? 1 : 0,
    on_respiratory_medication: has('respiratory') ? 1 : 0,
    medication_count: meds.filter(Boolean).length,
  }
}

function pick(records, selector) {
  return records.map(selector).map((v) => safeNum(v, 0))
}

function profileFeatures(profile = {}) {
  const gender = String(profile.gender || '').toLowerCase()
  const lifestyle = String(profile.lifestyle || '').toLowerCase()
  const conditions = Array.isArray(profile.conditions) ? profile.conditions : []

  return {
    age_normalized: safeNum(profile.age, 30) / 100,
    bmi_normalized: safeNum(profile.bmi, 24) / 40,
    gender_encoded: gender === 'male' ? 1 : gender === 'female' ? 0 : 0.5,
    lifestyle_encoded: lifestyle === 'active' ? 1 : lifestyle === 'moderate' ? 0.5 : 0,
    known_conditions_count: conditions.length,
  }
}

function violationCounts(records) {
  let hr = 0
  let spo2 = 0
  let bp = 0
  let sugar = 0
  let temp = 0

  records.forEach((r) => {
    const v = r.vitals || {}
    if (safeNum(v.heartRate, 72) > 100 || safeNum(v.heartRate, 72) < 60) hr += 1
    if (safeNum(v.spo2, 98) < 95) spo2 += 1
    if (safeNum(v.bloodPressure?.systolic, 120) > 140 || safeNum(v.bloodPressure?.diastolic, 80) > 90) bp += 1
    if (safeNum(v.bloodSugar, 95) > 140 || safeNum(v.bloodSugar, 95) < 70) sugar += 1
    if (safeNum(v.bodyTemperature, 37) > 37.5 || safeNum(v.bodyTemperature, 37) < 36.5) temp += 1
  })

  return {
    hr_violations_count: hr,
    spo2_violations_count: spo2,
    bp_violations_count: bp,
    sugar_violations_count: sugar,
    temp_violations_count: temp,
  }
}

export function engineerFeatures(records = []) {
  const window = records.slice(-60)
  const first = window[0] || {}
  const last = window[window.length - 1] || {}
  const lastTimestamp = new Date(last.timestamp || Date.now())

  const heartRate = pick(window, (r) => r?.vitals?.heartRate)
  const hrv = pick(window, (r) => r?.vitals?.hrv)
  const spo2 = pick(window, (r) => r?.vitals?.spo2)
  const systolic = pick(window, (r) => r?.vitals?.bloodPressure?.systolic)
  const diastolic = pick(window, (r) => r?.vitals?.bloodPressure?.diastolic)
  const bloodSugar = pick(window, (r) => r?.vitals?.bloodSugar)
  const bodyTemp = pick(window, (r) => r?.vitals?.bodyTemperature)
  const respiratoryRate = pick(window, (r) => r?.vitals?.respiratoryRate)
  const stressLevel = pick(window, (r) => r?.activity?.stressLevel)
  const sleepScore = pick(window, (r) => r?.activity?.sleepScore)
  const stepsArr = pick(window, (r) => r?.activity?.steps)
  const calArr = pick(window, (r) => r?.activity?.caloriesBurned)
  const activeMinutesArr = pick(window, (r) => r?.activity?.activeMinutes)
  const activityEncodedArr = window.map((r) => ACTIVITY_ENCODING[String(r?.activity?.type || '').toLowerCase()] ?? 0)
  const heartRate10 = tail(heartRate, 10)
  const heartRate30 = tail(heartRate, 30)
  const spo210 = tail(spo2, 10)
  const stress10 = tail(stressLevel, 10)
  const hrv10 = tail(hrv, 10)

  const windowMinutes = Math.max(1, window.length * 3 / 60)
  const stepsDelta = Math.max(0, safeNum(last?.activity?.steps, 0) - safeNum(first?.activity?.steps, 0))
  const caloriesDelta = Math.max(0, safeNum(last?.activity?.caloriesBurned, 0) - safeNum(first?.activity?.caloriesBurned, 0))
  const activeMinutes = Math.max(1, safeNum(last?.activity?.activeMinutes, 1))

  const systolicMean = mean(systolic)
  const diastolicMean = mean(diastolic)
  const pulsePressure = systolicMean - diastolicMean
  const map = diastolicMean + pulsePressure / 3
  const hrvMean = mean(hrv)
  const heartRateMean = mean(heartRate)
  const spo2Mean = mean(spo2)
  const respMean = mean(respiratoryRate)
  const sugarMean = mean(bloodSugar)
  const tempMean = mean(bodyTemp)
  const sleepMean = mean(sleepScore)

  const derived = {
    pulse_pressure: pulsePressure,
    mean_arterial_pressure: map,
    cardiac_stress_index: heartRateMean / Math.max(1, hrvMean),
    autonomic_balance: hrvMean / Math.max(1, heartRateMean),
    oxygen_debt_score: (100 - spo2Mean) * respMean,
    metabolic_load: (sugarMean / 100) * (heartRateMean / 70),
    thermal_stress: Math.abs(tempMean - 37.0) * 10,
    recovery_capacity: hrvMean * (sleepMean / 100),
    active_minutes_mean: mean(activeMinutesArr),
  }

  const meds = medicationCategories(last?.medications || [])
  const profile = profileFeatures(last?.profile || {})
  const violations = violationCounts(window)
  const timeOfDayEncoded = lastTimestamp.getHours() / 23
  const hrMean = Math.max(1, Math.abs(heartRateMean))
  const hrvMeanSafe = Math.max(1, Math.abs(hrvMean))
  const spo2MeanSafe = Math.max(1, Math.abs(spo2Mean))
  const readingConsistencyScore = Math.max(
    0,
    1 - Math.min(1, (std(heartRate) / hrMean + std(spo2) / spo2MeanSafe + std(hrv) / hrvMeanSafe) / 3),
  )
  const vitalsCoefficientOfVariation = (
    std(heartRate) / hrMean +
    std(hrv) / hrvMeanSafe +
    std(spo2) / spo2MeanSafe
  ) / 3

  const featureMap = {
    heartRate_mean: heartRateMean,
    heartRate_std: std(heartRate),
    heartRate_trend: getTrendSlope(heartRate),
    hrv_mean: hrvMean,
    hrv_std: std(hrv),
    hrv_trend: getTrendSlope(hrv),
    spo2_mean: spo2Mean,
    spo2_min: min(spo2),
    spo2_std: std(spo2),
    systolic_mean: systolicMean,
    systolic_std: std(systolic),
    systolic_max: max(systolic),
    diastolic_mean: diastolicMean,
    diastolic_std: std(diastolic),
    bloodSugar_mean: sugarMean,
    bloodSugar_std: std(bloodSugar),
    bloodSugar_max: max(bloodSugar),
    bodyTemp_mean: tempMean,
    bodyTemp_max: max(bodyTemp),
    respiratoryRate_mean: respMean,
    respiratoryRate_std: std(respiratoryRate),
    steps_per_minute: stepsDelta / windowMinutes,
    activity_intensity_encoded: mean(activityEncodedArr),
    stress_level_mean: mean(stressLevel),
    stress_level_trend: getTrendSlope(stressLevel),
    sleep_score_mean: sleepMean,
    calories_rate: caloriesDelta / activeMinutes,
    ...derived,
    ...meds,
    ...profile,
    ...violations,
    age_x_systolic: profile.age_normalized * systolicMean,
    bmi_x_sugar: profile.bmi_normalized * sugarMean,
    hrv_x_stress: hrvMean * mean(stressLevel),
    spo2_x_respRate: spo2Mean * respMean,
    age_x_hrv: profile.age_normalized * hrvMean,
    sleep_x_stress: sleepMean * mean(stressLevel),
    bp_x_hr: systolicMean * heartRateMean,
    medication_x_risk: meds.medication_count * (violations.bp_violations_count + violations.sugar_violations_count),
    time_of_day_encoded: timeOfDayEncoded,
    reading_consistency_score: readingConsistencyScore,
    vitals_coefficient_of_variation: vitalsCoefficientOfVariation,
    heartRate_10rec_mean: mean(heartRate10),
    heartRate_10rec_std: std(heartRate10),
    heartRate_30rec_mean: mean(heartRate30),
    heartRate_30rec_std: std(heartRate30),
    spo2_10rec_min: min(spo210),
    stress_10rec_mean: mean(stress10),
    hrv_10rec_mean: mean(hrv10),
  }

  const vector = FEATURE_NAMES.map((name) => {
    const n = safeNum(featureMap[name], 0)
    if (!Number.isFinite(n)) return 0
    return Math.max(-10, Math.min(10, n))
  })

  return { vector, names: FEATURE_NAMES, map: featureMap }
}

export default {
  engineerFeatures,
  getTrendSlope,
  medicationCategories,
}
