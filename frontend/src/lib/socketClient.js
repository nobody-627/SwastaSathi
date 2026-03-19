import { createVitalsSocket } from '../api/client'

class SocketLikeClient {
  constructor() {
    this.handlers = new Map()
    this.connected = false

    this.ws = createVitalsSocket(
      (payload) => {
        this.connected = true
        const eventName = payload?.type || 'message'
        this.dispatch(eventName, payload)
      },
      () => {
        this.connected = false
      },
    )
  }

  on(event, callback) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event).add(callback)
  }

  off(event, callback) {
    if (!this.handlers.has(event)) return
    if (!callback) {
      this.handlers.delete(event)
      return
    }
    this.handlers.get(event).delete(callback)
  }

  emit(event, payload = {}) {
    this.ws.send({ type: event, ...payload })
  }

  dispatch(event, payload) {
    const set = this.handlers.get(event)
    if (!set) return
    set.forEach((cb) => {
      try {
        cb(payload)
      } catch {
        // ignore handler crashes
      }
    })
  }
}

const socket = new SocketLikeClient()

export default socket
