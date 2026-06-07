// ============================================
// TO-DO LIST APPLICATION WITH LOCAL STORAGE
// ============================================

// Local Storage Key
const STORAGE_KEY = 'todoList_tasks';
const FILTER_KEY = 'todoList_filter';

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');
const exportBtn = document.getElementById('exportBtn');
const toastEl = document.getElementById('toast');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const remainingTasksEl = document.getElementById('remainingTasks');

// State
let tasks = [];
let currentFilter = 'all';

// ============================================
// INITIALIZATION
// ============================================

function init() {
    loadTasksFromStorage();
    currentFilter = localStorage.getItem(FILTER_KEY) || 'all';
    setupEventListeners();
    render();
    console.log('✅ To-Do List App Initialized!');
}

// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================

function loadTasksFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        tasks = stored ? JSON.parse(stored) : [];
        console.log('📦 Tasks loaded from storage:', tasks.length);
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = [];
    }
}

function saveTasksToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        console.log('💾 Tasks saved to storage');
    } catch (error) {
        console.error('Error saving tasks:', error);
        showToast('Error saving tasks!', 'error');
    }
}

// ============================================
// TASK MANAGEMENT FUNCTIONS
// ============================================

function addTask(text) {
    if (!text.trim()) {
        showToast('Task khaali nahi ho sakta!', 'warning');
        return;
    }

    if (text.length > 100) {
        showToast('Task 100 characters se zyada nahi ho sakta!', 'warning');
        return;
    }

    const task = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toLocaleString('en-IN')
    };

    tasks.unshift(task);
    saveTasksToStorage();
    render();
    taskInput.value = '';
    showToast('✅ Task add ho gaya!', 'success');
    taskInput.focus();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    render();
    showToast('🗑️ Task delete ho gaya!', 'success');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        render();
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Task ko edit karo:', task.text);
    if (newText && newText.trim()) {
        task.text = newText.trim();
        saveTasksToStorage();
        render();
        showToast('✏️ Task update ho gaya!', 'success');
    }
}

function clearCompletedTasks() {
    const beforeCount = tasks.length;
    tasks = tasks.filter(task => !task.completed);
    if (beforeCount !== tasks.length) {
        saveTasksToStorage();
        render();
        showToast('🧹 Completed tasks clear ho gaye!', 'success');
    }
}

function clearAllTasks() {
    if (tasks.length === 0) {
        showToast('Koi task nahi hai!', 'warning');
        return;
    }

    if (confirm('🚨 Sab tasks delete ho jayenge! Confirm karo?')) {
        tasks = [];
        saveTasksToStorage();
        render();
        showToast('⚠️ Sab tasks delete ho gaye!', 'success');
    }
}

function exportTasks() {
    if (tasks.length === 0) {
        showToast('Export karne ke liye koi task nahi!', 'warning');
        return;
    }

    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('💾 Tasks export ho gaye!', 'success');
}

// ============================================
// FILTERING FUNCTIONS
// ============================================

function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'all':
        default:
            return tasks;
    }
}

function setFilter(filter) {
    currentFilter = filter;
    localStorage.setItem(FILTER_KEY, filter);
    
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    render();
}

// ============================================
// STATISTICS FUNCTIONS
// ============================================

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const remaining = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    remainingTasksEl.textContent = remaining;

    // Percentage
    if (total > 0) {
        const percentage = Math.round((completed / total) * 100);
        console.log(`📊 Progress: ${percentage}% (${completed}/${total})`);
    }
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

function render() {
    const filteredTasks = getFilteredTasks();
    
    // Clear list
    tasksList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
        tasksList.style.minHeight = '300px';
    } else {
        emptyState.classList.add('hidden');
        filteredTasks.forEach(task => {
            tasksList.appendChild(createTaskElement(task));
        });
    }

    updateStats();
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;

    const timeSpan = document.createElement('small');
    timeSpan.className = 'task-time';
    timeSpan.textContent = new Date(task.createdAt).toLocaleDateString('en-IN');

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn edit-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit task';
    editBtn.addEventListener('click', () => editTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-btn delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(timeSpan);
    li.appendChild(actionsDiv);

    return li;
}

// ============================================
// TOAST NOTIFICATION FUNCTION
// ============================================

function showToast(message, type = 'success') {
    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;

    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Add task
    addBtn.addEventListener('click', () => {
        addTask(taskInput.value);
    });

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // Action buttons
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);
    exportBtn.addEventListener('click', exportTasks);

    // Focus on input when page loads
    taskInput.focus();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        taskInput.focus();
    }

    // Escape to blur input
    if (e.key === 'Escape') {
        taskInput.blur();
    }
});

// ============================================
// PAGE VISIBILITY API - AUTO SAVE
// ============================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveTasksToStorage();
        console.log('👁️ Page hidden - Tasks auto-saved');
    }
});

// ============================================
// UNLOAD EVENT - FINAL SAVE
// ============================================

window.addEventListener('beforeunload', () => {
    saveTasksToStorage();
});

// ============================================
// STARTUP
// ============================================

document.addEventListener('DOMContentLoaded', init);

console.log('%c🎯 To-Do List App Ready!', 'color: blue; font-size: 16px; font-weight: bold;');
console.log('%cShortcuts:', 'color: green; font-weight: bold;');
console.log('- Ctrl/Cmd + K: Focus input');
console.log('- Enter: Add task');
console.log('- Escape: Blur input');
