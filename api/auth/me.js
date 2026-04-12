require('dotenv').config({ path: '.env.local' });
const { requireAuth } = require('../_auth');
const { getRedis } = require('../_redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = requireAuth(req, res);
  if (!user) return;
  const redis = getRedis();
  const raw = await redis.get(`user:${user.id}`);
  const u = typeof raw === 'string' ? JSON.parse(raw) : raw;
  res.json({ id: u.id, name: u.name, email: u.email, currency: u.currency, createdAt: u.createdAt });
};
