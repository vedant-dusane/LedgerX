/**
 * LedgerX Demo Data Seeder
 * Run: node seed-demo.js
 * Creates a demo account with pre-filled realistic data
 */
require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');
const bcrypt = require('bcryptjs');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const DEMO = {
  id: 'usr_demo_001',
  name: 'Arjun Mehta',
  email: 'demo@ledgerx.app',
  password: 'demo1234',
  currency: 'INR',
};

function uid() {
  return 'id_' + Math.random().toString(36).slice(2, 10);
}

function monthKey(monthsAgo = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function dateInMonth(monthsAgo = 0, day) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  console.log('\n🌱 LedgerX Demo Seeder\n');

  // --- USER ---
  const hash = await bcrypt.hash(DEMO.password, 10);
  const user = { ...DEMO, passwordHash: hash, createdAt: new Date().toISOString() };
  await redis.set(`user:${DEMO.id}`, JSON.stringify(user));
  await redis.set(`user:email:${DEMO.email}`, DEMO.id);
  console.log('✅ Demo user created');
  console.log(`   Email   : ${DEMO.email}`);
  console.log(`   Password: ${DEMO.password}\n`);

  // --- EXPENSES: current month ---
  const expenses0 = [
    { id: uid(), amount: 4200, category: 'Housing', description: 'Monthly rent', date: dateInMonth(0, 1), isRecurring: true },
    { id: uid(), amount: 850,  category: 'Food & Dining', description: 'Groceries - D-Mart', date: dateInMonth(0, 3), isRecurring: false },
    { id: uid(), amount: 320,  category: 'Transport', description: 'Ola / Uber rides', date: dateInMonth(0, 5), isRecurring: false },
    { id: uid(), amount: 599,  category: 'Entertainment', description: 'Netflix subscription', date: dateInMonth(0, 6), isRecurring: true },
    { id: uid(), amount: 1200, category: 'Food & Dining', description: 'Dinner - Social', date: dateInMonth(0, 8), isRecurring: false },
    { id: uid(), amount: 499,  category: 'Utilities', description: 'Electricity bill', date: dateInMonth(0, 10), isRecurring: true },
    { id: uid(), amount: 2500, category: 'Shopping', description: 'Clothes - Myntra', date: dateInMonth(0, 12), isRecurring: false },
    { id: uid(), amount: 450,  category: 'Food & Dining', description: 'Swiggy orders', date: dateInMonth(0, 14), isRecurring: false },
    { id: uid(), amount: 799,  category: 'Entertainment', description: 'Amazon Prime', date: dateInMonth(0, 15), isRecurring: true },
    { id: uid(), amount: 3500, category: 'EMI', description: 'Phone EMI', date: dateInMonth(0, 1), isRecurring: true },
    { id: uid(), amount: 650,  category: 'Healthcare', description: 'Doctor consultation', date: dateInMonth(0, 9), isRecurring: false },
    { id: uid(), amount: 280,  category: 'Transport', description: 'Monthly metro card top-up', date: dateInMonth(0, 2), isRecurring: true },
  ].map(e => ({ ...e, createdAt: new Date().toISOString() }));

  await redis.set(`user:${DEMO.id}:expenses:${monthKey(0)}`, JSON.stringify(expenses0));
  console.log(`✅ ${expenses0.length} expenses added for current month (${monthKey(0)})`);

  // --- EXPENSES: last month ---
  const expenses1 = [
    { id: uid(), amount: 4200, category: 'Housing', description: 'Monthly rent', date: dateInMonth(1, 1), isRecurring: true },
    { id: uid(), amount: 1100, category: 'Food & Dining', description: 'Groceries', date: dateInMonth(1, 5), isRecurring: false },
    { id: uid(), amount: 599,  category: 'Entertainment', description: 'Netflix', date: dateInMonth(1, 6), isRecurring: true },
    { id: uid(), amount: 850,  category: 'Transport', description: 'Auto + Uber', date: dateInMonth(1, 10), isRecurring: false },
    { id: uid(), amount: 499,  category: 'Utilities', description: 'Electricity', date: dateInMonth(1, 12), isRecurring: true },
    { id: uid(), amount: 3500, category: 'EMI', description: 'Phone EMI', date: dateInMonth(1, 1), isRecurring: true },
    { id: uid(), amount: 1800, category: 'Shopping', description: 'Books + stationery', date: dateInMonth(1, 18), isRecurring: false },
    { id: uid(), amount: 350,  category: 'Food & Dining', description: 'Zomato', date: dateInMonth(1, 20), isRecurring: false },
    { id: uid(), amount: 6500, category: 'Travel', description: 'Goa trip - hotel', date: dateInMonth(1, 22), isRecurring: false },
    { id: uid(), amount: 2200, category: 'Travel', description: 'Goa trip - flights', date: dateInMonth(1, 21), isRecurring: false },
  ].map(e => ({ ...e, createdAt: new Date().toISOString() }));

  await redis.set(`user:${DEMO.id}:expenses:${monthKey(1)}`, JSON.stringify(expenses1));
  console.log(`✅ ${expenses1.length} expenses added for last month (${monthKey(1)})`);

  // --- EXPENSES: 2 months ago ---
  const expenses2 = [
    { id: uid(), amount: 4200, category: 'Housing', description: 'Monthly rent', date: dateInMonth(2, 1), isRecurring: true },
    { id: uid(), amount: 950,  category: 'Food & Dining', description: 'Groceries', date: dateInMonth(2, 4), isRecurring: false },
    { id: uid(), amount: 599,  category: 'Entertainment', description: 'Netflix', date: dateInMonth(2, 6), isRecurring: true },
    { id: uid(), amount: 499,  category: 'Utilities', description: 'Electricity', date: dateInMonth(2, 8), isRecurring: true },
    { id: uid(), amount: 3500, category: 'EMI', description: 'Phone EMI', date: dateInMonth(2, 1), isRecurring: true },
    { id: uid(), amount: 780,  category: 'Transport', description: 'Cab rides', date: dateInMonth(2, 15), isRecurring: false },
    { id: uid(), amount: 1500, category: 'Healthcare', description: 'Annual health checkup', date: dateInMonth(2, 12), isRecurring: false },
    { id: uid(), amount: 890,  category: 'Food & Dining', description: 'Team lunch', date: dateInMonth(2, 20), isRecurring: false },
  ].map(e => ({ ...e, createdAt: new Date().toISOString() }));

  await redis.set(`user:${DEMO.id}:expenses:${monthKey(2)}`, JSON.stringify(expenses2));
  console.log(`✅ ${expenses2.length} expenses added for ${monthKey(2)}`);

  // --- EXPENSES: 3 months ago ---
  const expenses3 = [
    { id: uid(), amount: 4200, category: 'Housing', description: 'Rent', date: dateInMonth(3, 1), isRecurring: true },
    { id: uid(), amount: 3500, category: 'EMI', description: 'Phone EMI', date: dateInMonth(3, 1), isRecurring: true },
    { id: uid(), amount: 599,  category: 'Entertainment', description: 'Netflix', date: dateInMonth(3, 6), isRecurring: true },
    { id: uid(), amount: 499,  category: 'Utilities', description: 'Electricity', date: dateInMonth(3, 8), isRecurring: true },
    { id: uid(), amount: 1200, category: 'Food & Dining', description: 'Diwali sweets + groceries', date: dateInMonth(3, 10), isRecurring: false },
    { id: uid(), amount: 4500, category: 'Shopping', description: 'Diwali shopping', date: dateInMonth(3, 12), isRecurring: false },
    { id: uid(), amount: 620,  category: 'Transport', description: 'Cab rides', date: dateInMonth(3, 18), isRecurring: false },
  ].map(e => ({ ...e, createdAt: new Date().toISOString() }));

  await redis.set(`user:${DEMO.id}:expenses:${monthKey(3)}`, JSON.stringify(expenses3));
  console.log(`✅ ${expenses3.length} expenses added for ${monthKey(3)}`);

  // --- EXPENSES: 4 months ago ---
  const expenses4 = [
    { id: uid(), amount: 4200, category: 'Housing', description: 'Rent', date: dateInMonth(4, 1), isRecurring: true },
    { id: uid(), amount: 3500, category: 'EMI', description: 'Phone EMI', date: dateInMonth(4, 1), isRecurring: true },
    { id: uid(), amount: 599,  category: 'Entertainment', description: 'Netflix', date: dateInMonth(4, 6), isRecurring: true },
    { id: uid(), amount: 499,  category: 'Utilities', description: 'Electricity', date: dateInMonth(4, 8), isRecurring: true },
    { id: uid(), amount: 780,  category: 'Food & Dining', description: 'Groceries', date: dateInMonth(4, 5), isRecurring: false },
    { id: uid(), amount: 350,  category: 'Transport', description: 'Metro card', date: dateInMonth(4, 2), isRecurring: false },
    { id: uid(), amount: 2200, category: 'Education', description: 'Udemy course bundle', date: dateInMonth(4, 15), isRecurring: false },
  ].map(e => ({ ...e, createdAt: new Date().toISOString() }));

  await redis.set(`user:${DEMO.id}:expenses:${monthKey(4)}`, JSON.stringify(expenses4));
  console.log(`✅ ${expenses4.length} expenses added for ${monthKey(4)}`);

  // --- EXPENSES: 5 months ago ---
  const expenses5 = [
    { id: uid(), amount: 4200, category: 'Housing', description: 'Rent', date: dateInMonth(5, 1), isRecurring: true },
    { id: uid(), amount: 3500, category: 'EMI', description: 'Phone EMI', date: dateInMonth(5, 1), isRecurring: true },
    { id: uid(), amount: 599,  category: 'Entertainment', description: 'Netflix', date: dateInMonth(5, 6), isRecurring: true },
    { id: uid(), amount: 499,  category: 'Utilities', description: 'Electricity', date: dateInMonth(5, 8), isRecurring: true },
    { id: uid(), amount: 920,  category: 'Food & Dining', description: 'Groceries', date: dateInMonth(5, 5), isRecurring: false },
    { id: uid(), amount: 480,  category: 'Transport', description: 'Fuel + parking', date: dateInMonth(5, 14), isRecurring: false },
    { id: uid(), amount: 8500, category: 'Investment', description: 'SIP - Mutual Fund', date: dateInMonth(5, 10), isRecurring: true },
  ].map(e => ({ ...e, createdAt: new Date().toISOString() }));

  await redis.set(`user:${DEMO.id}:expenses:${monthKey(5)}`, JSON.stringify(expenses5));
  console.log(`✅ ${expenses5.length} expenses added for ${monthKey(5)}`);

  // --- PEOPLE ---
  const people = [
    { id: uid(), name: 'Ravi Kumar', phone: '+91 98765 43210', note: 'College friend', createdAt: new Date().toISOString() },
    { id: uid(), name: 'Priya Sharma', phone: '+91 91234 56789', note: 'Flatmate', createdAt: new Date().toISOString() },
    { id: uid(), name: 'Karan Singh', phone: '+91 87654 32109', note: 'Office colleague', createdAt: new Date().toISOString() },
    { id: uid(), name: 'Ananya Nair', phone: '', note: 'Cousin', createdAt: new Date().toISOString() },
    { id: uid(), name: 'Vikram Patel', phone: '+91 99887 76655', note: 'Gym buddy', createdAt: new Date().toISOString() },
  ];
  await redis.set(`user:${DEMO.id}:people`, JSON.stringify(people));
  console.log(`✅ ${people.length} people added`);

  // --- LEDGER ---
  const ledger = [
    { id: uid(), type: 'lent', personId: people[0].id, personName: 'Ravi Kumar', amount: 5000, description: 'Helped with security deposit', date: dateInMonth(1, 15), dueDate: dateInMonth(0, 15), status: 'pending', createdAt: new Date().toISOString() },
    { id: uid(), type: 'lent', personId: people[2].id, personName: 'Karan Singh', amount: 1200, description: 'Team lunch - he forgot wallet', date: dateInMonth(0, 8), dueDate: dateInMonth(0, 20), status: 'pending', createdAt: new Date().toISOString() },
    { id: uid(), type: 'borrowed', personId: people[1].id, personName: 'Priya Sharma', amount: 800, description: 'Borrowed for grocery run', date: dateInMonth(0, 5), dueDate: dateInMonth(0, 25), status: 'pending', createdAt: new Date().toISOString() },
    { id: uid(), type: 'lent', personId: people[3].id, personName: 'Ananya Nair', amount: 3000, description: 'Train ticket money', date: dateInMonth(2, 10), dueDate: dateInMonth(1, 10), status: 'settled', settledAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: uid(), type: 'borrowed', personId: people[4].id, personName: 'Vikram Patel', amount: 2500, description: 'Split on gym equipment', date: dateInMonth(3, 20), dueDate: dateInMonth(2, 20), status: 'settled', settledAt: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: uid(), type: 'lent', personId: people[0].id, personName: 'Ravi Kumar', amount: 500, description: 'Coffee + snacks', date: dateInMonth(0, 3), dueDate: '', status: 'pending', createdAt: new Date().toISOString() },
  ];
  await redis.set(`user:${DEMO.id}:ledger`, JSON.stringify(ledger));
  console.log(`✅ ${ledger.length} ledger entries added`);

  // --- SAVINGS GOALS ---
  const savings = [
    { id: uid(), name: 'Emergency Fund', targetAmount: 100000, currentAmount: 42000, targetDate: monthKey(6), icon: '🏦', createdAt: new Date().toISOString() },
    { id: uid(), name: 'Goa Trip 2025', targetAmount: 25000, currentAmount: 18500, targetDate: monthKey(3), icon: '✈️', createdAt: new Date().toISOString() },
    { id: uid(), name: 'New Laptop', targetAmount: 80000, currentAmount: 80000, targetDate: monthKey(0), icon: '💻', createdAt: new Date().toISOString() },
    { id: uid(), name: 'Wedding Fund', targetAmount: 500000, currentAmount: 75000, targetDate: monthKey(-24), icon: '💍', createdAt: new Date().toISOString() },
    { id: uid(), name: 'PS5', targetAmount: 55000, currentAmount: 12000, targetDate: monthKey(4), icon: '🎮', createdAt: new Date().toISOString() },
  ];
  await redis.set(`user:${DEMO.id}:savings`, JSON.stringify(savings));
  console.log(`✅ ${savings.length} savings goals added`);

  console.log('\n✨ Demo data seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔐 Demo Login Credentials');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email   : ${DEMO.email}`);
  console.log(`  Password: ${DEMO.password}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
