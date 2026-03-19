import { DISEASE_CATEGORIES } from './modelWeights.js'

const DISEASE_INFO = {
  hypertension: { displayName: 'Hypertension', shortName: 'HTN', icon: '🩺', category: DISEASE_CATEGORIES.hypertension, description: 'Persistently elevated blood pressure increases strain on the heart and vessels.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  type2_diabetes: { displayName: 'Type 2 Diabetes', shortName: 'T2D', icon: '🩸', category: DISEASE_CATEGORIES.type2_diabetes, description: 'Insulin resistance raises blood sugar and long-term organ risk.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  cardiovascular: { displayName: 'Cardiovascular Disease', shortName: 'CVD', icon: '🫀', category: DISEASE_CATEGORIES.cardiovascular, description: 'A broad cardiovascular risk pattern suggests heart or vessel strain.', isAcute: false, isReversible: false, requiresImmediateCare: false },
  respiratory: { displayName: 'Respiratory Risk', shortName: 'Resp', icon: '🫁', category: DISEASE_CATEGORIES.respiratory, description: 'Oxygen and breathing patterns suggest respiratory compromise.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  stress_disorder: { displayName: 'Stress Disorder', shortName: 'Stress', icon: '🧠', category: DISEASE_CATEGORIES.stress_disorder, description: 'Chronic autonomic strain may reflect significant stress burden.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  sleep_apnea: { displayName: 'Sleep Apnea', shortName: 'Apnea', icon: '😴', category: DISEASE_CATEGORIES.sleep_apnea, description: 'Night-time oxygen and recovery patterns may indicate breathing interruptions during sleep.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  metabolic_syndrome: { displayName: 'Metabolic Syndrome', shortName: 'Metabolic', icon: '⚖️', category: DISEASE_CATEGORIES.metabolic_syndrome, description: 'Combined sugar, pressure, and weight markers suggest metabolic overload.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  atrial_fibrillation: { displayName: 'Atrial Fibrillation', shortName: 'AFib', icon: '💗', category: DISEASE_CATEGORIES.atrial_fibrillation, description: 'Irregular heart rhythm patterns can increase stroke and heart failure risk.', isAcute: true, isReversible: false, requiresImmediateCare: true },
  coronary_artery_disease: { displayName: 'Coronary Artery Disease', shortName: 'CAD', icon: '🫀', category: DISEASE_CATEGORIES.coronary_artery_disease, description: 'Reduced blood flow to the heart may be developing under sustained vascular stress.', isAcute: true, isReversible: false, requiresImmediateCare: true },
  heart_failure: { displayName: 'Heart Failure', shortName: 'HF', icon: '❤️', category: DISEASE_CATEGORIES.heart_failure, description: 'Low recovery and oxygen burden can signal failing cardiac pump reserve.', isAcute: true, isReversible: false, requiresImmediateCare: true },
  peripheral_artery_disease: { displayName: 'Peripheral Artery Disease', shortName: 'PAD', icon: '🦵', category: DISEASE_CATEGORIES.peripheral_artery_disease, description: 'Circulation strain may be reducing blood flow to the limbs.', isAcute: false, isReversible: false, requiresImmediateCare: false },
  type1_diabetes: { displayName: 'Type 1 Diabetes', shortName: 'T1D', icon: '🩸', category: DISEASE_CATEGORIES.type1_diabetes, description: 'Volatile sugar patterns may reflect insulin deficiency rather than resistance.', isAcute: true, isReversible: false, requiresImmediateCare: true },
  prediabetes: { displayName: 'Prediabetes', shortName: 'Prediabetes', icon: '🍬', category: DISEASE_CATEGORIES.prediabetes, description: 'Early impaired glucose regulation may still be reversible.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  hypothyroidism: { displayName: 'Hypothyroidism', shortName: 'Hypothyroid', icon: '🦋', category: DISEASE_CATEGORIES.hypothyroidism, description: 'Low-temperature and low-energy patterns can suggest underactive thyroid function.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  hyperthyroidism: { displayName: 'Hyperthyroidism', shortName: 'Hyperthyroid', icon: '🔥', category: DISEASE_CATEGORIES.hyperthyroidism, description: 'Persistent heat and fast-heart patterns may indicate thyroid overactivity.', isAcute: true, isReversible: true, requiresImmediateCare: true },
  gout: { displayName: 'Gout', shortName: 'Gout', icon: '🦶', category: DISEASE_CATEGORIES.gout, description: 'Metabolic and medication patterns may increase uric acid-related joint inflammation risk.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  chronic_obstructive_pulmonary_disease: { displayName: 'Chronic Obstructive Pulmonary Disease', shortName: 'COPD', icon: '🫁', category: DISEASE_CATEGORIES.chronic_obstructive_pulmonary_disease, description: 'Chronic low-oxygen and high breathing load suggest obstructive lung disease risk.', isAcute: true, isReversible: false, requiresImmediateCare: true },
  asthma: { displayName: 'Asthma', shortName: 'Asthma', icon: '🌬️', category: DISEASE_CATEGORIES.asthma, description: 'Variable respiratory strain may reflect reactive airway episodes.', isAcute: true, isReversible: true, requiresImmediateCare: true },
  pulmonary_hypertension: { displayName: 'Pulmonary Hypertension', shortName: 'Pulm HTN', icon: '🫁', category: DISEASE_CATEGORIES.pulmonary_hypertension, description: 'Elevated pulmonary pressure risk can emerge when oxygen burden and heart strain coincide.', isAcute: true, isReversible: false, requiresImmediateCare: true },
  major_depressive_disorder: { displayName: 'Major Depressive Disorder', shortName: 'MDD', icon: '🌧️', category: DISEASE_CATEGORIES.major_depressive_disorder, description: 'Persistent low recovery and low activity may reflect depressive physiology.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  generalized_anxiety_disorder: { displayName: 'Generalized Anxiety Disorder', shortName: 'GAD', icon: '😟', category: DISEASE_CATEGORIES.generalized_anxiety_disorder, description: 'Sustained stress and autonomic dysregulation can signal anxiety overload.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  burnout_syndrome: { displayName: 'Burnout Syndrome', shortName: 'Burnout', icon: '🪫', category: DISEASE_CATEGORIES.burnout_syndrome, description: 'Chronic stress with falling recovery suggests systemic burnout.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  migraine_disorder: { displayName: 'Migraine Disorder', shortName: 'Migraine', icon: '💥', category: DISEASE_CATEGORIES.migraine_disorder, description: 'Autonomic instability and stress variation may align with migraine susceptibility.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  chronic_kidney_disease: { displayName: 'Chronic Kidney Disease', shortName: 'CKD', icon: '🧪', category: DISEASE_CATEGORIES.chronic_kidney_disease, description: 'Combined blood pressure and sugar burden can progressively affect kidney function.', isAcute: false, isReversible: false, requiresImmediateCare: false },
  adrenal_fatigue: { displayName: 'Adrenal Fatigue Pattern', shortName: 'Adrenal', icon: '⚡', category: DISEASE_CATEGORIES.adrenal_fatigue, description: 'Stress and recovery collapse may resemble an adrenal exhaustion pattern.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  polycystic_ovary_syndrome: { displayName: 'Polycystic Ovary Syndrome', shortName: 'PCOS', icon: '🌸', category: DISEASE_CATEGORIES.polycystic_ovary_syndrome, description: 'Metabolic and hormonal patterns may align with PCOS risk.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  osteoporosis: { displayName: 'Osteoporosis', shortName: 'Osteoporosis', icon: '🦴', category: DISEASE_CATEGORIES.osteoporosis, description: 'Low activity and demographic risk can suggest reduced bone reserve.', isAcute: false, isReversible: false, requiresImmediateCare: false },
  fibromyalgia: { displayName: 'Fibromyalgia', shortName: 'Fibromyalgia', icon: '🌫️', category: DISEASE_CATEGORIES.fibromyalgia, description: 'Pain-sensitization patterns often coexist with low sleep and poor recovery.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  irritable_bowel_syndrome: { displayName: 'Irritable Bowel Syndrome', shortName: 'IBS', icon: '🍽️', category: DISEASE_CATEGORIES.irritable_bowel_syndrome, description: 'Autonomic and stress-driven patterns can influence gut sensitivity.', isAcute: false, isReversible: true, requiresImmediateCare: false },
  non_alcoholic_fatty_liver: { displayName: 'Non-Alcoholic Fatty Liver Disease', shortName: 'NAFLD', icon: '🧬', category: DISEASE_CATEGORIES.non_alcoholic_fatty_liver, description: 'Metabolic overload patterns may suggest fatty liver risk.', isAcute: false, isReversible: true, requiresImmediateCare: false },
}

function makeRecs(title) {
  return {
    CRITICAL: [
      `Arrange urgent clinical review for ${title.toLowerCase()} risk within 24-48 hours.`,
      'Reduce physiologic strain immediately and avoid triggers until reviewed.',
      'Track symptoms and vitals closely in SwasthSathi and seek emergency care if worsening.',
    ],
    HIGH: [
      `Start targeted lifestyle changes this week for ${title.toLowerCase()} risk reduction.`,
      'Monitor the most relevant vital trends daily and compare against baseline.',
      'Book a clinician follow-up to review medications, labs, and progression risk.',
    ],
    MODERATE: [
      `Keep monitoring for early ${title.toLowerCase()} signals over the next 2-4 weeks.`,
      'Strengthen sleep, activity, hydration, and stress management habits.',
      'Discuss preventive screening at your next routine medical visit.',
    ],
  }
}

const RECOMMENDATIONS = Object.fromEntries(
  Object.entries(DISEASE_INFO).map(([key, info]) => [key, makeRecs(info.displayName)]),
)

RECOMMENDATIONS.hypertension = {
  CRITICAL: [
    'Measure blood pressure immediately and log the reading.',
    'Avoid sodium and processed foods today; target under 1500mg/day.',
    'Discuss medication adjustment with your doctor within 48 hours.',
  ],
  HIGH: [
    'Reduce salt intake and processed foods this week.',
    'Add 30 minutes of brisk walking daily to your routine.',
    'Monitor blood pressure twice daily and track trends in SwasthSathi.',
  ],
  MODERATE: [
    'Maintain a heart-healthy diet rich in potassium and magnesium.',
    'Practice 10 minutes of deep breathing or meditation daily.',
    'Schedule a routine blood pressure check at your next doctor visit.',
  ],
}

RECOMMENDATIONS.atrial_fibrillation = {
  CRITICAL: [
    'Your HRV pattern suggests irregular heart rhythm; seek medical evaluation urgently.',
    'Avoid caffeine, alcohol, and stimulants immediately.',
    'If palpitations, dizziness, or chest discomfort occur, go to the ER now.',
  ],
  HIGH: [
    'Schedule a cardiology appointment and request rhythm monitoring.',
    'Avoid sleep deprivation because it is a major AFib trigger.',
    'Reduce stress actively with breathing exercises or meditation.',
  ],
  MODERATE: [
    'Continue monitoring HRV and heart-rate variability trends in SwasthSathi.',
    'Keep a consistent sleep schedule each night.',
    'Limit caffeine to one serving or less per day.',
  ],
}

RECOMMENDATIONS.burnout_syndrome = {
  CRITICAL: [
    'Your recovery capacity is critically low; take medical leave if possible.',
    'Consult a mental health professional this week.',
    'Eliminate non-essential commitments for the next two weeks.',
  ],
  HIGH: [
    'Set strict work-hour boundaries starting today.',
    'Prioritize eight hours of sleep as non-negotiable recovery time.',
    'Schedule at least one complete rest day this week.',
  ],
  MODERATE: [
    'Build micro-recovery habits like short walks and breaks every 90 minutes.',
    'Practice one enjoyable activity for 30 minutes daily.',
    'Share workload concerns with your support system or manager.',
  ],
}

export function getRecommendations(disease, probability) {
  const tier = probability >= 75 ? 'CRITICAL' : probability >= 55 ? 'HIGH' : 'MODERATE'
  return RECOMMENDATIONS[disease]?.[tier] || makeRecs(disease)[tier]
}

export { RECOMMENDATIONS, DISEASE_INFO }
