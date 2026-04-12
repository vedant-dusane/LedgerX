require('dotenv').config({ path: '.env.local' });
const { requireAuth } = require('../_auth');
const { getRedis } = require('../_redis');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const redis = getRedis();

  if (req.method === 'GET') {
    const { month } = req.query; // format: 2024-01
    const key = month
      ? `user:${user.id}:expenses:${month}`
      : null;

    if (key) {
      const raw = await redis.get(key);
      const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      return res.json(items);
    } else {
      // Get all months
      const keys = await redis.keys(`user:${user.id}:expenses:*`);
      const all = [];
      for (const k of keys) {
        const raw = await redis.get(k);
        const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
        all.push(...items);
      }
      return res.json(all.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }
  }

  if (req.method === 'POST') {
    const { amount, category, description, date, isRecurring = false } = req.body;
    if (!amount || !category || !date) return res.status(400).json({ error: 'amount, category, date required' });

    const month = date.slice(0, 7);
    const key = `user:${user.id}:expenses:${month}`;
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];

    const entry = { id: uuidv4(), amount: parseFloat(amount), category, description, date, isRecurring, createdAt: new Date().toISOString() };
    items.push(entry);
    await redis.set(key, JSON.stringify(items));
    return res.status(201).json(entry);
  }

  if (req.method === 'DELETE') {
    const { id, month } = req.query;
    if (!id || !month) return res.status(400).json({ error: 'id and month required' });
    const key = `user:${user.id}:expenses:${month}`;
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const filtered = items.filter(i => i.id !== id);
    await redis.set(key, JSON.stringify(filtered));
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
