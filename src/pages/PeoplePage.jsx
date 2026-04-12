import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { PageHeader, Card, Button, Modal, Input, EmptyState } from '../components/ui/UI';
import { Plus, Trash2, Phone, MessageCircle } from 'lucide-react';
import './ListPage.css';

export default function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', note: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [ppl, l] = await Promise.all([api.people.list(), api.ledger.list()]);
      setPeople(ppl);
      setLedger(l);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await api.people.create(form);
      setShowAdd(false);
      setForm({ name: '', phone: '', note: '' });
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this person?')) return;
    await api.people.delete(id);
    load();
  };

  const getBalance = (name) => {
    const entries = ledger.filter(e => e.personName?.toLowerCase() === name?.toLowerCase() && e.status === 'pending');
    const lent = entries.filter(e => e.type === 'lent').reduce((s, e) => s + e.amount, 0);
    const borrowed = entries.filter(e => e.type === 'borrowed').reduce((s, e) => s + e.amount, 0);
    return { lent, borrowed, net: lent - borrowed };
  };

  return (
    <div className="list-page fade-in">
      <PageHeader
        title="People"
        subtitle={`${people.length} contacts`}
        action={<Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>Add Person</Button>}
      />

      {loading ? (
        <div className="people-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      ) : people.length === 0 ? (
        <Card>
          <EmptyState icon="👥" title="No contacts yet"
            description="Add people you frequently lend or borrow money from to track balances easily"
            action={<Button icon={<Plus size={15} />} onClick={() => setShowAdd(true)}>Add First Contact</Button>} />
        </Card>
      ) : (
        <div className="people-grid">
          {people.map(p => {
            const bal = getBalance(p.name);
            const initials = p.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={p.id} className="person-card">
                <div className="person-head">
                  <div className="person-avatar">{initials}</div>
                  <div>
                    <div className="person-name">{p.name}</div>
                    {p.phone && <div className="person-phone">📞 {p.phone}</div>}
                  </div>
                </div>

                {p.note && <div className="person-note">"{p.note}"</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bal.lent > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-3)' }}>Owes you</span>
                      <span style={{ color: 'var(--green)', fontWeight: 600 }}>+₹{bal.lent.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {bal.borrowed > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: 'var(--text-3)' }}>You owe</span>
                      <span style={{ color: 'var(--red)', fontWeight: 600 }}>-₹{bal.borrowed.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {bal.lent === 0 && bal.borrowed === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>All settled ✓</div>
                  )}
                </div>

                <div className="person-actions">
                  {p.phone && (
                    <Button variant="ghost" size="sm" icon={<Phone size={13} />}
                      onClick={() => window.open(`tel:${p.phone}`)}>Call</Button>
                  )}
                  <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDelete(p.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Person">
        <Input label="Full Name" placeholder="Ravi Kumar" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="Phone (optional)" placeholder="+91 98765 43210" value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        <Input label="Note (optional)" placeholder="Office colleague" value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <Button variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleAdd} loading={saving} style={{ flex: 1 }}>Add Person</Button>
        </div>
      </Modal>
    </div>
  );
}
