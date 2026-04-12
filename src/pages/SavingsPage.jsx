import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { PageHeader, Card, Badge, Button, Modal, Input, EmptyState } from '../components/ui/UI';
import { Plus, Trash2, PiggyBank, Target } from 'lucide-react';
import './ListPage.css';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
const GOAL_ICONS = ['🎯','🏠','🚗','✈️','💍','📱','🎓','🏖️','💰','🏋️','🎮','📷'];

export default function SavingsPage() {
  const { user } = useAuth();
  const sym = CURRENCY_SYMBOLS[user?.currency] || '₹';
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '', icon: '🎯' });
  const [updateAmt, setUpdateAmt] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setGoals(await api.savings.list()); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.targetAmount) return;
    setSaving(true);
    try {
      await api.savings.create(form);
      setShowAdd(false);
      setForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '', icon: '🎯' });
      load();
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!showUpdate || !updateAmt) return;
    setSaving(true);
    try {
      await api.savings.update({ id: showUpdate.id, currentAmount: updateAmt });
      setShowUpdate(null);
      setUpdateAmt('');
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await api.savings.delete(id);
    load();
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="list-page fade-in">
      <PageHeader
        title="Savings Goals"
        subtitle={`${goals.length} goals · ${completedGoals} completed`}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>New Goal</Button>}
      />

      <div className="summary-bar">
        <div className="summary-item">
          <span className="summary-label">Total Target</span>
          <span className="summary-val">{sym}{totalTarget.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Saved</span>
          <span className="summary-val" style={{ color: 'var(--green)' }}>{sym}{totalSaved.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Overall Progress</span>
          <span className="summary-val">{totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Completed</span>
          <span className="summary-val">{completedGoals} / {goals.length}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />)}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState icon="🐷" title="No savings goals yet"
            description="Create a savings goal to start tracking your progress towards financial targets"
            action={<Button icon={<Plus size={15} />} onClick={() => setShowAdd(true)}>Create First Goal</Button>} />
        </Card>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => {
            const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const done = goal.currentAmount >= goal.targetAmount;
            const remaining = goal.targetAmount - goal.currentAmount;
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-head">
                  <span className="goal-icon">{goal.icon}</span>
                  <div>
                    <div className="goal-name">{goal.name}</div>
                    <div className="goal-target">Target: {sym}{goal.targetAmount.toLocaleString('en-IN')}</div>
                    {goal.targetDate && <div className="goal-target">By: {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>}
                  </div>
                  {done && <Badge type="green" style={{ marginLeft: 'auto' }}>Done!</Badge>}
                </div>

                <div className="goal-progress">
                  <div className="goal-bar-bg">
                    <div className={`goal-bar-fill ${done ? 'goal-bar-fill--done' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="goal-amounts">
                    <span className="goal-saved">{sym}{goal.currentAmount.toLocaleString('en-IN')} saved</span>
                    <span className="goal-remaining">{done ? '🎉 Goal reached!' : `${sym}${remaining.toLocaleString('en-IN')} to go`}</span>
                  </div>
                </div>

                <div className="goal-pct">{Math.round(pct)}%</div>

                <div className="goal-actions">
                  <Button variant="outline" size="sm" icon={<Target size={14} />}
                    onClick={() => { setShowUpdate(goal); setUpdateAmt(String(goal.currentAmount)); }}>
                    Update
                  </Button>
                  <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => handleDelete(goal.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Savings Goal">
        <div>
          <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>Choose Icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GOAL_ICONS.map(ic => (
              <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${form.icon === ic ? 'var(--accent)' : 'var(--border)'}`, background: form.icon === ic ? 'var(--accent-glow)' : 'var(--bg-3)', fontSize: 18, cursor: 'pointer', transition: 'all 0.2s' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <Input label="Goal Name" placeholder="e.g. Emergency Fund" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="Target Amount" type="number" placeholder="100000" value={form.targetAmount}
          onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} />
        <Input label="Current Amount (optional)" type="number" placeholder="0" value={form.currentAmount}
          onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} />
        <Input label="Target Date (optional)" type="month" value={form.targetDate}
          onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleAdd} loading={saving} style={{ flex: 1 }}>Create Goal</Button>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal open={!!showUpdate} onClose={() => setShowUpdate(null)} title={`Update: ${showUpdate?.name}`}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48 }}>{showUpdate?.icon}</div>
          <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>
            Target: {sym}{showUpdate?.targetAmount?.toLocaleString('en-IN')}
          </div>
        </div>
        <Input label="Current Saved Amount" type="number" value={updateAmt}
          onChange={e => setUpdateAmt(e.target.value)} />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={() => setShowUpdate(null)} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleUpdate} loading={saving} style={{ flex: 1 }}>Update</Button>
        </div>
      </Modal>
    </div>
  );
}
