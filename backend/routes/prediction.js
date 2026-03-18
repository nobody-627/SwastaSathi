import express from 'express';
import { predictAcuteInflammations } from '../ml/acuteInflammationsModel.js';

const router = express.Router();

const SYMPTOM_MAP = {
  nausea: ['nausea'],
  lumbarPain: ['lumbar pain', 'lower back pain', 'back pain'],
  urinePushing: ['urine pushing', 'frequent urination', 'urgent urination'],
  micturitionPains: ['micturition pains', 'painful urination', 'pain during urination'],
  burningUrethra: [
    'burning of urethra',
    'burning urination',
    'urethral burning',
    'itching urethra',
    'swelling of urethra',
  ],
};

function hasSymptom(symptoms, keys) {
  const set = new Set(symptoms.map((s) => String(s).toLowerCase().trim()));
  return keys.some((key) => set.has(key));
}

function buildFeatures(vitals, symptoms) {
  return {
    temperature: Number(vitals.temperature),
    nausea: hasSymptom(symptoms, SYMPTOM_MAP.nausea),
    lumbarPain: hasSymptom(symptoms, SYMPTOM_MAP.lumbarPain),
    urinePushing: hasSymptom(symptoms, SYMPTOM_MAP.urinePushing),
    micturitionPains: hasSymptom(symptoms, SYMPTOM_MAP.micturitionPains),
    burningUrethra: hasSymptom(symptoms, SYMPTOM_MAP.burningUrethra),
  };
}

function severityFromProbability(probability) {
  if (probability >= 0.75) return 'High';
  if (probability >= 0.55) return 'Medium';
  return 'Low';
}

router.post('/predict', (req, res) => {
  try {
    const { vitals, symptoms } = req.body;
    
    if (!vitals || !symptoms) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];
    if (Number.isNaN(Number(vitals.temperature))) {
      return res.status(400).json({ error: 'Temperature is required' });
    }
    const features = buildFeatures(vitals, safeSymptoms);
    const prediction = predictAcuteInflammations(features);

    const predictions = [
      {
        disease: 'Acute Inflammation of Urinary Bladder',
        probability: prediction.bladderInflammation,
        severity: severityFromProbability(prediction.bladderInflammation),
        recommendations: [
          'Stay hydrated and rest',
          'Monitor urination discomfort',
          'Seek medical care if symptoms persist or worsen',
        ],
      },
      {
        disease: 'Acute Nephritis of Renal Pelvis Origin',
        probability: prediction.nephritis,
        severity: severityFromProbability(prediction.nephritis),
        recommendations: [
          'Monitor fever and pain intensity',
          'Seek medical evaluation promptly',
          'Avoid self-medication without guidance',
        ],
      },
    ].sort((a, b) => b.probability - a.probability);

    res.json({
      predictions,
      overallRisk: Math.max(prediction.bladderInflammation, prediction.nephritis),
      timestamp: new Date().toISOString(),
      modelInfo: {
        dataset: 'UCI Acute Inflammations',
        rowsUsed: prediction.totalRows,
      },
    });
  } catch (error) {
    console.error('[Prediction] Error:', error.message);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

router.get('/symptoms', (req, res) => {
  const commonSymptoms = [
    'chest pain', 'shortness of breath', 'headache', 'dizziness',
    'fatigue', 'body ache', 'cough', 'fever', 'nausea', 'vomiting',
    'sore throat', 'runny nose', 'loss of taste', 'loss of smell',
    'abdominal pain', 'diarrhea', 'constipation', 'sweating',
    'chills', 'joint pain', 'muscle pain', 'back pain', 'palpitations'
  ];

  const urinarySymptoms = [
    'lumbar pain',
    'urine pushing',
    'frequent urination',
    'urgent urination',
    'micturition pains',
    'painful urination',
    'burning urination',
    'burning of urethra',
    'itching urethra',
    'swelling of urethra',
  ];

  const allSymptoms = Array.from(
    new Set([...commonSymptoms, ...urinarySymptoms]),
  );

  res.json({ symptoms: allSymptoms });
});

export default router;
