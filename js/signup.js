document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const togglePassword = document.querySelector('.toggle-password');
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // Password strength checker
    passwordInput.addEventListener('input', function() {
      const password = this.value;
      let strength = 0;
      
      // Length check
      if (password.length >= 8) strength++;
      // Lowercase check
      if (/[a-z]/.test(password)) strength++;
      // Uppercase check
      if (/[A-Z]/.test(password)) strength++;
      // Number check
      if (/\d/.test(password)) strength++;
      // Special char check
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      // Update strength meter
      strengthBars.forEach((bar, index) => {
        bar.style.backgroundColor = index < strength ? getStrengthColor(strength) : '#e0e0e0';
      });
      
      // Update strength text
      const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
      strengthText.textContent = strengthLabels[strength - 1] || 'Very Weak';
      strengthText.style.color = getStrengthColor(strength);
    });
    
    function getStrengthColor(strength) {
      const colors = ['#ff4d4d', '#ff9933', '#ffcc00', '#66cc33', '#339900'];
      return colors[strength - 1] || '#ff4d4d';
    }
    
    // Form submission
    if (signupForm) {
      signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate password match
        if (password !== confirmPassword) {
          showError("Passwords don't match");
          return;
        }
        
        // Show loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;
        
        try {
          const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });
  
          if (response.ok) {
            const data = await response.json();
            
            // Show success message
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Account Created!';
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Redirect to login page
            window.location.href = "login.html";
          } else {
            const errorData = await response.json();
            showError(errorData.message || "Signup failed");
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
      signupForm.insertBefore(errorElement, signupForm.firstChild);
      
      // Scroll to error
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });