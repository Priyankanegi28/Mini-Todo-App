document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('login-password');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // Form submission
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        try {
          const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
  
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("user", JSON.stringify(data.user));
            
            // Show success message
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirect to todos page
            window.location.href = "todos.html";
          } else {
            const errorData = await response.json();
            showError(errorData.message || "Invalid credentials");
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
          }
        } catch (error) {
          showError("Network error. Please try again.");
          submitBtn.innerHTML = originalBtnText;
          submitBtn.disabled = false;
        }
      });
    }
    
    function showError(message) {
      // Remove any existing error messages
      const existingError = document.querySelector('.error-message');
      if (existingError) existingError.remove();
      
      // Create and display new error message
      const errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      loginForm.insertBefore(errorElement, loginForm.firstChild);
      
      // Scroll to error
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });