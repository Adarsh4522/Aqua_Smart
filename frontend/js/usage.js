/* =============================================
   usage.js — Usage Log & Chart Page
   ============================================= */

let usageChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth() || !requireRole('user')) return;
  populateSidebarUser();
  applyRoleVisibility();
  setActiveNav();
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  await loadDeviceDropdown();
  await Promise.all([loadHistory(), loadChart()]);

  document.getElementById('usage-form')?.addEventListener('submit', handleLogUsage);
});

async function loadDeviceDropdown() {
  try {
    const data = await Devices.list();
    const select = document.getElementById('log-device');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Device</option>' +
      data.devices.map(d => `<option value="${d._id}">${d.name} (${d.type.replace('_',' ')})</option>`).join('');
  } catch (err) {
    console.error(err);
  }
}

async function handleLogUsage(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    deviceId: form.elements['device'].value,
    liters: parseFloat(form.elements['liters'].value),
    duration: parseFloat(form.elements['duration'].value) || 0,
    notes: form.elements['notes'].value.trim(),
    recordedAt: form.elements['date'].value || new Date().toISOString()
  };

  try {
    await Usage.log(payload);
    form.reset();
    showAlert('usage-alert', 'Usage logged successfully!', 'success');
    await Promise.all([loadHistory(), loadChart()]);
  } catch (err) {
    showAlert('usage-alert', err.message);
  }
}

async function loadHistory() {
  try {
    const data = await Usage.history(30);
    const tbody = document.getElementById('usage-tbody');
    if (!tbody) return;

    if (data.logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:2rem">No usage logs yet. Start tracking!</td></tr>';
      return;
    }
    tbody.innerHTML = data.logs.map(log => `
      <tr>
        <td>${log.deviceId?.name || 'Unknown'} <span class="badge badge-blue">${log.deviceId?.type?.replace('_',' ') || ''}</span></td>
        <td><strong>${log.liters} L</strong></td>
        <td>${log.duration ? log.duration + ' min' : '—'}</td>
        <td>${new Date(log.recordedAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric'})}</td>
        <td style="color:#64748b;font-size:0.85rem">${log.notes || '—'}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

async function loadChart() {
  try {
    const data = await Usage.summary();
    const s = data.summary;

    const labels = s.weeklyByDay.map(d => new Date(d._id).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }));
    const values = s.weeklyByDay.map(d => d.total);

    const canvas = document.getElementById('usage-chart');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (usageChart) usageChart.destroy();

      usageChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Water Used (L)',
            data: values,
            fill: true,
            backgroundColor: 'rgba(14,165,233,0.1)',
            borderColor: '#0ea5e9',
            borderWidth: 2.5,
            pointBackgroundColor: '#0ea5e9',
            pointRadius: 5,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } },
            x: { grid: { display: false }, ticks: { color: '#64748b' } }
          }
        }
      });
    }

    const totalEl = document.getElementById('monthly-total');
    if (totalEl) totalEl.textContent = s.monthlyTotal.toFixed(1) + ' L';
  } catch (err) {
    console.error(err);
  }
}
