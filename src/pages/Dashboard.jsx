import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { StatCard, Card, Badge, PageHeader, EmptyState } from '../components/ui/UI';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingDown, PiggyBank, HandCoins, Users, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './Dashboard.css';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
const COLORS = ['#6c63ff', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

function fmt(val, currency) {
  const sym = CURRENCY_SYMBOLS[currency] || '₹';
  if (val >= 1_00_000) return `${sym}${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1000) return `${sym}${(val / 1000).toFixed(1)}K`;
  return `${sym}${val?.toFixed(0) || 0}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports.summary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currency = user?.currency || 'INR';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="dash-loading">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
    </div>
  );

  const trend = data?.totalExpensesPrevMonth > 0
    ? Math.round(((data.totalExpensesThisMonth - data.totalExpensesPrevMonth) / data.totalExpensesPrevMonth) * 100)
    : 0;

  return (
    <div className="dash fade-in">
      <div className="dash-greeting">
        <div>
          <p className="greeting-sub">{greeting},</p>
          <h1 className="greeting-name">{user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <div className="greeting-date">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Net Position Banner */}
      <div className={`net-banner ${(data?.netPosition || 0) >= 0 ? 'net-banner--pos' : 'net-banner--neg'}`}>
        <div className="net-banner-inner">
          <div className="net-banner-label">Net Position This Month</div>
          <div className="net-banner-value">
            {(data?.netPosition || 0) >= 0 ? <ArrowUpRight size={28} /> : <ArrowDownRight size={28} />}
            {fmt(Math.abs(data?.netPosition || 0), currency)}
          </div>
          <div className="net-banner-sub">Savings − Expenses + (Lent − Borrowed)</div>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard label="Expenses This Month" icon={<TrendingDown size={20} />}
          value={fmt(data?.totalExpensesThisMonth || 0, currency)}
          sub={`${trend >= 0 ? '+' : ''}${trend}% vs last month`}
          color={trend > 0 ? 'red' : 'green'} />

        <StatCard label="Total Saved" icon={<PiggyBank size={20} />}
          value={fmt(data?.totalSaved || 0, currency)}
          sub={`${data?.savingsGoals || 0} active goals`}
          color="blue" />

        <StatCard label="You'll Receive" icon={<ArrowUpRight size={20} />}
          value={fmt(data?.pendingLent || 0, currency)}
          sub="Pending collections"
          color="green" />

        <StatCard label="You Owe" icon={<ArrowDownRight size={20} />}
          value={fmt(data?.pendingBorrowed || 0, currency)}
          sub="Pending payments"
          color="red" />
      </div>

      <div className="dash-grid">
        {/* Monthly Trend Chart */}
        <Card className="chart-card">
          <div className="chart-header">
            <h3>Monthly Expenses</h3>
            <Badge type="accent">Last 6 months</Badge>
          </div>
          {data?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: '#5a5a70', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a5a70', fontSize: 12 }} axisLine={false} tickLine={false}
                  tickFormatter={v => fmt(v, currency)} />
                <Tooltip
                  contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 10, fontSize: 13 }}
                  formatter={v => [fmt(v, currency), 'Expenses']}
                  labelStyle={{ color: '#9090a8' }}
                />
                <Area type="monotone" dataKey="total" stroke="#6c63ff" strokeWidth={2}
                  fill="url(#expGrad)" dot={{ fill: '#6c63ff', strokeWidth: 0, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="📊" title="No data yet" description="Add expenses to see trends" />}
        </Card>

        {/* Category Pie */}
        <Card className="pie-card">
          <div className="chart-header">
            <h3>Spending by Category</h3>
            <Badge type="accent">This month</Badge>
          </div>
          {data?.categoryBreakdown?.length > 0 ? (
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.categoryBreakdown} dataKey="amount" nameKey="category"
                    cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
                    {data.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 10, fontSize: 13 }}
                    formatter={v => [fmt(v, currency)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {data.categoryBreakdown.slice(0, 5).map((item, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="legend-label">{item.category}</span>
                    <span className="legend-val">{fmt(item.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState icon="🥧" title="No expenses" description="Categorize your spending" />}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-grid">
          {[
            { icon: '💸', label: 'Add Expense', sub: 'Log a transaction', path: '/expenses', color: 'red' },
            { icon: '🏦', label: 'Add to Savings', sub: 'Update a goal', path: '/savings', color: 'blue' },
            { icon: '🤝', label: 'Record Lend/Borrow', sub: 'Track money with people', path: '/ledger', color: 'green' },
            { icon: '📊', label: 'View Reports', sub: 'Full financial overview', path: '/reports', color: 'yellow' },
          ].map(({ icon, label, sub, path, color }) => (
            <button key={path} className={`action-card action-card--${color}`} onClick={() => navigate(path)}>
              <span className="action-icon">{icon}</span>
              <div>
                <div className="action-label">{label}</div>
                <div className="action-sub">{sub}</div>
              </div>
              <Plus size={16} className="action-plus" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
