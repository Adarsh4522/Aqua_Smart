/* =============================================
   Smart Water Platform — API Wrapper (api.js)
   All fetch() calls to the backend go here.
   ============================================= */

const API_BASE = 'http://backend:4000/api';

function getToken() {
  return localStorage.getItem('swp_token');
}

async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ---- Auth ----
const Auth = {
  register: (payload) => apiRequest('/auth/register', 'POST', payload),
  login: (payload) => apiRequest('/auth/login', 'POST', payload),
  me: () => apiRequest('/auth/me'),
  update: (payload) => apiRequest('/auth/me', 'PUT', payload),
};

// ---- Devices ----
const Devices = {
  list: () => apiRequest('/devices'),
  add: (data) => apiRequest('/devices', 'POST', data),
  update: (id, data) => apiRequest(`/devices/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/devices/${id}`, 'DELETE'),
};

// ---- Usage ----
const Usage = {
  log: (data) => apiRequest('/usage', 'POST', data),
  history: (limit = 50) => apiRequest(`/usage?limit=${limit}`),
  summary: () => apiRequest('/usage/summary'),
  update: (id, data) => apiRequest(`/usage/${id}`, 'PUT', data),
  delete: (id) => apiRequest(`/usage/${id}`, 'DELETE'),
};

// ---- Goals ----
const Goals = {
  get: () => apiRequest('/goals'),
  set: (data) => apiRequest('/goals', 'POST', data),
};

// ---- Tips ----
const Tips = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/tips${q ? '?' + q : ''}`);
  },
  get: (id) => apiRequest(`/tips/${id}`),
  create: (data) => apiRequest('/tips', 'POST', data),
  myTips: () => apiRequest('/tips/my/tips'),
};

// ---- Admin ----
const Admin = {
  users: () => apiRequest('/admin/users'),
  approveUser: (id, approved) => apiRequest(`/admin/users/${id}/approve`, 'PUT', { approved }),
  changeRole: (id, role) => apiRequest(`/admin/users/${id}/role`, 'PUT', { role }),
  pendingTips: () => apiRequest('/admin/tips/pending'),
  approveTip: (id) => apiRequest(`/admin/tips/${id}/approve`, 'PUT'),
  deleteTip: (id) => apiRequest(`/admin/tips/${id}`, 'DELETE'),
  stats: () => apiRequest('/admin/stats'),
  devices: () => apiRequest('/admin/devices'),
};
