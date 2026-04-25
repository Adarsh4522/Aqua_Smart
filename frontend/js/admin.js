/* =============================================
   admin.js — Admin Dashboard Page Logic
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  if (!requireRole('admin')) return;
  populateSidebarUser();
  setActiveNav();
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  await Promise.all([loadStats(), loadUsers(), loadPendingTips(), loadAllTips(), loadAllDevices()]);

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.dataset.tab);
      if (targetPanel) targetPanel.style.display = 'block';
    });
  });
});

async function loadStats() {
  try {
    const data = await Admin.stats();
    const s = data.stats;
    if (document.getElementById('stat-users')) document.getElementById('stat-users').textContent = s.totalUsers;
    if (document.getElementById('stat-devices')) document.getElementById('stat-devices').textContent = s.totalDevices;
    if (document.getElementById('stat-water')) document.getElementById('stat-water').textContent = `${s.totalWaterLogged.toFixed(0)} L`;
    if (document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = s.pendingProviders;
    if (document.getElementById('stat-tips')) document.getElementById('stat-tips').textContent = s.totalTips;
  } catch (err) {
    console.error(err);
  }
}

async function loadUsers() {
  try {
    const data = await Admin.users();
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>
          <div style="font-weight:600">${u.name}</div>
          <div style="font-size:0.8rem;color:#64748b">${u.email}</div>
        </td>
        <td><span class="badge ${roleBadge(u.role)}">${u.role}</span></td>
        <td><span class="badge ${u.isApproved ? 'badge-green' : 'badge-amber'}">${u.isApproved ? 'Approved' : 'Pending'}</span></td>
        <td>${new Date(u.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</td>
        <td>
          ${u.role === 'provider' && !u.isApproved
            ? `<button class="btn btn-success btn-sm" onclick="approveUser('${u._id}', true)">Approve</button>`
            : ''}
          ${u.role === 'provider' && u.isApproved
            ? `<button class="btn btn-danger btn-sm" onclick="approveUser('${u._id}', false)">Revoke</button>`
            : ''}
          ${u.role !== 'admin'
            ? `<button class="btn btn-outline btn-sm" onclick="promoteAdmin('${u._id}')">Make Admin</button>`
            : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showAlert('admin-alert', err.message);
  }
}

async function loadPendingTips() {
  try {
    const data = await Admin.pendingTips();
    const container = document.getElementById('pending-tips');
    if (!container) return;

    if (data.tips.length === 0) {
      container.innerHTML = '<p style="color:#64748b;padding:1rem">No pending tips. All caught up! ✅</p>';
      return;
    }

    container.innerHTML = data.tips.map(tip => `
      <div class="card" style="display:flex;flex-direction:column;gap:0.75rem">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
          <div>
            <h4>${tip.title}</h4>
            <p style="font-size:0.85rem;margin-top:0.25rem">By <strong>${tip.authorId?.name}</strong> (${tip.authorId?.role})</p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-shrink:0">
            <button class="btn btn-success btn-sm" onclick="approveTip('${tip._id}')">✅ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectTip('${tip._id}')">🗑 Delete</button>
          </div>
        </div>
        <p style="font-size:0.875rem;color:#94a3b8">${tip.body.substring(0, 200)}${tip.body.length > 200 ? '...' : ''}</p>
        <div style="display:flex;gap:0.5rem">
          <span class="badge badge-blue">${tip.category}</span>
          <span class="badge badge-amber">${tip.season}</span>
          ${tip.location ? `<span class="badge badge-purple">📍 ${tip.location}</span>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// MISSING LOGIC IMPLEMENTED: Loading all published tips for admins to manage
async function loadAllTips() {
  try {
    const data = await Tips.list(); // Returns all approved tips
    const container = document.getElementById('all-tips');
    if (!container) return;

    if (data.tips.length === 0) {
      container.innerHTML = '<p style="color:#64748b;padding:1rem">No published tips found.</p>';
      return;
    }

    container.innerHTML = data.tips.map(tip => `
      <div class="card" style="display:flex;flex-direction:column;gap:0.75rem">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
          <div>
            <h4 style="color:var(--text-primary)">${tip.title}</h4>
            <p style="font-size:0.85rem;margin-top:0.25rem">By <strong>${tip.authorId?.name || 'Unknown'}</strong></p>
          </div>
          <div style="display:flex;gap:0.5rem;flex-shrink:0">
            <button class="btn btn-danger btn-sm" onclick="rejectTip('${tip._id}')">🗑 Delete</button>
          </div>
        </div>
        <p style="font-size:0.875rem;color:#94a3b8">${tip.body.substring(0, 150)}${tip.body.length > 150 ? '...' : ''}</p>
        <div style="display:flex;gap:0.5rem">
          <span class="badge badge-blue">${tip.category}</span>
          <span class="badge badge-green">✅ Published</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

async function loadAllDevices() {
  try {
    const data = await Admin.devices();
    const tbody = document.getElementById('devices-tbody');
    if (!tbody) return;

    if (data.devices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-muted)">No devices registered yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.devices.map(d => `
      <tr>
        <td>
          <div style="font-weight:600;color:var(--text-primary)">${d.name}</div>
          <div style="font-size:0.8rem;color:#64748b;margin-top:0.25rem"><span class="badge badge-blue">${d.type.replace('_', ' ')}</span> &bull; ${d.brand || 'Unknown brand'}</div>
        </td>
        <td>
          <div style="font-weight:500;color:var(--text-primary)">${d.userId?.name || 'Unknown User'}</div>
          <div style="font-size:0.8rem;color:#64748b">${d.userId?.email || 'N/A'}</div>
        </td>
        <td>
          <div style="font-size:0.9rem;font-weight:500">~${d.avgUsagePerDay} L/day</div>
          <div style="font-size:0.8rem;color:#64748b">📍 ${d.location || 'Not specified'}</div>
        </td>
        <td>
          <span class="badge ${d.isActive ? 'badge-green' : 'badge-amber'}">${d.isActive ? 'Active' : 'Inactive'}</span>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showAlert('admin-alert', err.message);
  }
}

function roleBadge(role) {
  if (role === 'admin') return 'badge-red';
  if (role === 'provider') return 'badge-purple';
  return 'badge-blue';
}

async function approveUser(id, approved) {
  try {
    await Admin.approveUser(id, approved);
    showAlert('admin-alert', `User ${approved ? 'approved' : 'revoked'} successfully!`, 'success');
    await Promise.all([loadUsers(), loadStats()]);
  } catch (err) {
    showAlert('admin-alert', err.message);
  }
}

async function promoteAdmin(id) {
  if (!confirm('Promote this user to Admin? This cannot be undone easily.')) return;
  try {
    await Admin.changeRole(id, 'admin');
    showAlert('admin-alert', 'User promoted to Admin!', 'success');
    await loadUsers();
  } catch (err) {
    showAlert('admin-alert', err.message);
  }
}

async function approveTip(id) {
  try {
    await Admin.approveTip(id);
    showAlert('admin-alert', 'Tip approved and published!', 'success');
    await Promise.all([loadPendingTips(), loadAllTips(), loadStats()]);
  } catch (err) {
    showAlert('admin-alert', err.message);
  }
}

async function rejectTip(id) {
  if (!confirm('Delete this tip?')) return;
  try {
    await Admin.deleteTip(id);
    showAlert('admin-alert', 'Tip deleted.', 'success');
    await Promise.all([loadPendingTips(), loadAllTips(), loadStats()]);
  } catch (err) {
    showAlert('admin-alert', err.message);
  }
}
