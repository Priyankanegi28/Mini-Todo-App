document.getElementById('logout-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    localStorage.removeItem('user');
    
    console.log("User data cleared from localStorage");
    
    window.location.href = 'login.html';
});
