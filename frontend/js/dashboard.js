/* =============================================
   dashboard.js — User Dashboard Logic
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth() || !requireRole('user')) return;
  populateSidebarUser();
  applyRoleVisibility();
  setActiveNav();

  const user = getCurrentUser();
  const welcomeName = document.getElementById('welcome-name');
  if (welcomeName && user) {
    welcomeName.textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  await Promise.all([loadSummary(), loadGoal(), loadDailyTip(), loadDeviceCount()]);
});

async function loadSummary() {
  try {
    const data = await Usage.summary();
    const s = data.summary;
    const monthlyTotalLabel = document.getElementById('monthly-total');
    if (monthlyTotalLabel) monthlyTotalLabel.textContent = `${s.monthlyTotal.toFixed(1)} L`;

    // Chart.js — weekly bar chart
    const usageCanvas = document.getElementById('usage-chart');
    if (usageCanvas) {
      const labels = s.weeklyByDay.map(d => {
        const date = new Date(d._id);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      });
      const values = s.weeklyByDay.map(d => d.total);

      const ctx = usageCanvas.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Water Used (L)',
            data: values,
            backgroundColor: 'rgba(14,165,233,0.6)',
            borderColor: 'rgba(14,165,233,1)',
            borderWidth: 2,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: ctx => `${ctx.raw} L` } }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { color: '#64748b' }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#64748b' }
            }
          }
        }
      });
    }

    // Device donut chart
    const deviceCanvas = document.getElementById('device-chart');
    if (deviceCanvas && s.byDevice.length > 0) {
      const devCtx = deviceCanvas.getContext('2d');
      const colors = ['#0ea5e9','#06b6d4','#10b981','#6366f1','#f59e0b','#ef4444'];
      new Chart(devCtx, {
        type: 'doughnut',
        data: {
          labels: s.byDevice.map(d => d.deviceName),
          datasets: [{
            data: s.byDevice.map(d => d.total),
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12 } } },
          cutout: '65%'
        }
      });
    }
  } catch (err) {
    console.error('Error loading summary:', err);
  }
}

async function loadGoal() {
  try {
    const data = await Goals.get();
    const el = document.getElementById('goal-section');
    if (!el) return;

    if (!data.goal) {
      el.innerHTML = `<p class="text-muted">No goal set for this month. <a href="goals.html" class="text-primary">Set one →</a></p>`;
      return;
    }
    const pct = data.progress.toFixed(1);
    const barClass = data.progress >= 90 ? 'danger' : '';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
        <span>Monthly Target: <strong>${data.goal.targetLiters} L</strong></span>
        <span style="color:${data.progress >= 100 ? '#ef4444' : '#10b981'}">${pct}% used</span>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar ${barClass}" style="width:${Math.min(data.progress, 100)}%"></div>
      </div>
      <p style="margin-top:0.5rem;font-size:0.8rem;color:#64748b">
        Actual: ${data.actualLiters.toFixed(1)} L / ${data.goal.targetLiters} L
      </p>`;
  } catch (err) {
    console.error('Error loading goal:', err);
  }
}

async function loadDailyTip() {
  try {
    const user = getCurrentUser();
    const city = user?.location?.city || '';
    const data = await Tips.list({ season: 'all', ...(city ? { location: city } : {}) });
    
    if (data.tips.length > 0) {
      const tip = data.tips[Math.floor(Math.random() * Math.min(data.tips.length, 5))];
      
      const titleEl = document.getElementById('daily-tip-title');
      const bodyEl = document.getElementById('daily-tip-body');
      const catEl = document.getElementById('daily-tip-category');
      
      if (titleEl) titleEl.textContent = tip.title;
      if (bodyEl) bodyEl.textContent = tip.body;
      if (catEl) catEl.textContent = tip.category;
    }
  } catch (err) {
    console.error('Error loading tip:', err);
  }
}

async function loadDeviceCount() {
  try {
    const data = await Devices.list();
    const deviceCountEl = document.getElementById('device-count');
    if (deviceCountEl) {
      deviceCountEl.textContent = data.count;
    }
  } catch (err) {
    console.error('Error loading devices:', err);
  }
}
