import { create } from 'zustand'
import { api } from '../api/client'

const todayIso = () => new Date().toISOString().slice(0, 10)

export const useActivityStore = create((set, get) => ({
  summary: {
    date: todayIso(),
    steps: 0,
    carbsBurned: 0,
    goalSteps: 8000,
    goalCarbs: 320,
  },
  history: [],
  loading: false,
  error: null,
  lastSynced: null,

  async load(date = todayIso()) {
    set({ loading: true, error: null })
    try {
      const res = await api.activity.summary(date)
      set({
        summary: {
          date: res.date || date,
          steps: res.steps || 0,
          carbsBurned: res.carbsBurned || 0,
          goalSteps: res.goalSteps ?? 8000,
          goalCarbs: res.goalCarbs ?? 320,
        },
        history: res.history || [],
        lastSynced: Date.now(),
      })
    } catch (err) {
      set({ error: err.message || 'Failed to load activity' })
    } finally {
      set({ loading: false })
    }
  },

  async syncNow() {
    await get().load()
  },

  async updateGoals(goals) {
    try {
      const res = await api.activity.setGoals(goals)
      set((state) => ({
        summary: { ...state.summary, goalSteps: res.goals.goalSteps, goalCarbs: res.goals.goalCarbs },
      }))
    } catch (err) {
      set({ error: err.message || 'Failed to update goals' })
    }
  },

  async addManual(payload) {
    await api.activity.ingest(payload)
    await get().load(payload.capturedAt ? payload.capturedAt.slice(0, 10) : todayIso())
  },
}))
