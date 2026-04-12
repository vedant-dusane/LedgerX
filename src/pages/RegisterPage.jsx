import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, User, ArrowRight, DollarSign } from 'lucide-react';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'INR' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.currency);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-card fade-in">
        <div className="auth-logo">
          <Wallet size={24} />
          <span>LedgerX</span>
        </div>

        <div className="auth-head">
          <h1>Create account</h1>
          <p>Start tracking your finances today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Full Name</label>
            <div className="field-wrap">
              <span className="field-icon"><User size={15} /></span>
              <input className="field-input field-input--icon" placeholder="Rohan Sharma" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Email</label>
            <div className="field-wrap">
              <span className="field-icon"><Mail size={15} /></span>
              <input className="field-input field-input--icon" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <span className="field-icon"><Lock size={15} /></span>
              <input className="field-input field-input--icon" type="password" placeholder="Min 8 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} required />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Currency</label>
            <div className="field-wrap">
              <span className="field-icon"><DollarSign size={15} /></span>
              <select className="field-select" style={{paddingLeft:38}} value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
                <option value="AED">د.إ UAE Dirham (AED)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--lg auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <ArrowRight size={18} />}
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
