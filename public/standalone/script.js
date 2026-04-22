/**
 * ============================================================
 * CloudTask Manager — JavaScript
 *
 * Cloud Concepts:
 *   DBaaS  : All data is stored in localStorage (simulates a
 *            cloud-managed database with per-user isolation).
 *   SECaaS : Auth state is managed here (simulates a cloud
 *            identity service session).
 * ============================================================
 */

// ── State ──────────────────────────────────────────────────────────────────────

let currentUser = null;   // email of logged-in user
let tasks = [];           // array of task objects
let currentFilter = 'all'; // 'all' | 'pending' | 'completed'

// ── localStorage Keys ──────────────────────────────────────────────────────────

// Users are stored as { email: base64(password) }
const USERS_KEY = 'ctm_users';

// Tasks are stored per-user to simulate per-user database isolation (DBaaS)
function tasksKey(user) {
  return `ctm_tasks_${user}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch { return {}; }
}

function loadTasksFromStorage(user) {
  try { return JSON.parse(localStorage.getItem(tasksKey(user)) || '[]'); }
  catch { return []; }
}

function saveTasksToStorage() {
  // Persist all tasks back to localStorage (cloud database simulation)
  localStorage.setItem(tasksKey(currentUser), JSON.stringify(tasks));
}

function generateId() {
  // Create a unique ID for each task
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

// ── Auth ───────────────────────────────────────────────────────────────────────

function showTab(mode) {
  // Switch between Login and Signup tabs
  document.getElementById('login-form').classList.toggle('hidden', mode !== 'login');
  document.getElementById('signup-form').classList.toggle('hidden', mode !== 'signup');
  document.getElementById('tab-login').classList.toggle('active', mode === 'login');
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  clearMessages();
}

function clearMessages() {
  ['login-error', 'signup-error', 'signup-success'].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = '';
    el.classList.add('hidden');
  });
}

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove('hidden');
}

function showSuccess(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove('hidden');
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const users = getUsers();

  // Check credentials (btoa = base64 encode, simulating password check)
  if (!users[email] || users[email] !== btoa(password)) {
    showError('login-error', 'Invalid email or password.');
    return;
  }

  // Store session (simulates issuing an auth token)
  localStorage.setItem('ctm_current_user', email);
  initDashboard(email);
}

function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (password.length < 6) {
    showError('signup-error', 'Password must be at least 6 characters.');
    return;
  }

  const users = getUsers();
  if (users[email]) {
    showError('signup-error', 'An account with this email already exists.');
    return;
  }

  users[email] = btoa(password); // store encoded password
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  showSuccess('signup-success', 'Account created! You can now log in.');
  setTimeout(() => showTab('login'), 1200);
}

function logout() {
  localStorage.removeItem('ctm_current_user');
  currentUser = null;
  tasks = [];
  document.getElementById('dashboard-section').classList.add('hidden');
  document.getElementById('auth-section').classList.remove('hidden');
}

// ── Dashboard Init ─────────────────────────────────────────────────────────────

function initDashboard(user) {
  currentUser = user;
  tasks = loadTasksFromStorage(user);

  // Hide auth, show dashboard
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('dashboard-section').classList.remove('hidden');
  document.getElementById('user-email-display').textContent = user;

  renderTasks();
  updateStats();
}

// ── Task CRUD ──────────────────────────────────────────────────────────────────

function handleSaveTask(event) {
  event.preventDefault();

  const title    = document.getElementById('task-title').value.trim();
  const desc     = document.getElementById('task-desc').value.trim();
  const priority = document.getElementById('task-priority').value;
  const editId   = document.getElementById('editing-task-id').value;

  if (!title) return;

  if (editId) {
    // Update existing task
    tasks = tasks.map(t =>
      t.id === editId ? { ...t, title, description: desc, priority } : t
    );
  } else {
    // Create new task and add to beginning of list
    const newTask = {
      id: generateId(),
      title,
      description: desc,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    tasks.unshift(newTask);
  }

  saveTasksToStorage();  // persist to cloud (localStorage simulation)
  renderTasks();
  updateStats();
  closeModal();
}

function toggleComplete(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasksToStorage();
  renderTasks();
  updateStats();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasksToStorage();
  renderTasks();
  updateStats();
}

// ── Filtering ──────────────────────────────────────────────────────────────────

function setFilter(filter) {
  currentFilter = filter;

  // Update active button styling
  ['all', 'pending', 'completed'].forEach(f => {
    document.getElementById(`filter-${f}`).classList.toggle('active', f === filter);
  });

  renderTasks();
}

function getFilteredTasks() {
  if (currentFilter === 'pending')   return tasks.filter(t => !t.completed);
  if (currentFilter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
}

// ── Rendering ──────────────────────────────────────────────────────────────────

function renderTasks() {
  const list = document.getElementById('task-list');
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-text">
          ${currentFilter === 'all' ? 'No tasks yet' : `No ${currentFilter} tasks`}
        </p>
        ${currentFilter === 'all'
          ? '<button class="empty-add" onclick="openModal()">+ Add your first task</button>'
          : ''}
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(task => `
    <div class="task-card ${task.completed ? 'completed' : ''}" id="task-${task.id}">
      <!-- Toggle complete button -->
      <button
        class="task-toggle"
        onclick="toggleComplete('${task.id}')"
        aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}"
      >
        ${task.completed ? '✅' : '⭕'}
      </button>

      <!-- Task content -->
      <div class="task-body">
        <div class="task-header">
          <span class="task-title ${task.completed ? 'done' : ''}">${escapeHtml(task.title)}</span>
          <span class="badge badge-${task.priority}">${task.priority}</span>
        </div>
        ${task.description
          ? `<p class="task-desc">${escapeHtml(task.description)}</p>`
          : ''}
        <p class="task-date">${formatDate(task.createdAt)}</p>
      </div>

      <!-- Actions -->
      <div class="task-actions">
        <button class="task-btn" onclick="openEditModal('${task.id}')" aria-label="Edit">✏️</button>
        <button class="task-btn delete" onclick="deleteTask('${task.id}')" aria-label="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  document.getElementById('stat-total').textContent     = tasks.length;
  document.getElementById('stat-completed').textContent = tasks.filter(t => t.completed).length;
  document.getElementById('stat-pending').textContent   = tasks.filter(t => !t.completed).length;
}

