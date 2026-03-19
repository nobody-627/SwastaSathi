const BASE_FEATURES = [
  'heartRate_mean',
  'heartRate_std',
  'heartRate_trend',
  'hrv_mean',
  'hrv_std',
  'hrv_trend',
  'spo2_mean',
  'spo2_min',
  'spo2_std',
  'systolic_mean',
  'systolic_std',
  'systolic_max',
  'diastolic_mean',
  'diastolic_std',
  'bloodSugar_mean',
  'bloodSugar_std',
  'bloodSugar_max',
  'bodyTemp_mean',
  'bodyTemp_max',
  'respiratoryRate_mean',
  'respiratoryRate_std',
  'pulse_pressure',
  'mean_arterial_pressure',
  'cardiac_stress_index',
  'autonomic_balance',
  'oxygen_debt_score',
  'metabolic_load',
  'thermal_stress',
  'recovery_capacity',
  'steps_per_minute',
  'activity_intensity_encoded',
  'stress_level_mean',
  'stress_level_trend',
  'sleep_score_mean',
  'calories_rate',
  'on_antihypertensive',
  'on_diabetes_medication',
  'on_cardiac_medication',
  'on_respiratory_medication',
  'medication_count',
  'age_normalized',
  'bmi_normalized',
  'gender_encoded',
  'lifestyle_encoded',
  'known_conditions_count',
  'hr_violations_count',
  'spo2_violations_count',
  'bp_violations_count',
  'sugar_violations_count',
  'temp_violations_count',
  'active_minutes_mean',
  'age_x_systolic',
  'bmi_x_sugar',
  'hrv_x_stress',
  'spo2_x_respRate',
  'age_x_hrv',
  'sleep_x_stress',
  'bp_x_hr',
  'medication_x_risk',
  'time_of_day_encoded',
  'reading_consistency_score',
  'vitals_coefficient_of_variation',
  'heartRate_10rec_mean',
  'heartRate_10rec_std',
  'heartRate_30rec_mean',
  'heartRate_30rec_std',
  'spo2_10rec_min',
  'stress_10rec_mean',
  'hrv_10rec_mean',
]

function buildWeights(influences) {
  return BASE_FEATURES.map((name) => influences[name] ?? 0)
}

export const FEATURE_NAMES = BASE_FEATURES

export const DISEASE_CATEGORIES = {
  hypertension: 'Cardiovascular',
  type2_diabetes: 'Metabolic',
  cardiovascular: 'Cardiovascular',
  respiratory: 'Respiratory',
  stress_disorder: 'Mental Health',
  sleep_apnea: 'Mental Health',
  metabolic_syndrome: 'Metabolic',
  atrial_fibrillation: 'Cardiovascular',
  coronary_artery_disease: 'Cardiovascular',
  heart_failure: 'Cardiovascular',
  peripheral_artery_disease: 'Cardiovascular',
  type1_diabetes: 'Metabolic',
  prediabetes: 'Metabolic',
  hypothyroidism: 'Renal/Endocrine',
  hyperthyroidism: 'Renal/Endocrine',
  gout: 'Renal/Endocrine',
  chronic_obstructive_pulmonary_disease: 'Respiratory',
  asthma: 'Respiratory',
  pulmonary_hypertension: 'Respiratory',
  major_depressive_disorder: 'Mental Health',
  generalized_anxiety_disorder: 'Mental Health',
  burnout_syndrome: 'Mental Health',
  migraine_disorder: 'Mental Health',
  chronic_kidney_disease: 'Renal/Endocrine',
  adrenal_fatigue: 'Renal/Endocrine',
  polycystic_ovary_syndrome: 'Renal/Endocrine',
  osteoporosis: 'Musculoskeletal',
  fibromyalgia: 'Musculoskeletal',
  irritable_bowel_syndrome: 'Gastrointestinal',
  non_alcoholic_fatty_liver: 'Gastrointestinal',
}

