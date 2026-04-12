require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getRedis } = require('../_redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const redis = getRedis();
  const userId = await redis.get(`user:email:${email}`);
  if (!userId) return res.status(401).json({ error: 'Invalid credentials' });

  const raw = await redis.get(`user:${userId}`);
  if (!raw) return res.status(401).json({ error: 'Invalid credentials' });

  const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, currency: user.currency },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, currency: user.currency } });
};