// Prevent XSS when rendering user-supplied text into innerHTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Modal ──────────────────────────────────────────────────────────────────────

function openModal() {
  document.getElementById('modal-title').textContent   = 'New Task';
  document.getElementById('modal-save-btn').textContent = 'Add Task';
  document.getElementById('task-title').value           = '';
  document.getElementById('task-desc').value            = '';
  document.getElementById('task-priority').value        = 'medium';
  document.getElementById('editing-task-id').value      = '';
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('task-title').focus();
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('modal-title').textContent    = 'Edit Task';
  document.getElementById('modal-save-btn').textContent = 'Save Changes';
  document.getElementById('task-title').value           = task.title;
  document.getElementById('task-desc').value            = task.description;
  document.getElementById('task-priority').value        = task.priority;
  document.getElementById('editing-task-id').value      = task.id;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('task-title').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// Close modal when clicking the dark backdrop (not the card)
function closeModalIfOutside(event) {
  if (event.target === document.getElementById('modal-overlay')) closeModal();
}

// Close modal with Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── On Page Load ───────────────────────────────────────────────────────────────

(function init() {
  // Check if a user session exists (simulates checking a cloud auth token)
  const savedUser = localStorage.getItem('ctm_current_user');
  if (savedUser) {
    initDashboard(savedUser);
  }
  // Otherwise the login screen is shown (default HTML state)
})();
