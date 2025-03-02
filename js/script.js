const API_URL = "https://knowledgeable-aquatic-lasagna.glitch.me";

document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    alert("Signup successful...");
    window.location.href = "login.html";
  } else {
    const errorData = await response.json();
    alert(errorData.message);
  }
});

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("user", JSON.stringify(data.user));
    alert("Login successful!");
    window.location.href = "todos.html";
  } else {
    alert("Invalid credentials");
  }
});
