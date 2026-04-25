/* =============================================
   tips.js — Water-Saving Tips Page & Provider Submit
   ============================================= */

const CATEGORY_ICONS = {
  shower: '🚿', garden: '🌿', kitchen: '🍳', laundry: '👕',
  general: '💧', toilet: '🚽', irrigation: '🌱'
};

let allTips = [];
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof populateSidebarUser === 'function') {
    populateSidebarUser();
    applyRoleVisibility();
    setActiveNav();
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  await loadTips();

  // Category filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  // Search
  const searchInput = document.getElementById('tip-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => applyFilter());
  }

  // Provider tip submit
  const submitForm = document.getElementById('tip-submit-form');
  if (submitForm) {
    submitForm.addEventListener('submit', handleSubmitTip);
  }
});

async function loadTips() {
  try {
    const data = await Tips.list();
    allTips = data.tips;
    applyFilter();
  } catch (err) {
    console.error('Error loading tips:', err);
  }
}

function applyFilter() {
  const search = (document.getElementById('tip-search')?.value || '').toLowerCase();
  let filtered = allTips;

  if (activeFilter !== 'all') {
    filtered = filtered.filter(t => t.category === activeFilter);
  }
  if (search) {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(search) || t.body.toLowerCase().includes(search));
  }
  renderTips(filtered);
}

function renderTips(tips) {
  const grid = document.getElementById('tips-grid');
  const empty = document.getElementById('tips-empty');

  // SAFETY FIX: If the tips grid doesn't exist on this page, don't crash
  if (!grid) return;

  if (tips.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.innerHTML = tips.map(tip => `
    <div class="tip-card">
      <div class="tip-card-header">
        <span class="badge badge-blue">${CATEGORY_ICONS[tip.category] || '💧'} ${tip.category}</span>
        ${tip.season !== 'all' ? `<span class="badge badge-amber">${tip.season}</span>` : ''}
        ${tip.location ? `<span class="badge badge-purple">📍 ${tip.location}</span>` : ''}
      </div>
      <h4 class="tip-card-title">${tip.title}</h4>
      <p class="tip-card-body">${tip.body}</p>
      <div class="tip-card-footer">
        <span>By ${tip.authorId?.name || 'Expert'}</span>
        <span>${new Date(tip.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
      </div>
    </div>
  `).join('');
}

async function handleSubmitTip(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    title: form.elements['title'].value.trim(),
    body: form.elements['body'].value.trim(),
    category: form.elements['category'].value,
    season: form.elements['season'].value,
    location: form.elements['location'].value.trim()
  };

  try {
    await Tips.create(payload);
    form.reset();
    await loadMyTips();
    showAlert('tip-alert', 'Tip submitted for admin review!', 'success');
  } catch (err) {
    showAlert('tip-alert', err.message);
  }
}

// Provider portal: load own tips
async function loadMyTips() {
  try {
    const data = await Tips.myTips();
    const container = document.getElementById('my-tips-list');
    if (!container) return;

    if (data.tips.length === 0) {
      container.innerHTML = '<p style="color:#64748b">You have not submitted any tips yet.</p>';
      return;
    }
    container.innerHTML = data.tips.map(tip => `
      <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:1rem">
        <div>
          <h4>${tip.title}</h4>
          <span class="badge ${tip.isApproved ? 'badge-green' : 'badge-amber'}">${tip.isApproved ? '✅ Approved' : '⏳ Pending Review'}</span>
        </div>
        <span class="badge badge-blue">${tip.category}</span>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}
