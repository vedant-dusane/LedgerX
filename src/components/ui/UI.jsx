import './UI.css';

export function Card({ children, className = '', style }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}

export function Badge({ children, type = 'default' }) {
  return <span className={`badge badge--${type}`}>{children}</span>;
}

export function Button({ children, variant = 'primary', size = 'md', loading, icon, onClick, type = 'button', disabled, className = '' }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <span className="btn-spinner" /> : icon}
      {children}
    </button>
  );
}

export function Input({ label, error, icon, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <div className="field-wrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input className={`field-input ${icon ? 'field-input--icon' : ''} ${error ? 'field-input--error' : ''}`} {...props} />
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <select className={`field-select ${error ? 'field-input--error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, icon, color = 'accent', trend }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`stat-trend ${trend >= 0 ? 'stat-trend--up' : 'stat-trend--down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}

export function Spinner() {
  return <div className="spinner" />;
}
