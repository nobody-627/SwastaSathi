import { useEffect } from 'react'
import { Heart, Activity, Thermometer, Zap, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAgentStore } from '../store/agentStore'
import { useAgent, calcTrend } from '../hooks/useAgent'

import VitalsCard       from '../components/dashboard/VitalsCard'
import RiskGauge        from '../components/dashboard/RiskGauge'
import VitalsChart      from '../components/dashboard/VitalsChart'
import AgentPanel       from '../components/dashboard/AgentPanel'
import ActivitySelector from '../components/dashboard/ActivitySelector'
import AuditLog         from '../components/dashboard/AuditLog'
import CriticalOverlay  from '../components/dashboard/CriticalOverlay'
import DemoControls     from '../components/dashboard/DemoControls'
import { EscalationPanel, BaselinePanel } from '../components/dashboard/EscalationPanel'

const VITAL_CONFIG = [
  { key: 'hr',   label: 'Heart Rate',  unit: 'bpm', icon: <Heart   size={16} className="text-rose-500 fill-rose-200" /> },
  { key: 'spo2', label: 'SpO2',        unit: '%',   icon: <Activity size={16} className="text-blue-500" />              },
  { key: 'temp', label: 'Temperature', unit: '°C',  icon: <Thermometer size={16} className="text-violet-500" />         },
  { key: 'hrv',  label: 'HRV',         unit: 'ms',  icon: <Zap      size={16} className="text-amber-500" />             },
]

const ACTION_BANNER = {
  YELLOW_ALERT: { bg: 'bg-amber-50 border-amber-200',   text: 'text-amber-700',  msg: '⚠️ Yellow Alert — Mild vital deviation detected. Monitor closely.' },
  ORANGE_ALERT: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', msg: '🔶 Orange Alert — Multiple deviations detected. Emergency contact notified.' },
  RED_ALERT:    { bg: 'bg-rose-50 border-rose-400',     text: 'text-rose-700',   msg: '🚨 RED ALERT — Critical vitals. Emergency services being contacted.' },
}

export default function Dashboard() {
  // Start the agent loop
  useAgent()

  const { readings, baseline, latest, agent, showOverlay } = useAgentStore()
  const trends = {
    hr:   calcTrend(readings, 'hr'),
    spo2: calcTrend(readings, 'spo2'),
    temp: calcTrend(readings, 'temp'),
    hrv:  calcTrend(readings, 'hrv'),
  }

  const actionBanner = ACTION_BANNER[agent.action]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Critical overlay */}
      {showOverlay && <CriticalOverlay />}

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-rose-50 px-4 sm:px-6 py-3 sticky top-16 z-30">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">

          {/* Left — patient info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-gray-800">
                Live Monitoring — Ramesh Kumar, 64
              </span>
            </div>
            <span className="hidden sm:inline text-xs font-semibold bg-rose-50 text-rose-500 border border-rose-200 rounded-full px-2.5 py-0.5">
              Cycle #{agent.cycle}
            </span>
            {agent.isMock && (
              <span className="hidden sm:inline text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-2.5 py-0.5">
                Local AI (add API key for Claude)
              </span>
            )}
          </div>

          {/* Right — controls */}
          <div className="flex items-center gap-3">
            <DemoControls />
            <Link to="/" className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-rose-500 transition-colors ml-2">
              <Home size={13} /> Home
            </Link>
          </div>
        </div>
      </div>

      {/* ── Alert banner ─────────────────────────────────────── */}
      {actionBanner && (
        <div className={`border-b px-4 sm:px-6 py-2.5 ${actionBanner.bg}`}>
          <div className="max-w-screen-xl mx-auto">
            <p className={`text-sm font-semibold ${actionBanner.text}`}>{actionBanner.msg}</p>
          </div>
        </div>
      )}

      {/* ── Main 3-column grid ───────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_280px] gap-5">

          {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
          <div className="flex flex-col gap-4 order-2 xl:order-1">
            <AgentPanel />
            <ActivitySelector />
            <RiskGauge
              score={agent.riskScore}
              pattern={agent.pattern}
              confidence={agent.confidence}
            />
            <BaselinePanel />
          </div>

          {/* ── CENTRE CANVAS ─────────────────────────────────── */}
          <div className="flex flex-col gap-5 order-1 xl:order-2">

            {/* Vitals row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {VITAL_CONFIG.map(({ key, icon }) => (
                <VitalsCard
                  key={key}
                  metricKey={key}
                  value={latest[key]}
                  trend={trends[key]}
                  baseline={baseline[key]}
                  icon={icon}
                />
              ))}
            </div>

            {/* Live charts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Live Vitals History</h3>
                <span className="text-[11px] text-gray-400">Last 40 readings · 3s interval</span>
              </div>
              <VitalsChart readings={readings} />
            </div>

            {/* EscalationPanel on mobile */}
            <div className="xl:hidden">
              <EscalationPanel />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────── */}
          <div className="flex flex-col gap-4 order-3">
            <div className="hidden xl:block">
              <EscalationPanel />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1">
              <AuditLog />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
