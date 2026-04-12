import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { PageHeader, Card, Badge, Button, Modal, Input, Select, EmptyState } from '../components/ui/UI';
import { Plus, Trash2, Check, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './ListPage.css';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };

export default function LedgerPage() {
  const { user } = useAuth();
  const sym = CURRENCY_SYMBOLS[user?.currency] || '₹';
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState({ type: 'lent', personName: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10), dueDate: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [ledger, ppl] = await Promise.all([api.ledger.list(), api.people.list()]);
      setEntries(ledger);
      setPeople(ppl);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.personName || !form.amount || !form.date) return;
    setSaving(true);
    try {
      await api.ledger.create(form);
      setShowAdd(false);
      setForm({ type: 'lent', personName: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10), dueDate: '' });
      load();
    } finally { setSaving(false); }
  };

  const handleSettle = async (id) => {
    await api.ledger.settle({ id, status: 'settled' });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await api.ledger.delete(id);
    load();
  };

  const filtered = entries.filter(e => {
    if (tab === 'lent') return e.type === 'lent';
    if (tab === 'borrowed') return e.type === 'borrowed';
    if (tab === 'pending') return e.status === 'pending';
    if (tab === 'settled') return e.status === 'settled';
    return true;
  });

  const pending = entries.filter(e => e.status === 'pending');
  const totalLent = pending.filter(e => e.type === 'lent').reduce((s, e) => s + e.amount, 0);
  const totalBorrowed = pending.filter(e => e.type === 'borrowed').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="list-page fade-in">
      <PageHeader
        title="Ledger"
        subtitle="Track money you lend and borrow"
        action={<Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Record Entry</Button>}
      />

      <div className="summary-bar">
        <div className="summary-item">
          <span className="summary-label">You'll Receive</span>
          <span className="summary-val" style={{ color: 'var(--green)' }}>{sym}{totalLent.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">You Owe</span>
          <span className="summary-val" style={{ color: 'var(--red)' }}>{sym}{totalBorrowed.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Net Balance</span>
          <span className="summary-val" style={{ color: (totalLent - totalBorrowed) >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {(totalLent - totalBorrowed) >= 0 ? '+' : ''}{sym}{Math.abs(totalLent - totalBorrowed).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Active Entries</span>
          <span className="summary-val">{pending.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="ledger-tabs">
        {['all','lent','borrowed','pending','settled'].map(t => (
          <button key={t} className={`ledger-tab ${tab === t ? 'ledger-tab--active' : ''}`}
            onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📒" title="No entries found"
            description="Record your lends and borrows to keep track of money with people"
            action={<Button onClick={() => setShowAdd(true)} icon={<Plus size={15} />}>Add Entry</Button>} />
        ) : (
          <div className="item-list">
            {filtered.map(entry => {
              const isLent = entry.type === 'lent';
              const isOverdue = entry.dueDate && new Date(entry.dueDate) < new Date() && entry.status === 'pending';
              return (
                <div key={entry.id} className="item-row">
                  <div className="item-icon-wrap" style={{ background: isLent ? 'var(--green-bg)' : 'var(--red-bg)' }}>
                    {isLent ? <ArrowUpRight size={18} color="var(--green)" /> : <ArrowDownRight size={18} color="var(--red)" />}
                  </div>
                  <div className="item-details">
                    <div className="item-title">{entry.personName} {entry.description ? `· ${entry.description}` : ''}</div>
                    <div className="item-meta">
                      <Badge type={isLent ? 'green' : 'red'}>{isLent ? 'Lent' : 'Borrowed'}</Badge>
                      <Badge type={entry.status === 'settled' ? 'default' : isOverdue ? 'red' : 'yellow'}>
                        {entry.status === 'settled' ? 'Settled' : isOverdue ? 'Overdue' : 'Pending'}
                      </Badge>
                      <span className="item-date">{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {entry.dueDate && entry.status === 'pending' && (
                        <span className="item-date" style={{ color: isOverdue ? 'var(--red)' : 'var(--text-3)' }}>
                          Due: {new Date(entry.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`item-amount ${isLent ? 'item-amount--green' : 'item-amount--red'}`}>
                    {isLent ? '+' : '-'}{sym}{entry.amount.toLocaleString('en-IN')}
                  </div>
                  {entry.status === 'pending' && (
                    <button className="settle-btn" onClick={() => handleSettle(entry.id)}>
                      <Check size={12} style={{ marginRight: 4, display: 'inline' }} />Settle
                    </button>
                  )}
                  <button className="item-del" onClick={() => handleDelete(entry.id)}><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Record Lend / Borrow">
        <div style={{ display: 'flex', gap: 8 }}>
          {['lent', 'borrowed'].map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: 14,
                border: `2px solid ${form.type === t ? (t === 'lent' ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
                background: form.type === t ? (t === 'lent' ? 'var(--green-bg)' : 'var(--red-bg)') : 'var(--bg-3)',
                color: form.type === t ? (t === 'lent' ? 'var(--green)' : 'var(--red)') : 'var(--text-2)',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
              {t === 'lent' ? '↑ I Lent' : '↓ I Borrowed'}
            </button>
          ))}
        </div>

        <div className="field">
          <label className="field-label">Person Name</label>
          {people.length > 0 ? (
            <select className="field-select" value={form.personName}
              onChange={e => setForm(f => ({ ...f, personName: e.target.value }))}>
              <option value="">Type or select...</option>
              {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          ) : null}
          {(people.length === 0 || !form.personName) && (
            <input className="field-input" style={{ marginTop: people.length > 0 ? 6 : 0 }}
              placeholder="Enter person's name" value={form.personName}
              onChange={e => setForm(f => ({ ...f, personName: e.target.value }))} />
          )}
        </div>

        <Input label="Amount" type="number" placeholder="0.00" value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
        <Input label="Description (optional)" placeholder="Reason for transaction" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <Input label="Date" type="date" value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        <Input label="Due Date (optional)" type="date" value={form.dueDate}
          onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleAdd} loading={saving} style={{ flex: 1 }}>Save Entry</Button>
        </div>
      </Modal>
    </div>
  );
}
