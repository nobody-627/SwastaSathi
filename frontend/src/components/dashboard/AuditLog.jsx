import { useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useAgentStore } from '../../store/agentStore'

const TIER_STYLES = {
  normal:   { border: '#bbf7d0', bg: '#f0fdf4', label: 'text-emerald-600' },
  warn:     { border: '#fde68a', bg: '#fffbeb', label: 'text-amber-600'   },
  orange:   { border: '#fed7aa', bg: '#fff7ed', label: 'text-orange-600'  },
  critical: { border: '#fecdd3', bg: '#fff5f7', label: 'text-rose-600'    },
}

const ACTION_ICONS = {
  NONE:          '●',
  YELLOW_ALERT:  '⚠',
  ORANGE_ALERT:  '🔶',
  RED_ALERT:     '🚨',
}

const FILTERS = ['ALL', 'WARN', 'CRITICAL']

function exportCSV(log) {
  const header = 'Time,HR,SpO2,Temp,HRV,Risk,Pattern,Confidence,Action'
  const rows = log.map(e =>
    `${e.timestamp},${e.reading.hr},${e.reading.spo2},${e.reading.temp},${e.reading.hrv},${e.riskScore},${e.pattern},${e.confidence},${e.action}`
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `swasthsathi_audit_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AuditLog() {
  const { auditLog, clearLog } = useAgentStore()
  const [filter, setFilter] = useState('ALL')

  const filtered = auditLog.filter(e => {
    if (filter === 'ALL')      return true
    if (filter === 'WARN')     return e.tier === 'warn' || e.tier === 'orange'
    if (filter === 'CRITICAL') return e.tier === 'critical'
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">Audit Log</span>
          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {auditLog.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => exportCSV(auditLog)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Export CSV"
          >
            <Download size={13} />
          </button>
          <button
            onClick={clearLog}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors"
            title="Clear log"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-3">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'text-[11px] font-semibold px-3 py-1 rounded-full border transition-all',
              filter === f
                ? 'bg-rose-500 text-white border-rose-500'
                : 'text-gray-500 border-gray-200 hover:border-rose-300 hover:text-rose-500 bg-white'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5 pr-1" style={{ maxHeight: 420 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-300 text-sm">
            {auditLog.length === 0 ? 'Agent initializing…' : 'No entries match filter'}
          </div>
        ) : (
          filtered.map(entry => {
            const ts = TIER_STYLES[entry.tier] || TIER_STYLES.normal
            return (
              <div
                key={entry.id}
                className="border-l-2 pl-2.5 pr-2 py-2 rounded-r-lg animate-slide-in"
                style={{ borderColor: ts.border, background: ts.bg }}
              >
                <div className="flex justify-between items-start mb-0.5">
                  <span className={clsx('text-[11px] font-bold', ts.label)}>
                    {ACTION_ICONS[entry.action]} {entry.pattern}
                  </span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{entry.timestamp}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono mb-0.5">
                  HR:{entry.reading.hr} SpO2:{entry.reading.spo2}% T:{entry.reading.temp}° HRV:{entry.reading.hrv}ms
                </div>
                <div className="text-[10px] text-gray-400 font-semibold">
                  Risk:{entry.riskScore.toFixed(1)} · Conf:{entry.confidence}%
                </div>
                {entry.tier !== 'normal' && (
                  <p className="text-[10px] text-gray-500 italic leading-snug mt-1 line-clamp-2">
                    {entry.reasoning}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
