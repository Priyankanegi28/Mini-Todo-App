document.getElementById('logout-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Show loading state
    const form = this;
    form.innerHTML = `
        <div class="loading-animation">
            <div class="spinner"></div>
            <p>Logging out...</p>
        </div>
    `;
    
    // Clear user data with delay for better UX
    setTimeout(() => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('rememberedUser');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }, 1000);
});