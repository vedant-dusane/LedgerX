require('dotenv').config({ path: '.env.local' });
const { requireAuth } = require('../_auth');
const { getRedis } = require('../_redis');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const user = requireAuth(req, res);
  if (!user) return;
  const redis = getRedis();

  // Get current month expenses
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  const [currentRaw, prevRaw, savingsRaw, ledgerRaw] = await Promise.all([
    redis.get(`user:${user.id}:expenses:${currentMonth}`),
    redis.get(`user:${user.id}:expenses:${prevMonth}`),
    redis.get(`user:${user.id}:savings`),
    redis.get(`user:${user.id}:ledger`),
  ]);

  const parseJ = (r) => r ? (typeof r === 'string' ? JSON.parse(r) : r) : [];

  const currentExpenses = parseJ(currentRaw);
  const prevExpenses = parseJ(prevRaw);
  const savings = parseJ(savingsRaw);
  const ledger = parseJ(ledgerRaw);

  const totalExpensesThisMonth = currentExpenses.reduce((s, e) => s + e.amount, 0);
  const totalExpensesPrevMonth = prevExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = savings.reduce((s, g) => s + g.currentAmount, 0);

  const pendingLent = ledger.filter(l => l.type === 'lent' && l.status === 'pending').reduce((s, l) => s + l.amount, 0);
  const pendingBorrowed = ledger.filter(l => l.type === 'borrowed' && l.status === 'pending').reduce((s, l) => s + l.amount, 0);
  const netLedger = pendingLent - pendingBorrowed;

  // Category breakdown
  const categoryMap = {};
  currentExpenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  // Last 6 months expenses
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const raw = await redis.get(`user:${user.id}:expenses:${mKey}`);
    const items = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    monthlyTrend.push({
      month: mKey,
      total: items.reduce((s, e) => s + e.amount, 0),
      label: d.toLocaleString('default', { month: 'short' })
    });
  }

  res.json({
    currentMonth,
    totalExpensesThisMonth,
    totalExpensesPrevMonth,
    totalSaved,
    pendingLent,
    pendingBorrowed,
    netLedger,
    netPosition: totalSaved + netLedger - totalExpensesThisMonth,
    categoryBreakdown: Object.entries(categoryMap).map(([cat, amt]) => ({ category: cat, amount: amt })),
    monthlyTrend,
    savingsGoals: savings.length,
    activeTransactions: ledger.filter(l => l.status === 'pending').length
  });
};
