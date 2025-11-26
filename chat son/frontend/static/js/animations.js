// Animation functions and effects

// Function to add ripple effect on button click
function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;
        
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${e.clientX - element.getBoundingClientRect().left - radius}px`;
        ripple.style.top = `${e.clientY - element.getBoundingClientRect().top - radius}px`;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// Add typing animation to bot messages
function addTypingAnimation(element, text, speed = 50) {
    const paragraph = element.querySelector('p');
    paragraph.textContent = '';
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            paragraph.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
            element.classList.remove('typing');
        }
    }, speed);
}

// Particle animation for the background
function initParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.classList.add('particles-container');
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        
        // Random size
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random animation duration
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to send button
    const sendButton = document.getElementById('send-button');
    if (sendButton) addRippleEffect(sendButton);
    
    // Add ripple effect to theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) addRippleEffect(themeToggle);
    
    // Add hover animations to features
    const features = document.querySelectorAll('.feature');
    features.forEach(feature => {
        feature.addEventListener('mouseenter', () => {
            const icon = feature.querySelector('i');
            icon.style.animationPlayState = 'paused';
            icon.classList.add('pulse');
            
            setTimeout(() => {
                icon.classList.remove('pulse');
                icon.style.animationPlayState = 'running';
            }, 1000);
        });
    });
});