const BASE = '/api';

function getToken() {
  return localStorage.getItem('lx_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    localStorage.removeItem('lx_token');
    window.location.href = '/login';
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body }),
    login: (body) => request('/auth/login', { method: 'POST', body }),
    me: () => request('/auth/me'),
  },
  expenses: {
    list: (month) => request(`/expenses${month ? `?month=${month}` : ''}`),
    create: (body) => request('/expenses', { method: 'POST', body }),
    delete: (id, month) => request(`/expenses?id=${id}&month=${month}`, { method: 'DELETE' }),
  },
  savings: {
    list: () => request('/savings'),
    create: (body) => request('/savings', { method: 'POST', body }),
    update: (body) => request('/savings', { method: 'PUT', body }),
    delete: (id) => request(`/savings?id=${id}`, { method: 'DELETE' }),
  },
  ledger: {
    list: () => request('/ledger'),
    create: (body) => request('/ledger', { method: 'POST', body }),
    settle: (body) => request('/ledger', { method: 'PUT', body }),
    delete: (id) => request(`/ledger?id=${id}`, { method: 'DELETE' }),
  },
  people: {
    list: () => request('/people'),
    create: (body) => request('/people', { method: 'POST', body }),
    delete: (id) => request(`/people?id=${id}`, { method: 'DELETE' }),
  },
  reports: {
    summary: () => request('/reports/summary'),
  },
};
