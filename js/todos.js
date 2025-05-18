const apiUrl = 'https://knowledgeable-aquatic-lasagna.glitch.me/todos';
let todos = [];
let currentFilter = 'all';

// Get the logged-in user
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Please log in first.");
  window.location.href = "login.html";
}

// DOM Elements
const todoList = document.getElementById("tasks-list");
const addTodoForm = document.getElementById("add-todo-form");
const taskFormContainer = document.getElementById("task-form-container");
const addTaskBtn = document.getElementById("add-task-btn");
const cancelTaskBtn = document.getElementById("cancel-task-btn");
const logoutBtn = document.getElementById('logout-btn');

// Initialize the app
document.addEventListener("DOMContentLoaded", function() {
  fetchTodos();
  setupEventListeners();
  updateStats();
  checkForReminders(); // Check for reminders on page load
});

// Fetch todos from API
function fetchTodos() {
  fetch(`${apiUrl}?email=${user.email}`)
    .then(response => response.json())
    .then(data => {
      todos = Array.isArray(data) ? data : [];
      renderTodos(currentFilter);
      updateStats();
    })
    .catch(error => {
      console.error('Error fetching todos:', error);
      showError("Failed to load tasks. Please try again.");
    });
}

// Render todos to the DOM
function renderTodos(filter = 'all') {
  currentFilter = filter;
  todoList.innerHTML = '';
  
  if (todos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <img src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png" alt="No tasks">
        <h3>No tasks yet</h3>
        <p>Click "Add Task" to create your first todo</p>
      </div>
    `;
    return;
  }
  
  let filteredTodos = [...todos];
  
  // Apply filters
  if (filter === 'today') {
    const today = new Date().toISOString().split('T')[0];
    filteredTodos = filteredTodos.filter(todo => todo.dueDate === today);
  } else if (filter === 'important') {
    filteredTodos = filteredTodos.filter(todo => todo.priority === 'high');
  } else if (filter === 'completed') {
    filteredTodos = filteredTodos.filter(todo => todo.completed);
  }
  
  // Apply sorting
  const sortBy = document.getElementById("task-sort").value;
  if (sortBy === 'due-date') {
    filteredTodos.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
      return dateA - dateB;
    });
  } else if (sortBy === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    filteredTodos.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sortBy === 'created') {
    filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  // Apply search
  const searchTerm = document.getElementById("task-search").value.toLowerCase();
  if (searchTerm) {
    filteredTodos = filteredTodos.filter(todo => 
      (todo.title && todo.title.toLowerCase().includes(searchTerm)) || 
      (todo.description && todo.description.toLowerCase().includes(searchTerm))
    );
  }
  
  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <img src="https://cdn-icons-png.flaticon.com/512/7486/7486768.png" alt="No tasks match your criteria">
        <h3>No tasks match your criteria</h3>
        <p>Try adjusting your filters or search term</p>
      </div>
    `;
    return;
  }
  
  filteredTodos.forEach(todo => {
    const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
    const daysLeft = dueDate ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24)) : null;
    
    const todoItem = document.createElement("div");
    todoItem.className = `task-item ${todo.completed ? 'task-completed' : ''}`;
    todoItem.innerHTML = `
      <div class="task-checkbox">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
      </div>
      <div class="task-content">
        <div class="task-title">
          ${todo.title}
          ${todo.priority === 'high' ? '<span class="task-priority priority-high">High</span>' : ''}
          ${todo.priority === 'medium' ? '<span class="task-priority priority-medium">Medium</span>' : ''}
          ${todo.priority === 'low' ? '<span class="task-priority priority-low">Low</span>' : ''}
          ${daysLeft !== null && daysLeft <= 3 ? `<span class="task-days-left">${daysLeft} day${daysLeft !== 1 ? 's' : ''} left</span>` : ''}
        </div>
        <div class="task-description">${todo.description || ''}</div>
        <div class="task-meta">
          ${todo.dueDate ? `
            <div class="task-due-date">
              <i class="far fa-calendar-alt"></i>
              ${dueDate.toLocaleDateString()}
            </div>
          ` : ''}
          <div class="task-created">
            <i class="far fa-clock"></i>
            ${new Date(todo.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="edit-btn" data-id="${todo.id}"><i class="far fa-edit"></i></button>
        <button class="delete-btn" data-id="${todo.id}"><i class="far fa-trash-alt"></i></button>
      </div>
    `;
    todoList.appendChild(todoItem);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Add new todo
  addTodoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    
    const title = document.getElementById("todo-title").value;
    const description = document.getElementById("todo-description").value;
    const dueDate = document.getElementById("todo-due-date").value;
    const priority = document.querySelector(".priority-option.active").dataset.priority;
    const isEditing = addTodoForm.dataset.editing;
    
    if (isEditing) {
      // Update existing todo
      const existingTodo = todos.find(t => t.id == isEditing);
      const updatedTodo = {
        ...existingTodo,
        title,
        description,
        dueDate,
        priority
      };
      
      fetch(`${apiUrl}/${isEditing}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo),
      })
        .then(response => response.json())
        .then(updatedTodo => {
          const index = todos.findIndex(t => t.id == isEditing);
          if (index !== -1) {
            todos[index] = updatedTodo;
          }
          renderTodos(currentFilter);
          updateStats();
          resetForm();
        })
        .catch(error => {
          console.error('Error updating todo:', error);
          showError("Failed to update task. Please try again.");
        });
    } else {
      // Add new todo
      const newTodo = {
        title,
        description,
        dueDate,
        priority,
        userEmail: user.email,
        completed: false
      };

      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      })
        .then(response => response.json())
        .then(todo => {
          todos.push(todo);
          renderTodos(currentFilter);
          updateStats();
          resetForm();
        })
        .catch(error => {
          console.error('Error adding todo:', error);
          showError("Failed to add task. Please try again.");
        });
    }
  });

  // Toggle task form
  addTaskBtn.addEventListener('click', function() {
    resetForm();
    taskFormContainer.style.display = 'block';
    document.getElementById("todo-title").focus();
  });
  
  cancelTaskBtn.addEventListener('click', function() {
    resetForm();
    taskFormContainer.style.display = 'none';
  });

  // Priority selector
  const priorityOptions = document.querySelectorAll('.priority-option');
  priorityOptions.forEach(option => {
    option.addEventListener('click', function() {
      priorityOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Filter todos
  document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", function() {
      document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
      this.classList.add("active");
      renderTodos(this.dataset.filter);
    });
  });

  // Search todos
  document.getElementById("task-search").addEventListener("input", () => {
    renderTodos(currentFilter);
  });

  // Sort todos
  document.getElementById("task-sort").addEventListener("change", () => {
    renderTodos(currentFilter);
  });

  // Checkbox for completing todos
  todoList.addEventListener("change", function(e) {
    if (e.target.type === 'checkbox') {
      const todoId = e.target.dataset.id;
      const completed = e.target.checked;
      
      const todo = todos.find(t => t.id == todoId);
      if (!todo) return;
      
      fetch(`${apiUrl}/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...todo, completed, userEmail: user.email }),
      })
        .then(response => response.json())
        .then(updatedTodo => {
          const index = todos.findIndex(t => t.id == todoId);
          if (index !== -1) {
            todos[index] = updatedTodo;
          }
          renderTodos(currentFilter);
          updateStats();
        })
        .catch(error => {
          console.error("Error updating todo:", error);
          showError("Failed to update task. Please try again.");
          e.target.checked = !completed; // Revert checkbox
        });
    }
  });

  // Edit todo
  todoList.addEventListener("click", function(e) {
    if (e.target.closest(".edit-btn")) {
      const todoId = e.target.closest(".edit-btn").dataset.id;
      editTodo(todoId);
    }
  });

  // Delete todo
  todoList.addEventListener("click", function(e) {
    if (e.target.closest(".delete-btn")) {
      const todoId = e.target.closest(".delete-btn").dataset.id;
      deleteTodo(todoId);
    }
  });

  // Logout
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });
}

