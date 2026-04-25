/* =============================================
   auth.js — Token & Session Management
   ============================================= */

const AUTH_KEY = 'swp_token';
const USER_KEY = 'swp_user';

function saveSession(token, user) {
  localStorage.setItem(AUTH_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
}

function getCurrentUser() {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
  return !!localStorage.getItem(AUTH_KEY);
}

function logout() {
  clearSession();
  window.location.href = 'index.html';
}

// Redirect if not logged in
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Redirect if not specific role
function requireRole(...roles) {
  const user = getCurrentUser();
  if (!user || !roles.includes(user.role)) {
    if (user?.role === 'admin') window.location.href = 'admin.html';
    else if (user?.role === 'provider') window.location.href = 'provider.html';
    else if (user?.role === 'user') window.location.href = 'dashboard.html';
    else window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Redirect logged-in users away from auth pages
function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    const user = getCurrentUser();
    if (user?.role === 'admin') window.location.href = 'admin.html';
    else if (user?.role === 'provider') window.location.href = 'provider.html';
    else window.location.href = 'dashboard.html';
  }
}

// Populate sidebar user info
function populateSidebarUser() {
  const user = getCurrentUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebar-username');
  const roleEl = document.getElementById('sidebar-role');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}

// Show/hide elements based on role
function applyRoleVisibility() {
  const user = getCurrentUser();
  if (!user) return;
  document.querySelectorAll('[data-role]').forEach(el => {
    const roles = el.dataset.role.split(',').map(r => r.trim());
    el.style.display = roles.includes(user.role) ? '' : 'none';
  });
}

// Show alert helper
function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 5000);
}

// Mark active nav link
function setActiveNav() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href')?.split('/').pop();
    if (href) {
      link.classList.toggle('active', href === path);
    }
  });
}
