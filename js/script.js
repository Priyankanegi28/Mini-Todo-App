const API_URL = "https://knowledgeable-aquatic-lasagna.glitch.me";

// Signup functionality
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Client-side validation
  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      // Show success message with animation
      const signupForm = document.getElementById("signup-form");
      signupForm.innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle"></i>
          <h3>Signup Successful!</h3>
          <p>Your account has been created successfully.</p>
          <a href="login.html" class="btn">Continue to Login</a>
        </div>
      `;
    } else {
      const errorData = await response.json();
      showError(errorData.message || "Signup failed. Please try again.");
    }
  } catch (error) {
    showError("Network error. Please try again later.");
  }
});

// Login functionality
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const rememberMe = document.getElementById("remember").checked;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // If remember me is checked, store in sessionStorage for longer persistence
      if (rememberMe) {
        sessionStorage.setItem("rememberedUser", JSON.stringify(data.user));
      }
      
      // Show loading animation
      const loginForm = document.getElementById("login-form");
      loginForm.innerHTML = `
        <div class="loading-animation">
          <div class="spinner"></div>
          <p>Logging you in...</p>
        </div>
      `;
      
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "todos.html";
      }, 1500);
    } else {
      const errorData = await response.json();
      showError(errorData.message || "Invalid credentials. Please try again.");
    }
  } catch (error) {
    showError("Network error. Please try again later.");
  }
});

// Helper function to show error messages
function showError(message) {
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  const form = document.querySelector("form");
  const existingError = form.querySelector(".error-message");
  
  if (existingError) {
    form.replaceChild(errorElement, existingError);
  } else {
    form.insertBefore(errorElement, form.firstChild);
  }
  
  // Auto-remove error after 5 seconds
  setTimeout(() => {
    errorElement.classList.add("fade-out");
    setTimeout(() => errorElement.remove(), 300);
  }, 5000);
}

// Check for remembered user on login page load
document.addEventListener("DOMContentLoaded", function() {
  if (window.location.pathname.includes("login.html")) {
    const rememberedUser = sessionStorage.getItem("rememberedUser");
    if (rememberedUser) {
      const user = JSON.parse(rememberedUser);
      document.getElementById("login-email").value = user.email;
      document.getElementById("remember").checked = true;
    }
  }
});