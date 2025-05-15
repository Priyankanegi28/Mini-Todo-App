const apiUrl = 'https://knowledgeable-aquatic-lasagna.glitch.me/todos';
let todos = [];

// Get the logged-in user
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Please log in first.");
  window.location.href = "login.html";
}

// DOM Elements
const todoList = document.getElementById("tasks-list");
const addTodoForm = document.getElementById("add-todo-form");

// Initialize the app
document.addEventListener("DOMContentLoaded", function() {
  fetchTodos();
  setupEventListeners();
  updateStats();
});

// Fetch todos from API
function fetchTodos() {
  fetch(`${apiUrl}?email=${user.email}`)
    .then(response => response.json())
    .then(data => {
      todos = data;
      renderTodos();
      updateStats();
    })
    .catch(error => {
      console.error('Error fetching todos:', error);
      showError("Failed to load tasks. Please try again.");
    });
}

// Render todos to the DOM
function renderTodos(filter = 'all') {
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
    filteredTodos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
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
      todo.title.toLowerCase().includes(searchTerm) || 
      todo.description.toLowerCase().includes(searchTerm)
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
        </div>
        <div class="task-description">${todo.description}</div>
        <div class="task-meta">
          ${todo.dueDate ? `
            <div class="task-due-date">
              <i class="far fa-calendar-alt"></i>
              ${new Date(todo.dueDate).toLocaleDateString()}
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
        renderTodos();
        updateStats();
        addTodoForm.reset();
        document.getElementById("task-form-container").style.display = 'none';
      })
      .catch(error => {
        console.error('Error adding todo:', error);
        showError("Failed to add task. Please try again.");
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
    renderTodos(document.querySelector(".menu-item.active").dataset.filter);
  });

  // Sort todos
  document.getElementById("task-sort").addEventListener("change", () => {
    renderTodos(document.querySelector(".menu-item.active").dataset.filter);
  });

  // Checkbox for completing todos
  todoList.addEventListener("change", function(e) {
    if (e.target.type === 'checkbox') {
      const todoId = e.target.dataset.id;
      const completed = e.target.checked;
      
      fetch(`${apiUrl}/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed, userEmail: user.email }),
      })
        .then(response => response.json())
        .then(updatedTodo => {
          const index = todos.findIndex(t => t.id == todoId);
          if (index !== -1) {
            todos[index] = updatedTodo;
          }
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
}

// Edit todo
function editTodo(todoId) {
  const todo = todos.find(t => t.id == todoId);
  if (!todo) return;

  // Fill the form with todo data
  document.getElementById("todo-title").value = todo.title;
  document.getElementById("todo-description").value = todo.description;
  document.getElementById("todo-due-date").value = todo.dueDate || '';
  
  // Set priority
  document.querySelectorAll(".priority-option").forEach(option => {
    option.classList.remove("active");
    if (option.dataset.priority === todo.priority) {
      option.classList.add("active");
    }
  });
  
  // Show form
  document.getElementById("task-form-container").style.display = 'block';
  document.getElementById("todo-title").focus();
  
  // Change form to update mode
  const form = document.getElementById("add-todo-form");
  form.dataset.editing = todoId;
  form.querySelector("button[type='submit']").textContent = "Update Task";
  
  // Remove previous submit event and add update event
  form.replaceWith(form.cloneNode(true));
  const newForm = document.getElementById("add-todo-form");
  
  newForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    const title = document.getElementById("todo-title").value;
    const description = document.getElementById("todo-description").value;
    const dueDate = document.getElementById("todo-due-date").value;
    const priority = document.querySelector(".priority-option.active").dataset.priority;
    
    fetch(`${apiUrl}/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        description, 
        dueDate, 
        priority,
        userEmail: user.email 
      }),
    })
      .then(response => response.json())
      .then(updatedTodo => {
        const index = todos.findIndex(t => t.id == todoId);
        if (index !== -1) {
          todos[index] = updatedTodo;
        }
        renderTodos();
        newForm.reset();
        document.getElementById("task-form-container").style.display = 'none';
        delete newForm.dataset.editing;
        newForm.querySelector("button[type='submit']").textContent = "Add Task";
      })
      .catch(error => {
        console.error("Error updating todo:", error);
        showError("Failed to update task. Please try again.");
      });
  });
}

// Delete todo
function deleteTodo(todoId) {
  if (!confirm("Are you sure you want to delete this task?")) return;
  
  fetch(`${apiUrl}/${todoId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userEmail: user.email }),
  })
    .then(() => {
      todos = todos.filter(todo => todo.id != todoId);
      renderTodos();
      updateStats();
    })
    .catch(error => {
      console.error("Error deleting todo:", error);
      showError("Failed to delete task. Please try again.");
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