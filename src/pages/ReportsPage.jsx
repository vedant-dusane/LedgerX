import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { PageHeader, Card, Badge } from '../components/ui/UI';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid
} from 'recharts';
import './Reports.css';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
const COLORS = ['#6c63ff', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

function fmt(val, sym) {
  if (val >= 1_00_000) return `${sym}${(val / 1_00_000).toFixed(1)}L`;
  if (val >= 1000) return `${sym}${(val / 1000).toFixed(1)}K`;
  return `${sym}${(val || 0).toFixed(0)}`;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const sym = CURRENCY_SYMBOLS[user?.currency] || '₹';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports.summary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="skeleton" style={{ height: 40, width: 200, borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
      </div>
    </div>
  );

  const hasData = data?.monthlyTrend?.some(m => m.total > 0);
  const hasCats = data?.categoryBreakdown?.length > 0;

  return (
    <div className="reports-page fade-in">
      <PageHeader title="Reports" subtitle="Financial overview and analytics" />

      {/* KPI Row */}
      <div className="kpi-grid">
        {[
          { label: 'This Month Spent', value: fmt(data?.totalExpensesThisMonth, sym), color: '#ef4444', icon: '💸' },
          { label: 'Last Month Spent', value: fmt(data?.totalExpensesPrevMonth, sym), color: '#f59e0b', icon: '📅' },
          { label: 'Total Saved', value: fmt(data?.totalSaved, sym), color: '#22c55e', icon: '🏦' },
          { label: 'Net Ledger Position', value: `${(data?.netLedger || 0) >= 0 ? '+' : ''}${fmt(Math.abs(data?.netLedger || 0), sym)}`, color: (data?.netLedger || 0) >= 0 ? '#22c55e' : '#ef4444', icon: '⚖️' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="kpi-card">
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="reports-grid">
        {/* Monthly Trend */}
        <Card>
          <div className="report-header">
            <h3>Monthly Spending Trend</h3>
            <Badge type="accent">6 months</Badge>
          </div>
          {hasData ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.monthlyTrend} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#5a5a70', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5a5a70', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, sym)} />
                <Tooltip
                  contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 10, fontSize: 13 }}
                  formatter={v => [fmt(v, sym), 'Expenses']}
                  labelStyle={{ color: '#9090a8' }}
                />
                <Bar dataKey="total" fill="#6c63ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="no-data">📊 No expense data yet. Add expenses to see trends.</div>}
        </Card>

        {/* Category Pie */}
        <Card>
          <div className="report-header">
            <h3>Spending by Category</h3>
            <Badge type="accent">This month</Badge>
          </div>
          {hasCats ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={data.categoryBreakdown} dataKey="amount" nameKey="category"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {data.categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 10, fontSize: 13 }}
                  formatter={v => [fmt(v, sym)]}
                />
                <Legend formatter={(v) => <span style={{ color: '#9090a8', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="no-data">🥧 No expenses this month.</div>}
        </Card>

        {/* Area trend */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <div className="report-header">
            <h3>Cumulative Spend Over Time</h3>
            <Badge type="accent">Last 6 months</Badge>
          </div>
          {hasData ? (() => {
            let cum = 0;
            const cumData = data.monthlyTrend.map(m => ({ ...m, cumulative: (cum += m.total) }));
            return (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={cumData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#5a5a70', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#5a5a70', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v, sym)} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 10, fontSize: 13 }}
                    formatter={v => [fmt(v, sym), 'Cumulative']}
                    labelStyle={{ color: '#9090a8' }}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#22c55e" strokeWidth={2}
                    fill="url(#cumGrad)" dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            );
          })() : <div className="no-data">📈 No data to display.</div>}
        </Card>

        {/* Category table */}
        {hasCats && (
          <Card style={{ gridColumn: '1 / -1' }}>
            <div className="report-header">
              <h3>Category Breakdown</h3>
              <Badge type="accent">This month</Badge>
            </div>
            <div className="cat-table">
              <div className="cat-table-header">
                <span>Category</span>
                <span>Amount</span>
                <span>Share</span>
              </div>
              {[...data.categoryBreakdown].sort((a, b) => b.amount - a.amount).map((item, i) => {
                const total = data.totalExpensesThisMonth;
                const pct = total > 0 ? (item.amount / total) * 100 : 0;
                return (
                  <div key={i} className="cat-table-row">
                    <div className="cat-table-name">
                      <span className="cat-dot" style={{ background: COLORS[i % COLORS.length] }} />
                      {item.category}
                    </div>
                    <span className="cat-table-amt">{fmt(item.amount, sym)}</span>
                    <div className="cat-table-bar-wrap">
                      <div className="cat-table-bar" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                      <span className="cat-table-pct">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
