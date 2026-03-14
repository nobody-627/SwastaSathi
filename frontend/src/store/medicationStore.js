import { create } from 'zustand'
import { api } from '../api/client'

const toMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export const useMedicationStore = create((set, get) => ({
  medications: [],
  loading: false,
  error: null,

  async loadMedications() {
    set({ loading: true, error: null })
    try {
      const res = await api.medications.list()
      set({ medications: res.medications || [] })
    } catch (err) {
      set({ error: err.message || 'Failed to load medications' })
    } finally {
      set({ loading: false })
    }
  },

  async addMedication(payload) {
    const res = await api.medications.create(payload)
    set(state => ({ medications: [res.medication, ...state.medications] }))
  },

  async updateMedication(id, updates) {
    const res = await api.medications.update(id, updates)
    set(state => ({ medications: state.medications.map(m => m.id === id ? res.medication : m) }))
  },

  async deleteMedication(id) {
    await api.medications.remove(id)
    set(state => ({ medications: state.medications.filter(m => m.id !== id) }))
  },

  async markTaken(id, time) {
    const res = await api.medications.markTaken(id, time)
    set(state => ({ medications: state.medications.map(m => m.id === id ? res.medication : m) }))
  },

  getDueNow() {
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const windowMinutes = 30
    const today = todayIso()

    return get().medications.filter((med) => {
      if (!med.active) return false
      if (med.startDate && med.startDate > today) return false
      const taken = med.takenToday || []
      return med.times.some((t) => {
        const diff = Math.abs(toMinutes(t) - nowMin)
        return diff <= windowMinutes && !taken.includes(t)
      })
    })
  },
}))
