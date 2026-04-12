require('dotenv').config({ path: '.env.local' });
const { requireAuth } = require('../_auth');
const { getRedis } = require('../_redis');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const redis = getRedis();
  const key = `user:${user.id}:ledger`;

  if (req.method === 'GET') {
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    return res.json(items.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }

  if (req.method === 'POST') {
    const { type, personId, personName, amount, description, date, dueDate } = req.body;
    if (!type || !amount || !personName || !date) return res.status(400).json({ error: 'type, personName, amount, date required' });
    if (!['lent', 'borrowed'].includes(type)) return res.status(400).json({ error: 'type must be lent or borrowed' });

    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const entry = { id: uuidv4(), type, personId, personName, amount: parseFloat(amount), description, date, dueDate, status: 'pending', createdAt: new Date().toISOString() };
    items.push(entry);
    await redis.set(key, JSON.stringify(items));
    return res.status(201).json(entry);
  }

  if (req.method === 'PUT') {
    // Settle an entry
    const { id, status } = req.body;
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    items[idx].status = status;
    items[idx].settledAt = new Date().toISOString();
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
