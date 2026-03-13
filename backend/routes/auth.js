import { Router } from 'express';
const router = Router();

// Mock users DB
const users = [
  { id: '1', name: 'Ramesh Kumar', email: 'patient@swasthsathi.in', role: 'patient', age: 64 },
  { id: '2', name: 'Dr. Priya Mehta', email: 'doctor@swasthsathi.in', role: 'doctor', age: 38 },
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Mock: any password works for demo
  const user = users.find(u => u.email === email) || users[0];
  res.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, age: user.age },
    token: `mock_token_${user.id}_${Date.now()}`,
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  const newUser = { id: String(users.length + 1), name, email, role: 'patient', age: 30 };
  users.push(newUser);
  res.json({ ok: true, user: newUser, token: `mock_token_${newUser.id}_${Date.now()}` });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  res.json({ user: users[0] });
});

export default router;
