import healthDataStore from './healthDataStore.js'

export async function ingestCsvTick(row) {
  try {
    const medications = await healthDataStore.getActiveMedications()
    const profile = await healthDataStore.getUserProfile()
    const [systolic, diastolic] = String(row?.bloodPressure || '120/80')
      .split('/')
      .map((v) => Number(v) || 0)

    healthDataStore.addRecord({
      userId: 'default_user',
      timestamp: row?.timestamp || new Date().toISOString(),
      source: 'wearable_csv',
      vitals: {
        heartRate: Number(row?.heartRate) || 72,
        hrv: Number(row?.hrv) || 45,
        spo2: Number(row?.spo2) || 98,
        bloodPressure: {
          systolic: systolic || 120,
          diastolic: diastolic || 80,
        },
        bloodSugar: Number(row?.bloodSugar) || 95,
        bodyTemperature: Number(row?.bodyTemperature) || 36.6,
        respiratoryRate: Number(row?.respiratoryRate) || 16,
      },
      activity: {
        type: row?.activityType || 'resting',
        steps: Number(row?.steps) || 0,
        caloriesBurned: Number(row?.caloriesBurned) || 0,
        activeMinutes: Number(row?.activeMinutes) || 0,
        stressLevel: Number(row?.stressLevel) || 40,
        sleepScore: Number(row?.sleepScore) || 70,
      },
      medications,
      profile,
    })
  } catch (err) {
    console.warn('[CSVWearableService] ingest warning:', err.message)
  }
}

export default {
  ingestCsvTick,
}
