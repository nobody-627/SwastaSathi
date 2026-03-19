import { useEffect } from 'react'
import socket from '../lib/socketClient'
import { useMLStore } from '../store/mlStore'
import { api } from '../api/client'

let listenersBound = false

export default function useMLPrediction() {
  const mlStore = useMLStore()

  useEffect(() => {
    if (listenersBound) return
    listenersBound = true

    const onPrediction = (payload) => {
      try {
        const result = payload?.result
        if (!result || typeof result !== 'object') return

        mlStore.setPredictions(result.predictions || [])
        mlStore.setAllScores(result.allScores || {})
        mlStore.setSuppressedList(result.suppressedList || [])
        mlStore.setFilterTrace(result.filterTrace || [])
        mlStore.setLastUpdated(result.timestamp)
        mlStore.setRecordsAnalyzed(result.recordsAnalyzed || 0)
        mlStore.setDataQuality(result.dataQuality || null)
        mlStore.setReasoning(result.llmReasoning || null)

        if ((result.predictions || []).length > 0) {
          mlStore.setHasNewPrediction(true)
          setTimeout(() => mlStore.setHasNewPrediction(false), 5000)
        }
      } catch {
        // ignore malformed payloads
      }
    }

    socket.on('ml:prediction', onPrediction)

    api.get('/ml/status')
      .then((status) => mlStore.setStatus(status))
      .catch(() => {})

    return () => {
      socket.off('ml:prediction', onPrediction)
      listenersBound = false
    }
  }, [mlStore])
}
