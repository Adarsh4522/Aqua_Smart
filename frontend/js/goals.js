/* =============================================
   goals.js — Conservation Goals Page
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth() || !requireRole('user')) return;
  populateSidebarUser();
  applyRoleVisibility();
  setActiveNav();
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  await loadGoal();
  document.getElementById('goal-form')?.addEventListener('submit', handleSetGoal);
});

async function loadGoal() {
  try {
    const data = await Goals.get();
    const now = new Date();
    
    const monthEl = document.getElementById('goal-month');
    if (monthEl) monthEl.textContent = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const statusEl = document.getElementById('goal-status');
    if (!statusEl) return;

    if (!data.goal) {
      statusEl.innerHTML = `<p style="color:#64748b">No goal set for this month yet. Set one below!</p>`;
      renderRing(0, 0, 1);
      return;
    }

    const pct = Math.min(data.progress, 100);
    const targetInput = document.getElementById('goal-target-input');
    if (targetInput) targetInput.value = data.goal.targetLiters;

    const statusColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';
    const statusMsg = pct >= 100 ? '⛔ Goal exceeded!' : pct >= 80 ? '⚠️ Approaching limit' : '✅ On track';

    statusEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <span style="font-size:0.95rem">Monthly Target</span>
        <strong>${data.goal.targetLiters} L</strong>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
        <span style="font-size:0.95rem">Used So Far</span>
        <strong>${data.actualLiters.toFixed(1)} L</strong>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:0.95rem">Remaining</span>
        <strong style="color:${statusColor}">${Math.max(0, data.goal.targetLiters - data.actualLiters).toFixed(1)} L</strong>
      </div>
      <div style="margin-top:1rem;font-weight:600;color:${statusColor}">${statusMsg}</div>
    `;

    renderRing(pct, data.actualLiters, data.goal.targetLiters);
  } catch (err) {
    showAlert('goal-alert', err.message);
  }
}

function renderRing(pct, actual, target) {
  const wrap = document.getElementById('goal-ring-wrap');
  if (!wrap) return;

  const R = 70;
  const circumference = 2 * Math.PI * R;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#0ea5e9';

  wrap.innerHTML = `
    <svg width="180" height="180" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
      <circle cx="90" cy="90" r="${R}" fill="none" stroke="#e2e8f0" stroke-width="12"/>
      <circle cx="90" cy="90" r="${R}" fill="none" stroke="url(#ringGrad)" stroke-width="12"
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        transform="rotate(-90 90 90)" style="transition:stroke-dashoffset 1s ease"/>
      <text x="90" y="84" text-anchor="middle" fill="#0f172a" font-size="22" font-weight="800">${pct.toFixed(0)}%</text>
      <text x="90" y="104" text-anchor="middle" fill="#64748b" font-size="12">of goal</text>
    </svg>
  `;
}

async function handleSetGoal(e) {
  e.preventDefault();
  const target = parseFloat(document.getElementById('goal-target-input').value);
  if (!target || target <= 0) {
    return showAlert('goal-alert', 'Please enter a valid target in litres');
  }
  try {
    await Goals.set({ targetLiters: target });
    showAlert('goal-alert', 'Goal saved successfully!', 'success');
    await loadGoal();
  } catch (err) {
    showAlert('goal-alert', err.message);
  }
}
