import { Router } from 'express';
const router = Router();

// In-memory audit log per session (keyed by session id from query)
const auditLogs = new Map();

// GET /api/vitals/history?session=xxx
router.get('/history', (req, res) => {
  const sessionId = req.query.session || 'default';
  const log = auditLogs.get(sessionId) || [];
  res.json({ entries: log.slice(0, 100), total: log.length });
});

// POST /api/vitals/log — save an audit entry
router.post('/log', (req, res) => {
  const { sessionId = 'default', entry } = req.body;
  if (!entry) return res.status(400).json({ error: 'Missing entry' });

  if (!auditLogs.has(sessionId)) auditLogs.set(sessionId, []);
  const log = auditLogs.get(sessionId);
  log.unshift({ ...entry, savedAt: new Date().toISOString() });
  if (log.length > 500) log.pop();

  res.json({ ok: true, total: log.length });
});

// GET /api/vitals/thresholds — return clinical thresholds
router.get('/thresholds', (req, res) => {
  res.json({
    hr:   { normal: [60, 100], warning: [50, 120], critical_low: 50, critical_high: 120, unit: 'bpm' },
    spo2: { normal: [95, 100], warning: [90, 94], critical_low: 90, unit: '%' },
    temp: { normal: [36.1, 37.2], warning: [35.5, 38.0], critical_low: 35.5, critical_high: 38.0, unit: '°C' },
    hrv:  { normal: [20, 70], warning: [15, 90], critical_low: 15, critical_high: 90, unit: 'ms' },
  });
});

// DELETE /api/vitals/log?session=xxx
router.delete('/log', (req, res) => {
  const sessionId = req.query.session || 'default';
  auditLogs.delete(sessionId);
  res.json({ ok: true, message: 'Log cleared' });
});

export default router;
