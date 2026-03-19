import { DISEASE_CATEGORIES } from './modelWeights.js'

function normalizeCategory(category) {
  return String(category || 'other')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
}

const CATEGORY_LIMITS = {
  cardiovascular: 1,
  respiratory: 1,
  mental_health: 1,
  metabolic: 1,
  renal_endocrine: 1,
  inflammatory: 1,
  neurologic: 1,
  reproductive: 1,
  musculoskeletal: 1,
  gastrointestinal: 1,
  hepatic: 1,
  other: 1,
}

const MEDICATION_HINTS = {
  hypertension: ['amlodipine', 'losartan', 'telmisartan', 'metoprolol', 'atenolol'],
  type2_diabetes: ['metformin', 'glimepiride', 'insulin', 'semaglutide'],
  type1_diabetes: ['insulin'],
  hyperthyroidism: ['carbimazole', 'methimazole', 'propylthiouracil'],
  hypothyroidism: ['levothyroxine', 'thyroxine'],
  asthma: ['salbutamol', 'budesonide', 'formoterol'],
  chronic_obstructive_pulmonary_disease: ['tiotropium', 'salbutamol', 'formoterol'],
  atrial_fibrillation: ['apixaban', 'rivaroxaban', 'warfarin', 'amiodarone'],
}

function medicationList(userProfile = {}) {
  return Array.isArray(userProfile.medications)
    ? userProfile.medications.map((item) => String(item).toLowerCase())
    : []
}

function isMedicationConfirmed(diseaseKey, userProfile) {
  const hints = MEDICATION_HINTS[diseaseKey] || []
  const meds = medicationList(userProfile)
  return hints.some((medication) => meds.some((entry) => entry.includes(medication)))
}

function scoreSeverity(disease) {
  return disease.isAcute ? 15 : 0
}

function scoreTrend(disease) {
  const positiveTrend = disease.trend === 'up' || disease.historyTrend === 'up'
  return positiveTrend ? 8 : 0
}

function scoreProfileMatch(disease, userProfile = {}) {
  let score = 0

  if (userProfile.age >= 55 && ['cardiovascular', 'metabolic', 'renal_endocrine'].includes(disease.category)) {
    score += 7
  }

  if (userProfile.smoker && ['respiratory', 'cardiovascular'].includes(disease.category)) {
    score += 8
  }

  if (userProfile.gender === 'female' && ['reproductive', 'renal_endocrine'].includes(disease.category)) {
    score += 12
  }

  return score
}

function buildFilteredDisease(disease, userProfile) {
  const medicationConfirmed = isMedicationConfirmed(disease.disease, userProfile)
  const relevance =
    disease.probability * 0.75 +
    disease.confidence * 0.15 +
    scoreSeverity(disease) +
    scoreTrend(disease) +
    scoreProfileMatch(disease, userProfile) +
    (medicationConfirmed ? 12 : 0)

  const whyShown = []

  if (disease.isAcute) whyShown.push('acute-risk')
  if (disease.trend === 'up' || disease.historyTrend === 'up') whyShown.push('rising-trend')
  if (medicationConfirmed) whyShown.push('medication-match')
  if (disease.probability >= 70) whyShown.push('high-probability')
  if (disease.confidence >= 70) whyShown.push('high-confidence')

  return {
    ...disease,
    category: normalizeCategory(disease.category || DISEASE_CATEGORIES[disease.disease]),
    medicationConfirmed,
    relevanceScore: Number(relevance.toFixed(2)),
    whyShown,
  }
}

function dedupeByCategory(diseases, suppressed, filterTrace) {
  const byCategory = new Map()

  for (const disease of diseases) {
    const current = byCategory.get(disease.category) || []
    current.push(disease)
    byCategory.set(disease.category, current)
  }

  const featured = []

  for (const [category, categoryDiseases] of byCategory.entries()) {
    const limit = CATEGORY_LIMITS[category] || 1
    const sorted = [...categoryDiseases].sort((left, right) => right.relevanceScore - left.relevanceScore)

    featured.push(...sorted.slice(0, limit))

    for (const extra of sorted.slice(limit)) {
      suppressed.push({ ...extra, suppressedReason: `deduped-${category}` })
      filterTrace.push(`${extra.disease}:deduped_in_${category}`)
    }
  }

  return featured
}

function applyContextOverrides(featured, suppressed, filterTrace) {
  const acuteSuppressed = suppressed.filter((disease) => disease.isAcute && disease.probability >= 58)

  for (const disease of acuteSuppressed) {
    featured.push({ ...disease, whyShown: [...new Set([...(disease.whyShown || []), 'acute-override'])] })
    filterTrace.push(`${disease.disease}:acute_override`)
  }

  return featured
}

export function smartFilterPredictions(predictions, userProfile = {}) {
  const filterTrace = []
  const suppressed = []

  const thresholded = predictions.filter((prediction) => {
    const shouldKeep = prediction.probability >= 33 || prediction.isAcute
    if (!shouldKeep) {
      suppressed.push({ ...prediction, suppressedReason: 'below-threshold' })
      filterTrace.push(`${prediction.disease}:below_threshold`)
    }
    return shouldKeep
  })

  const scored = thresholded.map((prediction) => buildFilteredDisease(prediction, userProfile))
  const deduped = dedupeByCategory(scored, suppressed, filterTrace)
  const withOverrides = applyContextOverrides(deduped, suppressed, filterTrace)

  const finalFeatured = withOverrides
    .filter((prediction) => {
      const keep = prediction.probability >= 42 || prediction.medicationConfirmed || prediction.isAcute
      if (!keep) {
        suppressed.push({ ...prediction, suppressedReason: 'final-confidence-gate' })
        filterTrace.push(`${prediction.disease}:final_gate`)
      }
      return keep
    })
    .sort((left, right) => right.relevanceScore - left.relevanceScore)
    .slice(0, 3)

  const suppressedList = suppressed
    .sort((left, right) => right.probability - left.probability)
    .map((prediction) => ({
      disease: prediction.disease,
      probability: prediction.probability,
      suppressedReason: prediction.suppressedReason,
      category: normalizeCategory(prediction.category || DISEASE_CATEGORIES[prediction.disease]),
    }))

  return {
    predictions: finalFeatured,
    suppressed,
    suppressedList,
    filterTrace,
  }
}
