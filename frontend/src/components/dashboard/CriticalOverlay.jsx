import { AlertTriangle, X, Phone, MapPin, Heart } from 'lucide-react'
import { useAgentStore } from '../../store/agentStore'
import { useEffect } from 'react'

export default function CriticalOverlay() {
  const { agent, latest, setShowOverlay, emergencyPhone, setEmergencyPhone } = useAgentStore()

  // Play alert sound and voice when overlay appears
  useEffect(() => {
    // Play alert sound
    playAlertSound()

    // Speak the alert message
    speakAlert(`Critical alert detected. Risk score ${agent.riskScore.toFixed(1)}. ${agent.reasoning}`)

    // Cleanup function to stop any ongoing speech
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Function to play alert sound
  const playAlertSound = () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Create oscillator for alert sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Configure sound (urgent beep pattern)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      // Play sound
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn('Could not play alert sound:', error)
    }
  }

  // Function to speak alert message
  const speakAlert = (message) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(message)

      // Configure voice settings for urgency
      utterance.rate = 1.2 // Slightly faster
      utterance.pitch = 1.1 // Slightly higher pitch
      utterance.volume = 0.8

      // Try to use a female voice if available (often sounds more urgent)
      const voices = window.speechSynthesis.getVoices()
      const femaleVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('victoria')
      )
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border-2 border-rose-400 shadow-2xl shadow-rose-300/40 overflow-hidden">

        {/* Red header band */}
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-lg font-serif">Critical Alert</div>
              <div className="text-rose-100 text-xs">{agent.pattern}</div>
            </div>
          </div>
          <button
            onClick={() => setShowOverlay(false)}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Risk score */}
          <div className="bg-rose-50 rounded-2xl p-4 text-center mb-5">
            <div className="text-5xl font-bold font-mono text-rose-500 mb-1">
              {agent.riskScore.toFixed(1)}
            </div>
            <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">Risk Score</div>
            <p className="text-sm text-gray-600 italic leading-relaxed">{agent.reasoning}</p>
          </div>

          {/* Current vitals snapshot */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { label: 'HR', value: `${latest.hr}`, unit: 'bpm', color: '#f43f5e' },
              { label: 'SpO2', value: `${latest.spo2}`, unit: '%', color: '#3b82f6' },
              { label: 'Temp', value: `${latest.temp}`, unit: '°C', color: '#8b5cf6' },
              { label: 'HRV', value: `${latest.hrv}`, unit: 'ms', color: '#f59e0b' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="text-center bg-gray-50 rounded-xl p-2">
                <div className="text-lg font-bold font-mono" style={{ color }}>{value}</div>
                <div className="text-[10px] text-gray-400 font-medium">{label}<br />{unit}</div>
              </div>
            ))}
          </div>

          {/* Actions taken */}
          <div className="space-y-2 mb-6">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Actions Taken</div>
            {[
              { icon: <Phone size={12} />, text: 'Emergency services mock-notified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: <Heart size={12} />, text: 'Emergency contact SMS with vitals snapshot sent', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: <MapPin size={12} />, text: 'Location coordinates transmitted', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(({ icon, text, color, bg }) => (
              <div key={text} className={`flex items-center gap-2.5 ${bg} rounded-lg px-3 py-2`}>
                <span className={color}>{icon}</span>
                <span className={`text-xs font-medium ${color}`}>{text}</span>
              </div>
            ))}
          </div>

          {/* Emergency contact input */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Emergency contact number</label>
            <input
              type="tel"
              placeholder="Emergency contact number (e.g. 9876543210)"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>

          {/* Dismiss */}
          <button
            onClick={() => setShowOverlay(false)}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold py-3.5 rounded-xl hover:from-rose-600 hover:to-rose-700 active:scale-95 transition-all text-sm"
          >
            I'm okay — mark as false alarm
          </button>
        </div>
      </div>

      {/* Voice control buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <button
          onClick={() => speakAlert(`Critical alert detected. Risk score ${agent.riskScore.toFixed(1)}. ${agent.reasoning}`)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Repeat voice alert"
        >
          🔊
        </button>
        <button
          onClick={() => {
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel()
            }
          }}
          className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Stop voice"
        >
          🔇
        </button>
      </div>
    </div>
  )
}
