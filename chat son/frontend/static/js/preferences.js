// User Preferences Management

// DOM Elements
const preferencesModal = document.getElementById('preferences-modal');
const openPreferencesBtn = document.getElementById('open-preferences-modal');
const closePreferencesBtn = document.getElementById('close-preferences-modal');
const savePreferencesBtn = document.getElementById('save-preferences');
const resetPreferencesBtn = document.getElementById('reset-preferences');
const optionCards = document.querySelectorAll('#preferences-modal .option-card');
const interestTags = document.querySelectorAll('#preferences-modal .interest-tag');

// State
let userPreferences = {
    budget: null,
    company: null,
    dress: null,
    mood: null,
    time: null,
    interests: []
};

// Initialize preferences
function initPreferences() {
    // Setup event listeners
    openPreferencesBtn.addEventListener('click', openPreferencesModal);
    closePreferencesBtn.addEventListener('click', closePreferencesModal);
    savePreferencesBtn.addEventListener('click', savePreferences);
    resetPreferencesBtn.addEventListener('click', resetPreferences);
    
    // Option cards (single selection per category)
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const preference = card.dataset.preference;
            const value = card.dataset.value;
            
            // Remove selected class from siblings
            document.querySelectorAll(`#preferences-modal .option-card[data-preference="${preference}"]`).forEach(sibling => {
                sibling.classList.remove('selected');
            });
            
            // Add selected class to this card
            card.classList.add('selected');
            
            // Update preferences
            userPreferences[preference] = value;
        });
    });
    
    // Interest tags (multiple selection)
    interestTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const interest = tag.dataset.interest;
            
            // Toggle selected class
            tag.classList.toggle('selected');
            
            // Update interests array
            if (tag.classList.contains('selected')) {
                if (!userPreferences.interests.includes(interest)) {
                    userPreferences.interests.push(interest);
                }
            } else {
                userPreferences.interests = userPreferences.interests.filter(i => i !== interest);
            }
        });
    });
    
    // Load saved preferences
    loadPreferences();
}

// Open preferences modal
function openPreferencesModal() {
    preferencesModal.classList.remove('modal-hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close preferences modal
function closePreferencesModal() {
    preferencesModal.classList.add('modal-hidden');
    document.body.style.overflow = ''; // Restore scrolling
}

// Save preferences
async function savePreferences() {
    try {
        // Save to server
        const response = await fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userPreferences)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save preferences');
        }
        
        // Save to local storage as backup
        localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
        
        // Close modal
        closePreferencesModal();
        
        // Show success message
        const toast = document.createElement('div');
        toast.classList.add('toast', 'toast-success');
        toast.innerHTML = '<i class="fas fa-check-circle"></i> Tercihleriniz kaydedildi! Şimdi "Ankara\'da gezilecek yerler öner" diyebilirsiniz.';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
        
    } catch (error) {
        console.error('Error saving preferences:', error);
        
        // Show error message
        const toast = document.createElement('div');
        toast.classList.add('toast', 'toast-error');
        toast.innerHTML = '<i class="fas fa-exclamation-circle"></i> Tercihleriniz kaydedilemedi!';
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
    }
}

// Reset preferences
function resetPreferences() {
    // Clear all selections
    optionCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    interestTags.forEach(tag => {
        tag.classList.remove('selected');
    });
    
    // Reset preferences object
    userPreferences = {
        budget: null,
        company: null,
        dress: null,
        mood: null,
        time: null,
        interests: []
    };
}

// Load preferences
async function loadPreferences() {
    try {
        // Try to load from server
        const response = await fetch('/api/user/preferences');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data && Object.keys(data).length > 0) {
                userPreferences = data;
                
                // Update UI to match loaded preferences
                updatePreferencesUI();
                return;
            }
        }
        
        // Fallback to local storage if server fails
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            userPreferences = JSON.parse(savedPreferences);
            
            // Update UI to match loaded preferences
            updatePreferencesUI();
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Update UI based on loaded preferences
function updatePreferencesUI() {
    // Single selection preferences
    for (const [key, value] of Object.entries(userPreferences)) {
        if (key !== 'interests' && value) {
            const card = document.querySelector(`#preferences-modal .option-card[data-preference="${key}"][data-value="${value}"]`);
            if (card) {
                card.classList.add('selected');
            }
        }
    }
    
    // Interests (multiple selection)
    if (userPreferences.interests && userPreferences.interests.length > 0) {
        userPreferences.interests.forEach(interest => {
            const tag = document.querySelector(`#preferences-modal .interest-tag[data-interest="${interest}"]`);
            if (tag) {
                tag.classList.add('selected');
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPreferences);