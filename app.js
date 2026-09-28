// ==========================================
// App Controller — Main Application Logic
// ==========================================

// State
let todos = [];
let currentFilter = 'all';
let editingId = null;
let apiLogs = [];

// ==========================================
// Inisialisasi Aplikasi
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  setupEventListeners();
});

function setupEventListeners() {
  // Form submit
  document.getElementById('addForm').addEventListener('submit', handleAddTodo);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
  });

  // Modal
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  document.getElementById('editForm').addEventListener('submit', handleEditSave);
  document.getElementById('btnCancelEdit').addEventListener('click', closeEditModal);

  // API Log
  document.getElementById('apiLogToggle').addEventListener('click', toggleApiLog);
  document.getElementById('apiLogClear').addEventListener('click', clearApiLog);

  // Keyboard shortcut - Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEditModal();
  });
}

// ==========================================
// CRUD Operations (Memanggil API Layer)
// ==========================================

// READ — Ambil semua data
async function loadTodos() {
  showLoading(true);
  try {
    const startTime = Date.now();
    todos = await API.getAllTodos();
    const duration = Date.now() - startTime;
    
    addApiLog('GET', '/todos?select=*&order=created_at.desc', 'success', `${duration}ms`);
    renderTodos();
    updateStats();
  } catch (error) {
    addApiLog('GET', '/todos', 'error', error.message);
    showToast('Gagal memuat data. Cek koneksi & tabel Supabase.', 'error');
  } finally {
    showLoading(false);
  }
}

// CREATE — Tambah todo baru
async function handleAddTodo(e) {
  e.preventDefault();

  const title = document.getElementById('inputTitle').value.trim();
  const description = document.getElementById('inputDesc').value.trim();
  const priority = document.getElementById('inputPriority').value;

  if (!title) {
    showToast('Judul tidak boleh kosong!', 'error');
    return;
  }

  const addBtn = document.querySelector('.btn-add');
  addBtn.disabled = true;
  addBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Menambahkan...</span>';

  try {
    const startTime = Date.now();
    const result = await API.createTodo({ title, description, priority });
    const duration = Date.now() - startTime;

    addApiLog('POST', '/todos', 'success', `${duration}ms`);

    // Tambahkan ke array lokal
    if (result && result.length > 0) {
      todos.unshift(result[0]);
    } else {
      // Reload dari server jika response tidak ada data
      await loadTodos();
    }

    // Reset form
    document.getElementById('addForm').reset();
    
    renderTodos();
    updateStats();
    showToast('✅ Todo berhasil ditambahkan!', 'success');
  } catch (error) {
    addApiLog('POST', '/todos', 'error', error.message);
    showToast('Gagal menambahkan todo.', 'error');
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = '<span class="btn-icon">＋</span><span>Tambah Task</span>';
  }
}

// UPDATE — Toggle status selesai
async function handleToggle(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const todoEl = document.querySelector(`[data-id="${id}"]`);
  if (todoEl) todoEl.style.opacity = '0.5';

  try {
    const startTime = Date.now();
    const result = await API.toggleTodo(id, todo.is_completed);
    const duration = Date.now() - startTime;

    addApiLog('PATCH', `/todos?id=eq.${id}`, 'success', `${duration}ms`);

    // Update state lokal
    todo.is_completed = !todo.is_completed;
    renderTodos();
    updateStats();

    const status = todo.is_completed ? 'selesai ✓' : 'belum selesai';
    showToast(`Task ditandai ${status}`, 'info');
  } catch (error) {
    addApiLog('PATCH', `/todos?id=eq.${id}`, 'error', error.message);
    showToast('Gagal mengubah status.', 'error');
    if (todoEl) todoEl.style.opacity = '1';
  }
}

// UPDATE — Edit todo (via modal)
function openEditModal(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  editingId = id;
  document.getElementById('editTitle').value = todo.title;
  document.getElementById('editDesc').value = todo.description || '';
  document.getElementById('editPriority').value = todo.priority || 'medium';

  document.getElementById('modalOverlay').classList.add('active');
}

function closeEditModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  editingId = null;
}

async function handleEditSave(e) {
  e.preventDefault();

  if (!editingId) return;

  const title = document.getElementById('editTitle').value.trim();
  const description = document.getElementById('editDesc').value.trim();
  const priority = document.getElementById('editPriority').value;

  if (!title) {
    showToast('Judul tidak boleh kosong!', 'error');
    return;
  }

  try {
    const startTime = Date.now();
    const result = await API.updateTodo(editingId, { title, description, priority });
    const duration = Date.now() - startTime;

    addApiLog('PATCH', `/todos?id=eq.${editingId}`, 'success', `${duration}ms`);

    // Update state lokal
    const todo = todos.find(t => t.id === editingId);
    if (todo) {
      todo.title = title;
      todo.description = description;
      todo.priority = priority;
    }

    closeEditModal();
    renderTodos();
    showToast('✏️ Todo berhasil diupdate!', 'success');
  } catch (error) {
    addApiLog('PATCH', `/todos?id=eq.${editingId}`, 'error', error.message);
    showToast('Gagal mengupdate todo.', 'error');
  }
}

// DELETE — Hapus todo
async function handleDelete(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  // Animasi slide out
  const todoEl = document.querySelector(`[data-id="${id}"]`);
  if (todoEl) {
    todoEl.style.animation = 'slideOut 0.3s ease forwards';
    await new Promise(r => setTimeout(r, 300));
  }

  try {
    const startTime = Date.now();
    await API.deleteTodo(id);
    const duration = Date.now() - startTime;

    addApiLog('DELETE', `/todos?id=eq.${id}`, 'success', `${duration}ms`);

    // Hapus dari state lokal
    todos = todos.filter(t => t.id !== id);
    renderTodos();
    updateStats();
    showToast('🗑️ Todo berhasil dihapus!', 'success');
  } catch (error) {
    addApiLog('DELETE', `/todos?id=eq.${id}`, 'error', error.message);
    showToast('Gagal menghapus todo.', 'error');
    if (todoEl) todoEl.style.animation = '';
  }
}

// ==========================================
// Filter
// ==========================================
function handleFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTodos();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case 'active': return todos.filter(t => !t.is_completed);
    case 'completed': return todos.filter(t => t.is_completed);
    default: return todos;
  }
}

// ==========================================
// Render / UI
// ==========================================
function renderTodos() {
  const list = document.getElementById('todoList');
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${currentFilter === 'completed' ? '🎯' : currentFilter === 'active' ? '✨' : '📝'}</div>
        <h3>${currentFilter === 'all' ? 'Belum ada task' : currentFilter === 'active' ? 'Semua sudah selesai!' : 'Belum ada yang selesai'}</h3>
        <p>${currentFilter === 'all' ? 'Tambahkan task pertamamu di atas' : 'Coba filter lain'}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(todo => `
    <div class="todo-item ${todo.is_completed ? 'completed' : ''} priority-${todo.priority || 'medium'}" data-id="${todo.id}">
      <div class="todo-checkbox" onclick="handleToggle(${todo.id})" title="Toggle selesai">
        <span class="check-icon">✓</span>
      </div>
      <div class="todo-content">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-meta">
          <span class="todo-priority-badge ${todo.priority || 'medium'}">
            ${getPriorityIcon(todo.priority)} ${todo.priority || 'medium'}
          </span>
          <span class="todo-date">${formatDate(todo.created_at)}</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-action edit" onclick="openEditModal(${todo.id})" title="Edit">✏️</button>
        <button class="btn-action delete" onclick="handleDelete(${todo.id})" title="Hapus">🗑️</button>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.is_completed).length;
  const active = total - completed;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statCompleted').textContent = completed;
}

function showLoading(show) {
  const list = document.getElementById('todoList');
  if (show) {
    list.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">Memuat data dari Supabase...</div>
      </div>
    `;
  }
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove setelah 3 detik
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// API Log Panel
// ==========================================
function addApiLog(method, endpoint, status, detail) {
  const log = {
    method,
    endpoint,
    status,
    detail,
    time: new Date().toLocaleTimeString('id-ID')
  };
  apiLogs.unshift(log);
  if (apiLogs.length > 50) apiLogs.pop();
  renderApiLog();
}

function renderApiLog() {
  const list = document.getElementById('apiLogList');
  if (!list) return;

  list.innerHTML = apiLogs.map(log => `
    <div class="api-log-entry">
      <span class="api-log-method ${log.method.toLowerCase()}">${log.method}</span>
      <div class="api-log-details">
        <div class="api-log-endpoint">${log.endpoint}</div>
        <div class="api-log-status ${log.status}">${log.time} — ${log.detail}</div>
      </div>
    </div>
  `).join('');
}

function toggleApiLog() {
  document.getElementById('apiLogPanel').classList.toggle('active');
}

function clearApiLog() {
  apiLogs = [];
  renderApiLog();
}

// ==========================================
// Helpers
// ==========================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  // Kurang dari 1 menit
  if (diff < 60000) return 'Baru saja';
  // Kurang dari 1 jam
  if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
  // Kurang dari 24 jam
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
  // Kurang dari 7 hari
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} hari lalu`;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getPriorityIcon(priority) {
  switch (priority) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '🟡';
  }
}
