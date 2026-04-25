/* =============================================
   devices.js — Device Management Page Logic
   ============================================= */

const DEVICE_ICONS = {
  shower: '🚿', tap: '🚰', irrigation: '🌿',
  dishwasher: '🍽️', washing_machine: '👕', toilet: '🚽', other: '💧'
};

let editingId = null;
let allDevices = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth() || !requireRole('user')) return;
  populateSidebarUser();
  applyRoleVisibility();
  setActiveNav();
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  await loadDevices();

  // Modal: Add / Edit
  document.getElementById('add-device-btn')?.addEventListener('click', () => openModal());
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('device-form')?.addEventListener('submit', handleDeviceSave);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
});

async function loadDevices() {
  try {
    const data = await Devices.list();
    allDevices = data.devices;
    renderDevices(allDevices);
    const countEl = document.getElementById('device-count');
    if (countEl) countEl.textContent = allDevices.length;
  } catch (err) {
    showAlert('devices-alert', err.message);
  }
}

function renderDevices(devices) {
  const grid = document.getElementById('devices-grid');
  const empty = document.getElementById('devices-empty');
  
  if (!grid || !empty) return;

  if (devices.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = devices.map(d => `
    <div class="card" style="display:flex;flex-direction:column;gap:0.75rem">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <span style="font-size:2rem">${DEVICE_ICONS[d.type] || '💧'}</span>
        <div>
          <h4>${d.name}</h4>
          <span class="badge badge-blue">${d.type.replace('_',' ')}</span>
        </div>
        <div style="margin-left:auto;display:flex;gap:0.5rem">
          <button class="btn btn-outline btn-sm" onclick="openModal('${d._id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteDevice('${d._id}')">Delete</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:0.85rem;color:#94a3b8">
        <span>📍 ${d.location || 'Home'}</span>
        <span>🏷️ ${d.brand || 'Unknown brand'}</span>
        <span>💧 ~${d.avgUsagePerDay || 0} L/day</span>
        <span class="${d.isActive ? 'text-green' : 'text-red'}">${d.isActive ? '✅ Active' : '⛔ Inactive'}</span>
      </div>
    </div>
  `).join('');
}

function openModal(id = null) {
  editingId = id;
  const title = document.getElementById('modal-title');
  const form = document.getElementById('device-form');
  if (!form || !title) return;
  
  form.reset();

  if (id) {
    const device = allDevices.find(d => d._id === id);
    if (!device) return;
    title.textContent = 'Edit Device';
    form.elements['name'].value = device.name;
    form.elements['type'].value = device.type;
    form.elements['brand'].value = device.brand || '';
    form.elements['location'].value = device.location || '';
    form.elements['avgUsagePerDay'].value = device.avgUsagePerDay || 0;
  } else {
    title.textContent = 'Add New Device';
  }
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
  editingId = null;
}

async function handleDeviceSave(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    name: form.elements['name'].value.trim(),
    type: form.elements['type'].value,
    brand: form.elements['brand'].value.trim(),
    location: form.elements['location'].value.trim(),
    avgUsagePerDay: parseFloat(form.elements['avgUsagePerDay'].value) || 0
  };

  try {
    if (editingId) {
      await Devices.update(editingId, payload);
    } else {
      await Devices.add(payload);
    }
    closeModal();
    await loadDevices();
  } catch (err) {
    showAlert('devices-alert', err.message);
  }
}

async function deleteDevice(id) {
  if (!confirm('Are you sure you want to remove this device?')) return;
  try {
    await Devices.delete(id);
    await loadDevices();
  } catch (err) {
    showAlert('devices-alert', err.message);
  }
}
