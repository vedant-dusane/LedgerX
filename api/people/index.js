require('dotenv').config({ path: '.env.local' });
const { requireAuth } = require('../_auth');
const { getRedis } = require('../_redis');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const redis = getRedis();
  const key = `user:${user.id}:people`;

  if (req.method === 'GET') {
    const raw = await redis.get(key);
    return res.json(raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : []);
  }

  if (req.method === 'POST') {
    const { name, phone, note } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const raw = await redis.get(key);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const entry = { id: uuidv4(), name, phone, note, createdAt: new Date().toISOString() };
    items.push(entry);
    await redis.set(key, JSON.stringify(items));
    return res.status(201).json(entry);
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
