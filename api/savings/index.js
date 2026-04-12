require('dotenv').config({ path: '.env.local' });
const { requireAuth } = require('../_auth');
const { getRedis } = require('../_redis');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const redis = getRedis();
  const key = `user:${user.id}:savings`;

  if (req.method === 'GET') {
    const raw = await redis.get(key);
    return res.json(raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []);
  }

  if (req.method === 'POST') {
    const { name, targetAmount, currentAmount = 0, targetDate, icon = '🎯' } = req.body;
    if (!name || !targetAmount) return res.status(400).json({ error: 'name and targetAmount required' });
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const entry = { id: uuidv4(), name, targetAmount: parseFloat(targetAmount), currentAmount: parseFloat(currentAmount), targetDate, icon, createdAt: new Date().toISOString() };
    items.push(entry);
    await redis.set(key, JSON.stringify(items));
    return res.status(201).json(entry);
  }

  if (req.method === 'PUT') {
    const { id, currentAmount } = req.body;
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    items[idx].currentAmount = parseFloat(currentAmount);
    items[idx].updatedAt = new Date().toISOString();
    await redis.set(key, JSON.stringify(items));
    return res.json(items[idx]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    await redis.set(key, JSON.stringify(items.filter(i => i.id !== id)));
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
