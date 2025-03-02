const apiUrl = 'https://knowledgeable-aquatic-lasagna.glitch.me/todos';
const todoList = document.getElementById('todos');
const addTodoForm = document.getElementById('add-todo-form');

// Get the logged-in user
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Please log in first.");
  window.location.href = "login.html";
}

function fetchTodos() {
  fetch(`${apiUrl}?email=${user.email}`)
    .then(response => response.json())
    .then(todos => {
      todoList.innerHTML = '';
      todos.forEach(todo => {
        displayTodo(todo);
      });
    })
    .catch(error => console.error('Error fetching todos:', error));
}

function displayTodo(todo) {
  const todoItem = document.createElement('li');
  todoItem.classList.add('todo-item');

  todoItem.innerHTML = `
    <span>${todo.title}: ${todo.description}</span>
    <button onclick="editTodo(${todo.id})">Edit</button>
    <button onclick="deleteTodo(${todo.id})">Delete</button>
  `;

  todoList.appendChild(todoItem);
}

addTodoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.getElementById("todo-title").value;
  const description = document.getElementById("todo-description").value;

  const newTodo = {
    title,
    description,
    userEmail: user.email,
  };

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTodo),
  })
    .then(response => response.json())
    .then(todo => {
      displayTodo(todo);
      addTodoForm.reset();
    })
    .catch(error => console.error('Error adding todo:', error));
});

function editTodo(todoId) {
  const newTitle = prompt("Edit title:");
  const newDescription = prompt("Edit description:");

  if (newTitle !== null && newDescription !== null) {
    fetch(`${apiUrl}/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDescription, userEmail: user.email }),
    })
      .then(response => response.json())
      .then(() => fetchTodos())
      .catch(error => console.error("Error updating todo:", error));
  }
}

function deleteTodo(todoId) {
  if (confirm("Are you sure you want to delete this todo?")) {
    fetch(`${apiUrl}/${todoId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail: user.email }),
    })
      .then(() => fetchTodos())
      .catch(error => console.error("Error deleting todo:", error));
  }
}

fetchTodos();
