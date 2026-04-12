import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { PageHeader, Card, Badge, Button, Modal, Input, Select, EmptyState } from '../components/ui/UI';
import { Plus, Trash2, Receipt, Search, Filter } from 'lucide-react';
import './ListPage.css';

const CATEGORIES = ['Food & Dining','Transport','Housing','Utilities','Entertainment','Healthcare','Shopping','Education','Travel','Investment','EMI','Other'];
const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };

const nowMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const sym = CURRENCY_SYMBOLS[user?.currency] || '₹';

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(nowMonth());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'Food & Dining', description: '', date: new Date().toISOString().slice(0, 10), isRecurring: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.expenses.list(month);
      setExpenses(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [month]);

  const handleAdd = async () => {
    if (!form.amount || !form.date) return;
    setSaving(true);
    try {
      await api.expenses.create(form);
      setShowAdd(false);
      setForm({ amount: '', category: 'Food & Dining', description: '', date: new Date().toISOString().slice(0, 10), isRecurring: false });
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await api.expenses.delete(id, month);
    load();
  };

  const filtered = expenses.filter(e => {
    const matchSearch = !search || e.description?.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || e.category === filterCat;
    return matchSearch && matchCat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const catTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  return (
    <div className="list-page fade-in">
      <PageHeader
        title="Expenses"
        subtitle={`${month} · ${filtered.length} transactions`}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Add Expense</Button>}
      />

      {/* Summary bar */}
      <div className="summary-bar">
        <div className="summary-item">
          <span className="summary-label">Total Spent</span>
          <span className="summary-val" style={{ color: 'var(--red)' }}>{sym}{total.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Transactions</span>
          <span className="summary-val">{filtered.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Average</span>
          <span className="summary-val">{sym}{filtered.length ? Math.round(total / filtered.length).toLocaleString('en-IN') : 0}</span>
        </div>
        <div className="summary-item summary-month">
          <label className="summary-label">Month</label>
          <input type="month" className="month-picker" value={month}
            onChange={e => setMonth(e.target.value)} max={nowMonth()} />
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="field-wrap" style={{ flex: 1 }}>
          <span className="field-icon"><Search size={15} /></span>
          <input className="field-input field-input--icon" placeholder="Search expenses..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="field-wrap">
          <span className="field-icon"><Filter size={15} /></span>
          <select className="field-select" style={{ paddingLeft: 36, minWidth: 160 }} value={filterCat}
            onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="list-grid">
        {/* Transactions list */}
        <Card className="list-card">
          {loading ? (
            <div className="list-skeleton">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon="💸" title="No expenses found"
              description={search || filterCat ? "Try adjusting your filters" : "Add your first expense to get started"}
              action={<Button onClick={() => setShowAdd(true)} icon={<Plus size={15} />}>Add Expense</Button>} />
          ) : (
            <div className="item-list">
              {filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => (
                <div key={exp.id} className="item-row">
                  <div className="item-icon-wrap">
                    <span className="item-cat-icon">{getCatIcon(exp.category)}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-title">{exp.description || exp.category}</div>
                    <div className="item-meta">
                      <Badge type="default">{exp.category}</Badge>
                      <span className="item-date">{new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      {exp.isRecurring && <Badge type="blue">Recurring</Badge>}
                    </div>
                  </div>
                  <div className="item-amount item-amount--red">{sym}{exp.amount.toLocaleString('en-IN')}</div>
                  <button className="item-del" onClick={() => handleDelete(exp.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Category breakdown sidebar */}
        <div className="sidebar-stats">
          <Card>
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>By Category</h3>
            <div className="cat-list">
              {CATEGORIES.filter(c => catTotals[c] > 0).sort((a, b) => catTotals[b] - catTotals[a]).map(cat => {
                const pct = total > 0 ? (catTotals[cat] / total) * 100 : 0;
                return (
                  <div key={cat} className="cat-item">
                    <div className="cat-row">
                      <span className="cat-name">{getCatIcon(cat)} {cat}</span>
                      <span className="cat-val">{sym}{catTotals[cat].toLocaleString('en-IN')}</span>
                    </div>
                    <div className="cat-bar-bg">
                      <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.values(catTotals).every(v => v === 0) && (
                <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No data for this month</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Expense">
        <Input label="Amount" type="number" placeholder="0.00" value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <Select label="Category" value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </Select>
        <Input label="Description (optional)" placeholder="What was this for?" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <Input label="Date" type="date" value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <label className="recurring-toggle">
          <input type="checkbox" checked={form.isRecurring}
            onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))} />
          <span>Mark as recurring monthly expense</span>
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleAdd} loading={saving} style={{ flex: 1 }}>Save Expense</Button>
        </div>
      </Modal>
    </div>
  );
}

function getCatIcon(cat) {
  const icons = { 'Food & Dining':'🍽️','Transport':'🚗','Housing':'🏠','Utilities':'⚡','Entertainment':'🎬','Healthcare':'🏥','Shopping':'🛍️','Education':'📚','Travel':'✈️','Investment':'📈','EMI':'🏦','Other':'📌' };
  return icons[cat] || '📌';
}
