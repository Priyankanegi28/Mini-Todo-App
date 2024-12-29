const API_URL = "https://knowledgeable-aquatic-lasagna.glitch.me";

document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_URL}/users`);
  const users = await response.json();

  if (users.length > 0) {
    alert("Signup not allowed. Only one account can be created.");
    return;
  }

  await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  alert("Signup successful!");
});

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch(`${API_URL}/users`);
  const users = await response.json();

  const user = users.find((user) => user.email === email && user.password === password);

  if (user) {
    alert("Login successful!");
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "todos.html";
  } else {
    alert("Invalid credentials");
  }
});

async function loadTodos() {
  const response = await fetch(`${API_URL}/todos`);
  const todos = await response.json();

  const todoList = document.getElementById("todo-list");
  todoList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.innerText = todo.text;
    todoList.appendChild(li);
  });
}

document.getElementById("todo-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const todoText = document.getElementById("todo-input").value;

  await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: todoText }),
  });

  loadTodos();
});

loadTodos();
