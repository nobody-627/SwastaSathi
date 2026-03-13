import React, { useState, useEffect } from 'react';
import { Heart, Activity, Thermometer, Brain, AlertTriangle, CheckCircle, Stethoscope, TrendingUp } from 'lucide-react';
import { api } from '../api/client.js';
import { createVitalsSocket } from '../api/client.js';

const Prediction = () => {
  const [vitals, setVitals] = useState({
    heartRate: '',
    oxygenLevel: '',
    temperature: ''
  });
  const [currentVitals, setCurrentVitals] = useState({
    hr: 0,
    spo2: 0,
    temp: 0
  });
  const [symptoms, setSymptoms] = useState([]);
  const [demographics, setDemographics] = useState({
    age: '',
    gender: 'male'
  });
  const [availableSymptoms, setAvailableSymptoms] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSymptoms();
    
    // Connect to WebSocket for live vitals
    const socket = createVitalsSocket(
      (message) => {
        if (message.type === 'vital' && message.reading) {
          setCurrentVitals({
            hr: message.reading.hr,
            spo2: message.reading.spo2,
            temp: message.reading.temp
          });
          
          // Auto-populate form with current vitals if empty
          setVitals(prev => ({
            heartRate: prev.heartRate || message.reading.hr.toString(),
            oxygenLevel: prev.oxygenLevel || message.reading.spo2.toString(),
            temperature: prev.temperature || message.reading.temp.toString()
          }));
        }
      },
      (error) => {
        // Silently handle WebSocket errors to avoid console spam
        // WebSocket may fail on prediction page since it's designed for dashboard
        console.log('WebSocket not available on prediction page (expected)');
      }
    );

    return () => {
      socket.close();
    };
  }, []);

  const fetchSymptoms = async () => {
    try {
      const response = await api.get('/prediction/symptoms');
      if (response && response.symptoms) {
        setAvailableSymptoms(response.symptoms);
      } else if (response && response.data && response.data.symptoms) {
        setAvailableSymptoms(response.data.symptoms);
      }
    } catch (err) {
      console.error('Failed to fetch symptoms:', err);
      // Fallback symptoms
      setAvailableSymptoms([
        'chest pain', 'shortness of breath', 'headache', 'dizziness',
        'fatigue', 'body ache', 'cough', 'fever', 'nausea', 'vomiting',
        'sore throat', 'runny nose', 'loss of taste', 'loss of smell',
        'abdominal pain', 'diarrhea', 'constipation', 'sweating',
        'chills', 'joint pain', 'muscle pain', 'back pain', 'palpitations'
      ]);
    }
  };

  const handleVitalChange = (field, value) => {
    setVitals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const useCurrentVitals = () => {
    setVitals({
      heartRate: currentVitals.hr.toString(),
      oxygenLevel: currentVitals.spo2.toString(),
      temperature: currentVitals.temp.toString()
    });
  };

  const handleSymptomToggle = (symptom) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handlePredict = async () => {
    console.log('Predict button clicked');
    console.log('Vitals:', vitals);
    console.log('Symptoms:', symptoms);
    console.log('Demographics:', demographics);
    
    if (!vitals.heartRate || !vitals.oxygenLevel || !vitals.temperature) {
      setError('Please fill in all vital signs');
      return;
    }

    if (symptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        vitals: {
          heartRate: parseInt(vitals.heartRate),
          oxygenLevel: parseInt(vitals.oxygenLevel),
          temperature: parseFloat(vitals.temperature)
        },
        symptoms,
        demographics
      };
      
      console.log('Sending payload:', payload);
      const response = await api.post('/prediction/predict', payload);
      console.log('API Response:', response);
      
      // Handle different response structures
      if (response && response.predictions) {
        setPredictions(response);
      } else if (response && response.data && response.data.predictions) {
        setPredictions(response.data);
      } else {
        console.error('Unexpected response structure:', response);
        setError('Unexpected response from server');
      }
    } catch (err) {
      setError('Prediction failed. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk) => {
    if (risk >= 0.8) return 'text-red-600';
    if (risk >= 0.6) return 'text-orange-600';
    if (risk >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Hero Section */}
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-4">
              <Brain className="h-12 w-12 text-rose-500 mr-3" />
              <h1 className="text-4xl font-bold text-gray-800">AI Disease Prediction</h1>
            </div>
            <p className="text-gray-600 text-lg">Enter your health data and symptoms to get AI-powered disease predictions</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vitals Input */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <Activity className="h-6 w-6 text-rose-500 mr-2" />
                  Vital Signs
                </h2>
                <button
                  onClick={useCurrentVitals}
                  className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 transition-colors flex items-center text-sm font-medium"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Use Current Vitals
                </button>
              </div>
              
              {/* Current Vitals Display */}
              <div className="mb-6 p-4 bg-rose-50 rounded-lg">
                <div className="text-sm font-medium text-rose-700 mb-2">Current Readings:</div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{currentVitals.hr}</div>
                    <div className="text-xs text-gray-600">HR</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{currentVitals.spo2}%</div>
                    <div className="text-xs text-gray-600">SpO2</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{currentVitals.temp}°C</div>
                    <div className="text-xs text-gray-600">Temp</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="h-4 w-4 inline mr-1" />
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={vitals.heartRate}
                    onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="60-100"
                    min="40"
                    max="200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="h-4 w-4 inline mr-1" />
                    Oxygen Level (%)
                  </label>
                  <input
                    type="number"
                    value={vitals.oxygenLevel}
                    onChange={(e) => handleVitalChange('oxygenLevel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="95-100"
                    min="70"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Thermometer className="h-4 w-4 inline mr-1" />
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalChange('temperature', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="36.5-37.5"
                    min="35"
                    max="42"
                  />
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Demographics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={demographics.age}
                    onChange={(e) => setDemographics(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="25"
                    min="1"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={demographics.gender}
                    onChange={(e) => setDemographics(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Symptoms Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Stethoscope className="h-6 w-6 text-rose-500 mr-2" />
                Symptoms
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({symptoms.length} selected)
                </span>
              </h2>
              
              {/* Selected Symptoms Display */}
              {symptoms.length > 0 && (
                <div className="mb-4 p-3 bg-rose-50 rounded-lg">
                  <div className="text-sm font-medium text-rose-700 mb-2">Selected Symptoms:</div>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-rose-500 text-white text-xs rounded-full"
                      >
                        {symptom}
                        <button
                          onClick={() => handleSymptomToggle(symptom)}
                          className="ml-1 hover:text-rose-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableSymptoms.map(symptom => (
                  <button
                    key={symptom}
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      symptoms.includes(symptom)
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Prediction Results</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  <p className="mt-2 text-gray-600">Analyzing your health data...</p>
                </div>
              )}

              {predictions && !loading && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className={`text-3xl font-bold ${getRiskColor(predictions.overallRisk)}`}>
                      {(predictions.overallRisk * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Risk Score</div>
                  </div>

                  {predictions.predictions.map((prediction, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(prediction.severity)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{prediction.disease}</h3>
                        <span className="text-sm font-medium">
                          {(prediction.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="text-sm mb-3">
                        Severity: <span className="font-medium">{prediction.severity}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-700">Recommendations:</div>
                        {prediction.recommendations.map((rec, i) => (
                          <div key={i} className="text-xs flex items-start">
                            <CheckCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Medical Disclaimer:</strong> This AI prediction is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!predictions && !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Fill in your health data and click "Predict" to see results</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Predict Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="px-8 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing...' : 'Predict Diseases'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
