// src/api/client.js
const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),

  agent: {
    analyze: (payload)   => api.post('/agent/analyze', payload),
    status:  ()          => api.get('/agent/status'),
  },
  vitals: {
    thresholds: ()       => api.get('/vitals/thresholds'),
    log:        (entry, sessionId) => api.post('/vitals/log', { entry, sessionId }),
    history:    (sessionId)        => api.get(`/vitals/history?session=${sessionId}`),
    clearLog:   (sessionId)        => api.delete(`/vitals/log?session=${sessionId}`),
  },
  auth: {
    login:    (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email)     => api.post('/auth/register', { name, email }),
    me:       ()                => api.get('/auth/me'),
  },
}

// WebSocket helper
export function createVitalsSocket(onMessage, onError) {
  const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:3001') + '/ws/vitals'
  let ws = null
  let reconnectTimer = null
  let alive = true

  function connect() {
    if (!alive) return
    ws = new WebSocket(wsUrl)

    ws.onopen    = () => console.log('[WS] connected')
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch (_) {} }
    ws.onerror   = (e) => { onError && onError(e) }
    ws.onclose   = () => {
      if (alive) reconnectTimer = setTimeout(connect, 3000)
    }
  }

  connect()

  return {
    send:  (msg) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify(msg)),
    close: () => {
      alive = false
      clearTimeout(reconnectTimer)
      ws?.close()
    },
  }
}
