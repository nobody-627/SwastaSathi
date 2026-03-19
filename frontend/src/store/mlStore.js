import { create } from 'zustand'

export const useMLStore = create((set) => ({
  predictions: [],
  allScores: {},
  suppressedList: [],
  filterTrace: [],
  lastUpdated: null,
  recordsAnalyzed: 0,
  dataQuality: null,
  reasoning: null,
  status: null,
  isReady: false,
  hasNewPrediction: false,

  setPredictions: (predictions) => set({ predictions: Array.isArray(predictions) ? predictions : [] }),
  setAllScores: (allScores) => set({ allScores: allScores || {} }),
  setSuppressedList: (suppressedList) => set({ suppressedList: Array.isArray(suppressedList) ? suppressedList : [] }),
  setFilterTrace: (filterTrace) => set({ filterTrace: Array.isArray(filterTrace) ? filterTrace : [] }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  setRecordsAnalyzed: (recordsAnalyzed) => set({ recordsAnalyzed: Number(recordsAnalyzed) || 0 }),
  setDataQuality: (dataQuality) => set({ dataQuality }),
  setReasoning: (reasoning) => set({ reasoning }),
  setStatus: (status) => set({ status, isReady: !!status?.isReady }),
  setIsReady: (isReady) => set({ isReady: !!isReady }),
  setHasNewPrediction: (hasNewPrediction) => set({ hasNewPrediction: !!hasNewPrediction }),
}))
