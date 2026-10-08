// State Management
const STORAGE_KEY = 'minimal_todo_app_data';
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = 'all';

// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const itemsLeftSpan = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');
const dateDisplay = document.getElementById('date-display');

// Display Current Date
function initDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date();
  dateDisplay.textContent = today.toLocaleDateString(undefined, options);
}

// Save to LocalStorage
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// Render Todos
function render() {
  todoList.innerHTML = '';

  const filteredTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // 'all'
  });

  if (filteredTodos.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    // Left Section (Checkbox & Title)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'todo-content';

    const checkbox = document.createElement('div');
    checkbox.className = 'custom-checkbox';
    checkbox.innerHTML = '<i class="fa-solid fa-check"></i>';
    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    const titleSpan = document.createElement('span');
    titleSpan.className = 'todo-title';
    titleSpan.textContent = todo.text;
    
    // Double click to inline-edit
    titleSpan.addEventListener('dblclick', () => startEditing(li, todo));

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(titleSpan);

    // Right Section (Actions)
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.title = 'Edit task';
    editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
    editBtn.addEventListener('click', () => startEditing(li, todo));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(contentDiv);
    li.appendChild(actionsDiv);
    todoList.appendChild(li);
  });

  updateStats();
}

// Update Active Tasks Count
function updateStats() {
  const activeCount = todos.filter(todo => !todo.completed).length;
  itemsLeftSpan.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;

  const hasCompleted = todos.some(todo => todo.completed);
  clearCompletedBtn.style.visibility = hasCompleted ? 'visible' : 'hidden';
}

// Add New Todo
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTodo = {
    id: Date.now().toString(),
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo);
  saveTodos();
  render();
}

// Toggle Complete
function toggleTodo(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  render();
}

// Delete Todo
function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  render();
}

// Inline Edit Todo
function startEditing(li, todo) {
  const contentDiv = li.querySelector('.todo-content');
  const titleSpan = li.querySelector('.todo-title');
  const actionsDiv = li.querySelector('.todo-actions');

  // Create Edit Input
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = todo.text;

  titleSpan.style.display = 'none';
  actionsDiv.style.display = 'none';
  contentDiv.appendChild(editInput);
  editInput.focus();

  function finishEditing() {
    const updatedVal = editInput.value.trim();
    if (updatedVal && updatedVal !== todo.text) {
      todo.text = updatedVal;
      saveTodos();
    } else if (!updatedVal) {
      deleteTodo(todo.id);
      return;
    }
    render();
  }

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      render(); // Cancel
    }
  });

  editInput.addEventListener('blur', finishEditing);
}

// Clear All Completed Todos
function clearCompleted() {
  todos = todos.filter(todo => !todo.completed);
  saveTodos();
  render();
}

// Event Listeners
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = '';
});

clearCompletedBtn.addEventListener('click', clearCompleted);

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Initialize on page load
initDate();
render();