require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getRedis } = require('../_redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password, currency = 'INR' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  const redis = getRedis();
  const existing = await redis.get(`user:email:${email}`);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id = `usr_${Date.now()}`;
  const hash = await bcrypt.hash(password, 10);
  const user = { id, name, email, passwordHash: hash, currency, createdAt: new Date().toISOString() };

  await redis.set(`user:${id}`, JSON.stringify(user));
  await redis.set(`user:email:${email}`, id);

  const token = jwt.sign({ id, name, email, currency }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email, currency } });
};
