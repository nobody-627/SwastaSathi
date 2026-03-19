import FeatureEngineer from './featureEngineer.js'
import LogisticRegression from './logisticRegression.js'
import { DISEASE_MODELS, FEATURE_NAMES, DISEASE_CATEGORIES } from './modelWeights.js'
import {
  ruleBasedScore,
  llmAnalyze,
  combineModels,
  getRiskLevel,
  getCurrentProvider,
  applyBayesianCorrection,
  calibrateProbability,
  getProfileAdjustedWeights,
} from './diseaseRiskModel.js'
import { smartFilterPredictions } from './smartFilter.js'
import { getRecommendations, DISEASE_INFO } from './recommendationsEngine.js'

function formatDiseaseName(k) {
  return DISEASE_INFO[k]?.displayName || k
}

function topRisks(scores, n = 3) {
  return Object.entries(scores)
    .map(([disease, score]) => ({ disease, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
}

function safeVector(vector = []) {
  return vector.map((v) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return 0
    return Math.max(-10, Math.min(10, n))
  })
}

function dataQuality(records = []) {
  const issues = []
  if (!records.length) return { score: 0, issues: ['No records available'] }

  let missing = 0
  let outliers = 0
  let gaps = 0
  for (let i = 0; i < records.length; i += 1) {
    const rec = records[i]
    const v = rec.vitals || {}
    if (
      !Number.isFinite(v.heartRate)
      || !Number.isFinite(v.hrv)
      || !Number.isFinite(v.spo2)
      || !Number.isFinite(v.bodyTemperature)
      || !Number.isFinite(v.respiratoryRate)
    ) missing += 1
    if ((v.heartRate ?? 70) > 220 || (v.heartRate ?? 70) < 25 || (v.spo2 ?? 98) > 100 || (v.spo2 ?? 98) < 50) outliers += 1

    if (i > 0) {
      const dt = new Date(rec.timestamp).getTime() - new Date(records[i - 1].timestamp).getTime()
      if (Number.isFinite(dt) && dt > 15000) gaps += 1
    }
  }

  if (missing > 0) issues.push(`Missing vital fields in ${missing} records`)
  if (outliers > 0) issues.push(`Outlier values in ${outliers} records`)
  if (gaps > 0) issues.push(`Timestamp gaps detected: ${gaps}`)

  const penalty = Math.min(80, missing * 2 + outliers * 3 + gaps * 2)
  return { score: Math.max(20, 100 - penalty), issues }
}

class PredictionEngine {
  constructor() {
    this.featureEngineer = FeatureEngineer
    this.logisticModels = Object.fromEntries(
      Object.entries(DISEASE_MODELS).map(([disease, cfg]) => [disease, cfg]),
    )
    this.predictionHistory = []
    this.minRecordsRequired = 20
    this.lastPredictionTime = null
    this.predictionIntervalMs = 12000
    this.latestFeatures = null
  }

  getTrendFromHistory(disease) {
    if (this.predictionHistory.length < 6) return 'stable'
    const current = this.predictionHistory[this.predictionHistory.length - 1]?.allScores?.[disease]?.probability || 0
    const past = this.predictionHistory[this.predictionHistory.length - 6]?.allScores?.[disease]?.probability || current
    if (current - past > 0.05) return 'increasing'
    if (past - current > 0.05) return 'decreasing'
    return 'stable'
  }

  getTopContributingFeatures(vector, names, disease) {
    const model = this.logisticModels[disease]
    if (!model) return []
    const contributions = names.map((name, i) => ({
      name,
      contribution: Math.abs((model.weights[i] || 0) * (vector[i] || 0)),
    }))
    return contributions
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3)
      .map((x) => x.name)
  }

  getDiseaseRecommendations(disease, probability) {
    return getRecommendations(disease, probability)
  }

  async predict(records, userProfile) {
    try {
      if (!Array.isArray(records) || records.length < this.minRecordsRequired) {
        return {
          status: 'insufficient_data',
          message: `Need ${this.minRecordsRequired} records, have ${records?.length || 0}`,
          recordsNeeded: this.minRecordsRequired - (records?.length || 0),
        }
      }

      const { vector, names, map } = this.featureEngineer.engineerFeatures(records)
      const sanitized = safeVector(vector)
      this.latestFeatures = { vector: sanitized, names, map, timestamp: new Date().toISOString() }

      const ruleScores = ruleBasedScore(sanitized, names, map)
      const lrScores = {}
      for (const [disease, modelConfig] of Object.entries(this.logisticModels)) {
        const adjustedModel = getProfileAdjustedWeights(disease, userProfile) || modelConfig
        const model = new LogisticRegression(adjustedModel.weights, adjustedModel.bias, FEATURE_NAMES)
        lrScores[disease] = model.predict(sanitized)
      }

      const top = topRisks(ruleScores, 3)
      const llmScores = await llmAnalyze(sanitized, names, top, userProfile, map)
      const combined = combineModels(ruleScores, lrScores, llmScores)
      const calibrated = Object.fromEntries(
        Object.entries(combined).map(([disease, prediction]) => {
          const posterior = applyBayesianCorrection(disease, prediction.probability, userProfile)
          const probability = calibrateProbability(disease, posterior)
          return [
            disease,
            {
              ...prediction,
              probability,
              confidence: Math.max(prediction.confidence, Math.min(1, prediction.confidence * 0.85 + probability * 0.15)),
            },
          ]
        }),
      )

      const candidatePredictions = Object.entries(calibrated)
        .map(([disease, pred]) => ({
          disease,
          displayName: formatDiseaseName(disease),
          category: DISEASE_CATEGORIES[disease],
          probability: Math.round(pred.probability * 100),
          confidence: Math.round(pred.confidence * 100),
          riskLevel: getRiskLevel(pred.probability),
          trend: this.getTrendFromHistory(disease),
          historyTrend: this.getTrendFromHistory(disease),
          contributing_factors: this.getTopContributingFeatures(sanitized, names, disease),
          recommendations: this.getDiseaseRecommendations(disease, pred.probability * 100),
          isAcute: DISEASE_INFO[disease]?.isAcute || false,
          requiresImmediateCare: DISEASE_INFO[disease]?.requiresImmediateCare || false,
          description: DISEASE_INFO[disease]?.description || null,
        }))
        .sort((a, b) => b.probability - a.probability)

      const filtered = smartFilterPredictions(candidatePredictions, userProfile)

      const enrichedScores = Object.fromEntries(
        Object.entries(calibrated).map(([disease, prediction]) => [
          disease,
          {
            ...prediction,
            category: DISEASE_CATEGORIES[disease],
            displayName: formatDiseaseName(disease),
          },
        ]),
      )

      const result = {
        id: `pred_${Date.now()}`,
        timestamp: new Date().toISOString(),
        recordsAnalyzed: records.length,
        featuresUsed: names.length,
        predictions: filtered.predictions.map((prediction) => ({
          disease: prediction.displayName,
          diseaseKey: prediction.disease,
          probability: prediction.probability,
          confidence: prediction.confidence,
          riskLevel: prediction.riskLevel,
          trend: prediction.trend,
          historyTrend: prediction.historyTrend,
          category: prediction.category,
          whyShown: prediction.whyShown,
          medicationConfirmed: prediction.medicationConfirmed,
          contributing_factors: prediction.contributing_factors,
          recommendations: prediction.recommendations,
          isAcute: prediction.isAcute,
          requiresImmediateCare: prediction.requiresImmediateCare,
          description: prediction.description,
        })),
        allScores: enrichedScores,
        suppressed: filtered.suppressed,
        suppressedList: filtered.suppressedList,
        filterTrace: filtered.filterTrace,
        llmReasoning: llmScores?.reasoning || null,
        dataQuality: dataQuality(records),
        modelVersions: {
          rules: '1.0.0',
          logistic: '2.0.0',
          llm: getCurrentProvider(),
        },
      }

      this.predictionHistory.push(result)
      if (this.predictionHistory.length > 50) this.predictionHistory.shift()
      this.lastPredictionTime = result.timestamp

      return result
    } catch (err) {
      return {
        status: 'model_error',
        message: err.message || 'All models failed',
        predictions: [],
      }
    }
  }
}

const predictionEngine = new PredictionEngine()

export default predictionEngine
