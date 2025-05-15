// Function to include HTML components
async function includeHTML() {
    // Include navbar
    const navbarPlaceholder = document.querySelector('header[include-navbar]');
    if (navbarPlaceholder) {
      try {
        const response = await fetch('navbar.html');
        const html = await response.text();
        navbarPlaceholder.outerHTML = html;
      } catch (error) {
        console.error('Error loading navbar:', error);
      }
    }
  
    // Include footer
    const footerPlaceholder = document.querySelector('footer[include-footer]');
    if (footerPlaceholder) {
      try {
        const response = await fetch('footer.html');
        const html = await response.text();
        footerPlaceholder.outerHTML = html;
      } catch (error) {
        console.error('Error loading footer:', error);
      }
    }
  
    // Initialize any scripts that need to run after includes
    initAfterIncludes();
  }
  
  // Function to initialize scripts after includes are loaded
  function initAfterIncludes() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function() {
        navLinks.classList.toggle('active');
      });
    }
  
    // Highlight current page in navbar
    const currentPage = location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  
    // Newsletter form handling
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        console.log('Subscribed with email:', email);
        alert('Thank you for subscribing!');
        this.reset();
      });
    }
  }
  
  // Call includeHTML when DOM is loaded
  document.addEventListener('DOMContentLoaded', includeHTML);