export const DISEASE_MODELS = {
  hypertension: {
    weights: buildWeights({
      systolic_mean: 0.85, diastolic_mean: 0.7, systolic_max: 0.45, pulse_pressure: 0.6,
      mean_arterial_pressure: 0.72, age_normalized: 0.55, bmi_normalized: 0.45,
      lifestyle_encoded: -0.35, hrv_mean: -0.4, heartRate_mean: 0.15,
      bp_violations_count: 0.35, on_antihypertensive: 0.5, known_conditions_count: 0.2,
      age_x_systolic: 0.32, bp_x_hr: 0.3,
    }),
    bias: -0.5,
  },
  type2_diabetes: {
    weights: buildWeights({
      bloodSugar_mean: 0.9, bloodSugar_max: 0.78, bloodSugar_std: 0.35, metabolic_load: 0.58,
      bmi_normalized: 0.6, age_normalized: 0.42, lifestyle_encoded: -0.3, sugar_violations_count: 0.4,
      on_diabetes_medication: 0.55, activity_intensity_encoded: -0.15, steps_per_minute: -0.12,
      bmi_x_sugar: 0.42, medication_x_risk: 0.18,
    }),
    bias: -0.6,
  },
  cardiovascular: {
    weights: buildWeights({
      cardiac_stress_index: 0.85, hrv_mean: -0.7, heartRate_mean: 0.45, heartRate_std: 0.35,
      systolic_mean: 0.5, mean_arterial_pressure: 0.62, pulse_pressure: 0.45,
      age_normalized: 0.45, spo2_min: -0.2, hr_violations_count: 0.38,
      bp_violations_count: 0.3, on_cardiac_medication: 0.5, age_x_hrv: 0.34, bp_x_hr: 0.38,
    }),
    bias: -0.7,
  },
  respiratory: {
    weights: buildWeights({
      spo2_mean: -0.92, spo2_min: -0.98, spo2_std: 0.3, respiratoryRate_mean: 0.72,
      respiratoryRate_std: 0.3, oxygen_debt_score: 0.8, bodyTemp_mean: 0.2,
      on_respiratory_medication: 0.52, spo2_violations_count: 0.45, temp_violations_count: 0.12,
      spo2_x_respRate: 0.45, heartRate_10rec_mean: 0.12,
    }),
    bias: -0.4,
  },
  stress_disorder: {
    weights: buildWeights({
      stress_level_mean: 0.9, stress_level_trend: 0.45, hrv_mean: -0.52, hrv_std: 0.25,
      heartRate_std: 0.35, sleep_score_mean: -0.6, recovery_capacity: -0.42,
      autonomic_balance: -0.3, thermal_stress: 0.1, age_normalized: 0.15,
      sleep_x_stress: 0.48, hrv_x_stress: -0.32,
    }),
    bias: -0.5,
  },
  sleep_apnea: {
    weights: buildWeights({
      sleep_score_mean: -0.85, spo2_min: -0.65, spo2_mean: -0.4, hrv_std: 0.42,
      bmi_normalized: 0.68, respiratoryRate_mean: 0.38, oxygen_debt_score: 0.32,
      stress_level_mean: 0.2, lifestyle_encoded: -0.1, spo2_10rec_min: -0.52,
      sleep_x_stress: 0.28,
    }),
    bias: -0.6,
  },
  metabolic_syndrome: {
    weights: buildWeights({
      metabolic_load: 0.88, bloodSugar_mean: 0.6, systolic_mean: 0.48, bmi_normalized: 0.72,
      lifestyle_encoded: -0.42, age_normalized: 0.35, known_conditions_count: 0.25,
      activity_intensity_encoded: -0.18, steps_per_minute: -0.15,
      sugar_violations_count: 0.32, bp_violations_count: 0.25, bmi_x_sugar: 0.5,
      medication_x_risk: 0.22,
    }),
    bias: -0.5,
  },
  atrial_fibrillation: {
    weights: buildWeights({
      hrv_std: 0.9, heartRate_std: 0.85, hr_violations_count: 0.8, age_normalized: 0.65,
      pulse_pressure: 0.6, cardiac_stress_index: 0.55, on_cardiac_medication: 0.5,
      autonomic_balance: -0.45, heartRate_10rec_std: 0.45,
    }),
    bias: -0.72,
  },
  coronary_artery_disease: {
    weights: buildWeights({
      systolic_mean: 0.85, cardiac_stress_index: 0.8, age_normalized: 0.75,
      bmi_normalized: 0.65, metabolic_load: 0.6, hrv_mean: -0.7,
      lifestyle_encoded: -0.55, on_cardiac_medication: 0.5, age_x_systolic: 0.42,
      bp_x_hr: 0.35,
    }),
    bias: -0.78,
  },
  heart_failure: {
    weights: buildWeights({
      heartRate_mean: 0.75, spo2_mean: -0.8, respiratoryRate_mean: 0.7,
      recovery_capacity: -0.75, oxygen_debt_score: 0.7, age_normalized: 0.6,
      steps_per_minute: -0.5, spo2_x_respRate: 0.45,
    }),
    bias: -0.84,
  },
  peripheral_artery_disease: {
    weights: buildWeights({
      pulse_pressure: 0.85, systolic_max: 0.75, age_normalized: 0.7,
      bmi_normalized: 0.65, lifestyle_encoded: -0.6, steps_per_minute: -0.55,
      on_antihypertensive: 0.45, age_x_systolic: 0.32,
    }),
    bias: -0.88,
  },
  type1_diabetes: {
    weights: buildWeights({
      bloodSugar_std: 0.9, bloodSugar_max: 0.85, bloodSugar_mean: 0.8,
      age_normalized: -0.6, bmi_normalized: -0.4, on_diabetes_medication: 0.7,
      bmi_x_sugar: 0.18,
    }),
    bias: -1.05,
  },
  prediabetes: {
    weights: buildWeights({
      bloodSugar_mean: 0.75, bmi_normalized: 0.7, lifestyle_encoded: -0.65,
      stress_level_mean: 0.55, age_normalized: 0.5, metabolic_load: 0.65,
      bmi_x_sugar: 0.55,
    }),
    bias: -0.55,
  },
  hypothyroidism: {
    weights: buildWeights({
      heartRate_mean: -0.75, bodyTemp_mean: -0.8, steps_per_minute: -0.7,
      sleep_score_mean: -0.6, hrv_mean: -0.55, calories_rate: -0.65,
      gender_encoded: -0.4, active_minutes_mean: -0.35,
    }),
    bias: -0.9,
  },
  hyperthyroidism: {
    weights: buildWeights({
      heartRate_mean: 0.85, bodyTemp_max: 0.8, hrv_std: 0.7, stress_level_mean: 0.65,
      thermal_stress: 0.75, heartRate_std: 0.7, bmi_normalized: -0.5,
      heartRate_10rec_mean: 0.34,
    }),
    bias: -0.92,
  },
  gout: {
    weights: buildWeights({
      bmi_normalized: 0.8, lifestyle_encoded: -0.7, bloodSugar_mean: 0.6,
      age_normalized: 0.65, gender_encoded: 0.55, on_antihypertensive: 0.45,
      metabolic_load: 0.28,
    }),
    bias: -1.0,
  },
  chronic_obstructive_pulmonary_disease: {
    weights: buildWeights({
      spo2_mean: -0.9, spo2_min: -0.85, respiratoryRate_mean: 0.8,
      oxygen_debt_score: 0.85, recovery_capacity: -0.75, age_normalized: 0.65,
      steps_per_minute: -0.6, on_respiratory_medication: 0.55, spo2_x_respRate: 0.55,
    }),
    bias: -0.74,
  },
  asthma: {
    weights: buildWeights({
      spo2_min: -0.85, respiratoryRate_std: 0.8, oxygen_debt_score: 0.75,
      stress_level_mean: 0.65, activity_intensity_encoded: 0.6, on_respiratory_medication: 0.7,
      hrv_std: 0.55, spo2_10rec_min: -0.45,
    }),
    bias: -0.6,
  },
  pulmonary_hypertension: {
    weights: buildWeights({
      spo2_mean: -0.9, heartRate_mean: 0.75, respiratoryRate_mean: 0.8,
      cardiac_stress_index: 0.7, oxygen_debt_score: 0.85, recovery_capacity: -0.7,
      spo2_x_respRate: 0.58,
    }),
    bias: -1.12,
  },
  major_depressive_disorder: {
    weights: buildWeights({
      sleep_score_mean: -0.8, steps_per_minute: -0.75, hrv_mean: -0.7,
      stress_level_mean: 0.8, recovery_capacity: -0.75, activity_intensity_encoded: -0.65,
      autonomic_balance: -0.6, sleep_x_stress: 0.55,
    }),
    bias: -0.72,
  },
  generalized_anxiety_disorder: {
    weights: buildWeights({
      stress_level_mean: 0.9, hrv_mean: -0.8, heartRate_std: 0.75,
      sleep_score_mean: -0.7, hrv_std: 0.7, autonomic_balance: -0.75,
      heartRate_mean: 0.6, hrv_x_stress: -0.42,
    }),
    bias: -0.62,
  },
  burnout_syndrome: {
    weights: buildWeights({
      stress_level_mean: 0.85, hrv_trend: -0.8, recovery_capacity: -0.85,
      sleep_score_mean: -0.75, steps_per_minute: -0.65, hrv_mean: -0.7,
      autonomic_balance: -0.75, sleep_x_stress: 0.5,
    }),
    bias: -0.58,
  },
  migraine_disorder: {
    weights: buildWeights({
      hrv_std: 0.8, stress_level_mean: 0.75, heartRate_std: 0.7,
      sleep_score_mean: -0.65, systolic_std: 0.7, pulse_pressure: 0.55,
      autonomic_balance: -0.6,
    }),
    bias: -0.82,
  },
  chronic_kidney_disease: {
    weights: buildWeights({
      systolic_mean: 0.8, bloodSugar_mean: 0.75, age_normalized: 0.7,
      bmi_normalized: 0.65, on_antihypertensive: 0.55, on_diabetes_medication: 0.55,
      bp_violations_count: 0.7, medication_x_risk: 0.3,
    }),
    bias: -0.68,
  },
  adrenal_fatigue: {
    weights: buildWeights({
      stress_level_mean: 0.8, recovery_capacity: -0.85, hrv_trend: -0.75,
      sleep_score_mean: -0.7, heartRate_mean: 0.65, autonomic_balance: -0.8,
      hrv_std: 0.6, sleep_x_stress: 0.52,
    }),
    bias: -0.9,
  },
  polycystic_ovary_syndrome: {
    weights: buildWeights({
      gender_encoded: -0.9, bmi_normalized: 0.8, bloodSugar_mean: 0.7,
      metabolic_load: 0.75, stress_level_mean: 0.6, lifestyle_encoded: -0.55,
      heartRate_std: 0.5, bmi_x_sugar: 0.36,
    }),
    bias: -0.95,
  },
  osteoporosis: {
    weights: buildWeights({
      age_normalized: 0.85, gender_encoded: -0.75, steps_per_minute: -0.7,
      lifestyle_encoded: -0.65, bmi_normalized: -0.5, sleep_score_mean: -0.45,
      active_minutes_mean: -0.6,
    }),
    bias: -0.88,
  },
  fibromyalgia: {
    weights: buildWeights({
      sleep_score_mean: -0.85, hrv_mean: -0.75, stress_level_mean: 0.8,
      recovery_capacity: -0.85, heartRate_std: 0.65, hrv_std: 0.7,
      gender_encoded: -0.6, sleep_x_stress: 0.45,
    }),
    bias: -0.8,
  },
  irritable_bowel_syndrome: {
    weights: buildWeights({
      stress_level_mean: 0.85, autonomic_balance: -0.75, hrv_mean: -0.7,
      sleep_score_mean: -0.65, heartRate_std: 0.6, hrv_std: 0.65,
      sleep_x_stress: 0.42,
    }),
    bias: -0.76,
  },
  non_alcoholic_fatty_liver: {
    weights: buildWeights({
      bmi_normalized: 0.85, bloodSugar_mean: 0.8, metabolic_load: 0.8,
      lifestyle_encoded: -0.7, on_diabetes_medication: 0.55, age_normalized: 0.55,
      steps_per_minute: -0.65, bmi_x_sugar: 0.48,
    }),
    bias: -0.7,
  },
}

export const DISEASE_KEYS = Object.keys(DISEASE_MODELS)
