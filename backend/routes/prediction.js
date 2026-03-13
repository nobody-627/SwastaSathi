import express from 'express';
const router = express.Router();

// Mock ML model for disease prediction
function predictDisease(data) {
  const { heartRate, oxygenLevel, temperature, symptoms = [], age, gender } = data;
  const safeSymptoms = Array.isArray(symptoms) ? symptoms : [];
  const predictions = [];
  
  // Respiratory conditions
  if (oxygenLevel < 95 || safeSymptoms.includes('shortness of breath') || safeSymptoms.includes('cough')) {
    predictions.push({
      disease: 'Respiratory Infection',
      probability: 0.75,
      severity: oxygenLevel < 90 ? 'High' : 'Medium',
      recommendations: ['Monitor oxygen levels', 'Rest and hydration', 'Consult doctor if symptoms worsen', 'Consider chest X-ray if persistent']
    });
  }
  
  // Cardiac conditions
  if (heartRate > 90 || safeSymptoms.includes('chest pain') || safeSymptoms.includes('palpitations')) {
    predictions.push({
      disease: 'Cardiac Condition',
      probability: 0.70,
      severity: heartRate > 100 ? 'High' : 'Medium',
      recommendations: ['ECG recommended', 'Monitor blood pressure', 'Avoid strenuous activity', 'Consult cardiologist if chest pain persists']
    });
  }
  
  // Fever/Infection
  if (temperature > 37.5 || safeSymptoms.includes('fever') || safeSymptoms.includes('headache') || safeSymptoms.includes('body ache')) {
    predictions.push({
      disease: 'Viral/Bacterial Infection',
      probability: 0.68,
      severity: temperature > 38.5 ? 'High' : 'Medium',
      recommendations: ['Monitor temperature', 'Rest and stay hydrated', 'Take paracetamol for fever', 'Seek medical attention if fever persists > 3 days']
    });
  }
  
  // Gastrointestinal
  if (safeSymptoms.includes('nausea') || safeSymptoms.includes('vomiting') || safeSymptoms.includes('abdominal pain') || safeSymptoms.includes('diarrhea')) {
    predictions.push({
      disease: 'Gastrointestinal Issue',
      probability: 0.65,
      severity: symptoms.includes('vomiting') ? 'Medium' : 'Low',
      recommendations: ['Stay hydrated', 'Eat bland foods', 'Monitor for dehydration', 'Consult doctor if symptoms persist > 2 days']
    });
  }
  
  // Fatigue/General
  if (safeSymptoms.includes('fatigue') || safeSymptoms.includes('dizziness') || safeSymptoms.includes('sweating')) {
    predictions.push({
      disease: 'General Fatigue/Stress',
      probability: 0.55,
      severity: 'Low',
      recommendations: ['Get adequate rest', 'Manage stress', 'Stay hydrated', 'Consider medical checkup if persistent']
    });
  }
  
  // Cold/Flu symptoms
  if (safeSymptoms.includes('sore throat') || safeSymptoms.includes('runny nose') || safeSymptoms.includes('loss of taste') || safeSymptoms.includes('loss of smell')) {
    predictions.push({
      disease: 'Upper Respiratory Infection (Cold/Flu)',
      probability: 0.60,
      severity: 'Low',
      recommendations: ['Rest and fluids', 'Over-the-counter cold medication', 'Monitor symptoms', 'Test for COVID if symptoms match']
    });
  }
  
  // Sort by probability
  predictions.sort((a, b) => b.probability - a.probability);
  
  return {
    predictions: predictions.slice(0, 3),
    overallRisk: predictions.length > 0 ? Math.max(...predictions.map(p => p.probability)) : 0.1,
    timestamp: new Date().toISOString()
  };
}

router.post('/predict', (req, res) => {
  try {
    const { vitals, symptoms, demographics } = req.body;
    
    if (!vitals || !symptoms) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    const data = {
      heartRate: Number(vitals.heartRate) || 70,
      oxygenLevel: Number(vitals.oxygenLevel) || 98,
      temperature: Number(vitals.temperature) || 36.5,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      age: demographics?.age || 30,
      gender: demographics?.gender || 'other'
    };
    
    const result = predictDisease(data);
    res.json(result);
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
  
  res.json({ symptoms: commonSymptoms });
});

export default router;