// Edit todo
function editTodo(todoId) {
  const todo = todos.find(t => t.id == todoId);
  if (!todo) return;

  // Fill the form with todo data
  document.getElementById("todo-title").value = todo.title;
  document.getElementById("todo-description").value = todo.description || '';
  document.getElementById("todo-due-date").value = todo.dueDate || '';
  
  // Set priority
  document.querySelectorAll(".priority-option").forEach(option => {
    option.classList.remove("active");
    if (option.dataset.priority === todo.priority) {
      option.classList.add("active");
    }
  });
  
  // Show form
  taskFormContainer.style.display = 'block';
  document.getElementById("todo-title").focus();
  
  // Change form to update mode
  addTodoForm.dataset.editing = todoId;
  addTodoForm.querySelector("button[type='submit']").textContent = "Update Task";
}

// Delete todo
function deleteTodo(todoId) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  
  const todo = todos.find(t => t.id == todoId);
  if (!todo) return;
  
  fetch(`${apiUrl}/${todoId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userEmail: user.email }),
  })
    .then(() => {
      todos = todos.filter(todo => todo.id != todoId);
      renderTodos(currentFilter);
      updateStats();
    })
    .catch(error => {
      console.error("Error deleting todo:", error);
      showError("Failed to delete task. Please try again.");
    });
}

// Reset form
function resetForm() {
  addTodoForm.reset();
  addTodoForm.removeAttribute('data-editing');
  addTodoForm.querySelector("button[type='submit']").textContent = "Add Task";
  document.querySelector('.priority-option[data-priority="medium"]').classList.add('active');
  document.querySelectorAll('.priority-option').forEach(opt => {
    if (opt.dataset.priority !== 'medium') opt.classList.remove('active');
  });
}

// Update stats
function updateStats() {
  document.getElementById("total-tasks").textContent = todos.length;
  document.getElementById("completed-tasks").textContent = todos.filter(t => t.completed).length;
}

// Show error message
function showError(message) {
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  const container = document.querySelector(".todos-content");
  const existingError = container.querySelector(".error-message");
  
  if (existingError) {
    container.replaceChild(errorElement, existingError);
  } else {
    container.insertBefore(errorElement, container.firstChild);
  }
  
  // Auto-remove error after 5 seconds
  setTimeout(() => {
    errorElement.classList.add("fade-out");
    setTimeout(() => errorElement.remove(), 300);
  }, 5000);
}

// Check for reminders (frontend version - just shows notification)
function checkForReminders() {
  fetch(`${apiUrl}/upcoming-tasks?email=${user.email}`)
    .then(response => response.json())
    .then(upcomingTasks => {
      if (upcomingTasks.length > 0) {
        const currentHour = new Date().getHours();
        const timeOfDay = currentHour < 12 ? 'morning' : 'evening';
        
        let message = `You have ${upcomingTasks.length} upcoming task${upcomingTasks.length !== 1 ? 's' : ''}:\n\n`;
        
        upcomingTasks.forEach(task => {
          const dueDate = new Date(task.dueDate);
          const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
          message += `- ${task.title} (Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''})\n`;
        });

        message += `\nDon't forget to complete them on time!`;
        
        // Show notification
        if (Notification.permission === 'granted') {
          new Notification(`TodoPro ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Reminder`, {
            body: message,
            icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(`TodoPro ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Reminder`, {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
              });
            }
          });
        }
        
        // Also show in-app notification
        showError(`Reminder: ${upcomingTasks.length} upcoming task${upcomingTasks.length !== 1 ? 's' : ''}`);
      }
    })
    .catch(error => {
      console.error('Error checking for reminders:', error);
    });
}