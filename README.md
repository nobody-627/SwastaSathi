# 🩺 SwasthSathi — AI Health Monitoring System

**Real-time autonomous health monitoring with AI-powered risk assessment, tiered emergency escalation, and explainable clinical reasoning.**

---

## ✨ What's Included

| Layer | Stack | Purpose |
|-------|-------|---------|
| **Backend** | Node.js + Express + WebSocket | Live vitals streaming, Claude AI proxy, audit log API |
| **Frontend** | React 18 + Vite + Tailwind CSS | Landing page + full live dashboard |
| **AI Agent** | Anthropic Claude Sonnet | Autonomous risk analysis every 3s |
| **State** | Zustand | Global agent + vitals store |
| **Charts** | Recharts | Live area charts + radial risk gauge |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- Anthropic API key (optional — works offline with local AI fallback)

### 1. Install Dependencies

```bash
# From project root
npm run install:all

# Or individually:
cd backend  && npm install
cd frontend && npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-your-key-here   # Optional — app works without it
FRONTEND_URL=http://localhost:5173
```

### 3. Run (Two Terminals)

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → API:       http://localhost:3001
# → WebSocket: ws://localhost:3001/ws/vitals
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → App: http://localhost:5173
```

### 4. Open the App

Visit **http://localhost:5173**

- **Landing page** — full marketing site with all 9 sections
- **Dashboard** — click "Open Dashboard" to launch live monitoring

---

## 📁 Project Structure

```
swasthsathi/
├── backend/
│   ├── server.js              # Express + WebSocket server
│   ├── routes/
│   │   ├── agent.js           # Claude AI proxy endpoint
│   │   ├── vitals.js          # Audit log + thresholds REST API
│   │   └── auth.js            # Mock auth (login/register)
│   └── .env.example
│
└── frontend/
    ├── index.html
    ├── vite.config.js         # Proxy → backend:3001
    ├── tailwind.config.js     # Rose theme + custom animations
    └── src/
        ├── main.jsx
        ├── App.jsx            # React Router setup
        ├── index.css          # Tailwind base + component classes
        ├── api/
        │   └── client.js      # API client + WebSocket helper
        ├── store/
        │   └── agentStore.js  # Zustand global state
        ├── hooks/
        │   └── useAgent.js    # Main 3s agent loop + helpers
        ├── pages/
        │   ├── Home.jsx       # Landing page
        │   └── Dashboard.jsx  # Live monitoring dashboard
        └── components/
            ├── Navbar.jsx
            ├── Hero.jsx
            ├── LandingComponents.jsx  # TrustStrip, Features, HowItWorks,
            │                          # Testimonials, Pricing, CTA, Footer
            ├── ui/
            │   ├── Button.jsx
            │   └── Card.jsx
            └── dashboard/
                ├── VitalsCard.jsx      # HR / SpO2 / Temp / HRV cards
                ├── RiskGauge.jsx       # Recharts RadialBarChart 0–10
                ├── VitalsChart.jsx     # Live area charts
                ├── AgentPanel.jsx      # Status + reasoning + weights
                ├── AuditLog.jsx        # Timestamped event log
                ├── EscalationPanel.jsx # 3-tier alert system + baseline
                ├── CriticalOverlay.jsx # Full-screen emergency modal
                └── DemoControls.jsx    # Inject anomaly scenarios
```

---

## 🧠 AI Agent Architecture

```
Every 3 seconds:
  1. Generate vital reading (baseline + gaussian noise)
  2. Update rolling 20-reading personal baseline
  3. Calculate 5-reading trend (rising/falling/stable)
  4. POST /api/agent/analyze → Claude Sonnet
  5. Parse JSON: { risk_score, pattern, confidence, action, reasoning, weights }
  6. Update Zustand store (streamed to UI character-by-character)
  7. Trigger escalation tier if thresholds crossed
  8. Append to audit log + POST /api/vitals/log
```

### Risk Scoring
| Score | Pattern | Action |
|-------|---------|--------|
| 0–3.9 | NORMAL | NONE |
| 4–5.9 | ELEVATED | YELLOW_ALERT |
| 6–7.9 | CONCERNING / CARDIAC | ORANGE_ALERT |
| 8–10  | CRITICAL / HYPOXIC | RED_ALERT + overlay |

### Escalation Tiers
| Tier | Trigger | Cooldown | Action |
|------|---------|----------|--------|
| Yellow | risk ≥ 4.0 | 5 min | Notify patient |
| Orange | risk ≥ 6.0 | 10 min | Notify emergency contact |
| Red    | risk ≥ 8.0 | 1 min | Emergency services + overlay |

---

## 🎛️ Dashboard Features

- **4 VitalCards** — live HR, SpO2, Temp, HRV with trend arrows and status colors
- **Risk Gauge** — animated radial chart, color-coded green→amber→orange→red
- **AI Reasoning Panel** — streaming text with character-by-character reveal, weight bars
- **4 Live Area Charts** — 40-reading rolling window, per-vital color
- **Baseline Calibration** — progress bar, 20-reading personalized baseline
- **Escalation Tiers** — live armed/cooldown/fired count per tier
- **Audit Log** — ALL/WARN/CRITICAL filter tabs, CSV export
- **Alert Banner** — inline action banner per tier
- **Critical Overlay** — full-screen emergency modal with action checklist
- **Demo Controls** — Normal / Cardiac / Hypoxic / Stress / Pause

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/agent/analyze` | Claude AI analysis |
| GET | `/api/agent/status` | AI status + model info |
| GET | `/api/vitals/thresholds` | Clinical thresholds |
| POST | `/api/vitals/log` | Save audit entry |
| GET | `/api/vitals/history` | Get audit history |
| DELETE | `/api/vitals/log` | Clear session log |
| POST | `/api/auth/login` | Mock login |
| POST | `/api/auth/register` | Mock register |
| WS | `/ws/vitals` | Live vitals stream |

---

## 🎨 Design System

- **Font**: DM Serif Display (headings) + DM Sans (body) + JetBrains Mono (values)
- **Primary**: Rose 500 `#f43f5e` with gradient to Rose 700
- **Status colors**: Emerald (normal), Amber (warning), Orange (elevated), Rose (critical)
- **Radius**: `rounded-2xl` cards, `rounded-full` buttons/badges
- **Animations**: fade-up, float, pulse-ring, slide-in, blink

---

## 📝 Without API Key

The app works fully without an Anthropic API key using a built-in local AI fallback in `useAgent.js`. The fallback applies the same clinical rule logic:
- Single deviation → ELEVATED + YELLOW_ALERT
- Multi-vital deviation → CONCERNING + ORANGE_ALERT  
- SpO2 < 90% or HRV < 15 + HR > 120 → CRITICAL + RED_ALERT

Add `ANTHROPIC_API_KEY` to `backend/.env` to upgrade to full Claude reasoning.

---

## 🏗️ Built With

- React 18, React Router 6, Vite 5
- Tailwind CSS 3 + DM Serif Display / DM Sans / JetBrains Mono
- Recharts 2 (RadialBarChart, AreaChart)
- Zustand 4 (state management)
- Express 4 + WebSocket (ws)
- Anthropic Claude Sonnet

---

*Made with ❤️ for better health in India — Team Coding Nitrates*
