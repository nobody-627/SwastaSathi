import express from 'express';
const router = express.Router();

// Mock ML model for disease prediction
function predictDisease(data) {
  const { heartRate, oxygenLevel, temperature, symptoms, age, gender } = data;
  const predictions = [];
  
  // Respiratory conditions
  if (oxygenLevel < 95 || symptoms.includes('shortness of breath') || symptoms.includes('cough')) {
    predictions.push({
      disease: 'Respiratory Infection',
      probability: 0.75,
      severity: oxygenLevel < 90 ? 'High' : 'Medium',
      recommendations: ['Monitor oxygen levels', 'Rest and hydration', 'Consult doctor if symptoms worsen', 'Consider chest X-ray if persistent']
    });
  }
  
  // Cardiac conditions
  if (heartRate > 90 || symptoms.includes('chest pain') || symptoms.includes('palpitations')) {
    predictions.push({
      disease: 'Cardiac Condition',
      probability: 0.70,
      severity: heartRate > 100 ? 'High' : 'Medium',
      recommendations: ['ECG recommended', 'Monitor blood pressure', 'Avoid strenuous activity', 'Consult cardiologist if chest pain persists']
    });
  }
  
  // Fever/Infection
  if (temperature > 37.5 || symptoms.includes('fever') || symptoms.includes('headache') || symptoms.includes('body ache')) {
    predictions.push({
      disease: 'Viral/Bacterial Infection',
      probability: 0.68,
      severity: temperature > 38.5 ? 'High' : 'Medium',
      recommendations: ['Monitor temperature', 'Rest and stay hydrated', 'Take paracetamol for fever', 'Seek medical attention if fever persists > 3 days']
    });
  }
  
  // Gastrointestinal
  if (symptoms.includes('nausea') || symptoms.includes('vomiting') || symptoms.includes('abdominal pain') || symptoms.includes('diarrhea')) {
    predictions.push({
      disease: 'Gastrointestinal Issue',
      probability: 0.65,
      severity: symptoms.includes('vomiting') ? 'Medium' : 'Low',
      recommendations: ['Stay hydrated', 'Eat bland foods', 'Monitor for dehydration', 'Consult doctor if symptoms persist > 2 days']
    });
  }
  
  // Fatigue/General
  if (symptoms.includes('fatigue') || symptoms.includes('dizziness') || symptoms.includes('sweating')) {
    predictions.push({
      disease: 'General Fatigue/Stress',
      probability: 0.55,
      severity: 'Low',
      recommendations: ['Get adequate rest', 'Manage stress', 'Stay hydrated', 'Consider medical checkup if persistent']
    });
  }
  
  // Cold/Flu symptoms
  if (symptoms.includes('sore throat') || symptoms.includes('runny nose') || symptoms.includes('loss of taste') || symptoms.includes('loss of smell')) {
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
      heartRate: vitals.heartRate || 70,
      oxygenLevel: vitals.oxygenLevel || 98,
      temperature: vitals.temperature || 36.5,
      symptoms: symptoms,
      age: demographics?.age || 30,
      gender: demographics?.gender || 'other'
    };
    
    const result = predictDisease(data);
    res.json(result);
  } catch (error) {
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
