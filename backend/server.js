import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import vitalsRouter from './routes/vitals.js';
import agentRouter from './routes/agent.js';
import authRouter from './routes/auth.js';
import predictionRouter from './routes/prediction.js';
import emergencyRouter from './routes/emergency.js';

config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Security & middleware ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/vitals', vitalsRouter);
app.use('/api/agent', agentRouter);
app.use('/api/auth', authRouter);
app.use('/api/prediction', predictionRouter);
app.use('/api/emergency', emergencyRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SwasthSathi API',
    version: '1.0.0',
  });
});

// ── WebSocket Server ──────────────────────────────────────────
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws/vitals' });

// Vital generators
const noise = (range) => (Math.random() - 0.5) * range;

const generateReading = (baseline, mode) => {
  if (!mode) {
    return {
      hr: Math.round(baseline.hr + noise(8)),
      spo2: Math.round((baseline.spo2 + noise(2)) * 10) / 10,
      temp: Math.round((baseline.temp + noise(0.4)) * 10) / 10,
      hrv: Math.round(baseline.hrv + noise(10)),
      timestamp: Date.now(),
    };
  }
  const modes = {
    cardiac: { hr: Math.round(130 + noise(15)), spo2: Math.round((93 + noise(2)) * 10) / 10, temp: Math.round((37.1 + noise(0.3)) * 10) / 10, hrv: Math.round(10 + noise(4)) },
    hypoxic: { hr: Math.round(120 + noise(12)), spo2: Math.round((87 + noise(3)) * 10) / 10, temp: Math.round((37.3 + noise(0.2)) * 10) / 10, hrv: Math.round(11 + noise(3)) },
    stress:  { hr: Math.round(105 + noise(10)), spo2: Math.round((94 + noise(2)) * 10) / 10, temp: Math.round((37.2 + noise(0.3)) * 10) / 10, hrv: Math.round(17 + noise(5)) },
  };
  return { ...(modes[mode] || modes.cardiac), timestamp: Date.now() };
};

// Per-client state
const clientState = new Map();

wss.on('connection', (ws, req) => {
  const clientId = Math.random().toString(36).slice(2);
  const state = {
    baseline: { hr: 72, spo2: 97, temp: 36.6, hrv: 45 },
    mode: null,
    interval: null,
    readings: [],
  };
  clientState.set(clientId, state);
  console.log(`[WS] Client connected: ${clientId}`);

  // Send initial connection ack
  ws.send(JSON.stringify({ type: 'connected', clientId, message: 'SwasthSathi WebSocket connected' }));

  // Start streaming vitals every 3s
  state.interval = setInterval(() => {
    if (ws.readyState !== ws.OPEN) return;
    const reading = generateReading(state.baseline, state.mode);
    state.readings.push(reading);
    if (state.readings.length > 60) state.readings.shift();

    // Update rolling baseline
    if (state.readings.length >= 5) {
      const last = state.readings.slice(-20);
      state.baseline = {
        hr: last.reduce((s, r) => s + r.hr, 0) / last.length,
        spo2: last.reduce((s, r) => s + r.spo2, 0) / last.length,
        temp: last.reduce((s, r) => s + r.temp, 0) / last.length,
        hrv: last.reduce((s, r) => s + r.hrv, 0) / last.length,
      };
    }

    ws.send(JSON.stringify({
      type: 'vital',
      reading,
      baseline: state.baseline,
      readingCount: state.readings.length,
    }));
  }, 3000);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'set_mode') {
        state.mode = msg.mode;
        ws.send(JSON.stringify({ type: 'mode_set', mode: msg.mode }));
      }
    } catch (e) { /* ignore */ }
  });

  ws.on('close', () => {
    clearInterval(state.interval);
    clientState.delete(clientId);
    console.log(`[WS] Client disconnected: ${clientId}`);
  });

  ws.on('error', (err) => {
    console.error(`[WS] Error for ${clientId}:`, err.message);
    clearInterval(state.interval);
    clientState.delete(clientId);
  });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 SwasthSathi API running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws/vitals`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
