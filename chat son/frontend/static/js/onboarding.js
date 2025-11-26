// Onboarding Process for Required User Preferences

// DOM Elements
const onboardingModal = document.getElementById('onboarding-modal');
const onboardingSteps = document.querySelectorAll('.onboarding-step');
const prevStepBtn = document.getElementById('prev-step');
const nextStepBtn = document.getElementById('next-step');
const finishBtn = document.getElementById('finish-onboarding');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

// State
let currentStep = 1;
const totalSteps = onboardingSteps.length;
let onboardingComplete = false;
let onboardingPreferences = {
    budget: null,
    company: null,
    dress: null,
    mood: null,
    time: null,
    interests: []
};

// Events to handle before page unload if onboarding not complete
window.addEventListener('beforeunload', function(e) {
    if (!onboardingComplete && isOnboardingVisible()) {
        // Show a confirmation dialog
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// Initialize onboarding
function initOnboarding() {
    // Setup event listeners
    prevStepBtn.addEventListener('click', goToPreviousStep);
    nextStepBtn.addEventListener('click', goToNextStep);
    finishBtn.addEventListener('click', finishOnboarding);
    
    // Setup option cards in onboarding
    const onboardingOptionCards = document.querySelectorAll('.onboarding-step .option-card');
    onboardingOptionCards.forEach(card => {
        card.addEventListener('click', () => {
            const preference = card.dataset.preference;
            const value = card.dataset.value;
            
            // Remove selected class from siblings
            document.querySelectorAll(`.onboarding-step .option-card[data-preference="${preference}"]`).forEach(sibling => {
                sibling.classList.remove('selected');
            });
            
            // Add selected class to this card
            card.classList.add('selected');
            
            // Update preferences
            onboardingPreferences[preference] = value;
            
            // Enable next button if a selection was made
            if (currentStep < totalSteps) {
                nextStepBtn.disabled = false;
            } else {
                checkIfCanFinish();
            }
        });
    });
    
    // Setup interest tags in onboarding
    const onboardingInterestTags = document.querySelectorAll('.onboarding-step .interest-tag');
    onboardingInterestTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const interest = tag.dataset.interest;
            
            // Toggle selected class
            tag.classList.toggle('selected');
            
            // Update interests array
            if (tag.classList.contains('selected')) {
                if (!onboardingPreferences.interests.includes(interest)) {
                    onboardingPreferences.interests.push(interest);
                }
            } else {
                onboardingPreferences.interests = onboardingPreferences.interests.filter(i => i !== interest);
            }
            
            // Enable finish button if at least one interest is selected
            if (currentStep === totalSteps) {
                checkIfCanFinish();
            }
        });
    });
    
    // Check if we need to show the onboarding
    checkOnboardingStatus();
}

// Check if onboarding is required
function checkOnboardingStatus() {
    // Check if there are saved preferences in the database
    checkForExistingPreferences().then(hasPreferences => {
        if (!hasPreferences) {
            // Show onboarding if no preferences found
            showOnboarding();
        } else {
            // Mark onboarding as complete
            onboardingComplete = true;
        }
    });
}

// Check if user already has preferences in database
async function checkForExistingPreferences() {
    try {
        const response = await fetch('/api/user/preferences');
        
        if (response.ok) {
            const data = await response.json();
            
            // Check if we have actual preferences data
            return data && Object.keys(data).length > 0;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking for existing preferences:', error);
        return false;
    }
}

// Show the onboarding modal
function showOnboarding() {
    onboardingModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Initialize the first step
    updateStep(1);
    
    // Disable message input until onboarding is complete
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    if (userInput) userInput.disabled = true;
    if (sendButton) sendButton.disabled = true;
}

// Go to next step
function goToNextStep() {
    if (currentStep < totalSteps) {
        updateStep(currentStep + 1);
    }
}

// Go to previous step
function goToPreviousStep() {
    if (currentStep > 1) {
        updateStep(currentStep - 1);
    }
}

// Update the current step
function updateStep(stepNumber) {
    // Update state
    currentStep = stepNumber;
    
    // Hide all steps
    onboardingSteps.forEach(step => {
        step.classList.add('hidden');
    });
    
    // Show current step
    const currentStepElement = document.querySelector(`.onboarding-step[data-step="${currentStep}"]`);
    currentStepElement.classList.remove('hidden');
    
    // Update buttons
    prevStepBtn.disabled = currentStep === 1;
    
    if (currentStep === totalSteps) {
        nextStepBtn.classList.add('hidden');
        finishBtn.classList.remove('hidden');
        checkIfCanFinish();
    } else {
        nextStepBtn.classList.remove('hidden');
        finishBtn.classList.add('hidden');
        
        // Check if we can enable the next button
        const preferenceForCurrentStep = getPreferenceForStep(currentStep);
        nextStepBtn.disabled = !onboardingPreferences[preferenceForCurrentStep];
    }
    
    // Update progress
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `Adım ${currentStep}/${totalSteps}`;
}

// Get the preference key for the current step
function getPreferenceForStep(step) {
    switch (step) {
        case 1: return 'budget';
        case 2: return 'company';
        case 3: return 'dress';
        case 4: return 'mood';
        case 5: return 'time';
        case 6: return 'interests';
        default: return null;
    }
}

// Check if we can enable the finish button
function checkIfCanFinish() {
    // For the interests step, we need at least one interest selected
    if (currentStep === totalSteps) {
        finishBtn.disabled = onboardingPreferences.interests.length === 0;
    }
}

// Finish the onboarding process
async function finishOnboarding() {
    try {
        // Save to server
        const response = await fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(onboardingPreferences)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save preferences');
        }
        
        // Save to local storage as backup
        localStorage.setItem('userPreferences', JSON.stringify(onboardingPreferences));
        
        // Mark onboarding as complete
        onboardingComplete = true;
        
        // Hide onboarding modal - ÖNEMLİ: display none ile tamamen gizle
        onboardingModal.style.display = 'none'; // Bu şekilde modal tamamen kaldırılıyor
        document.body.style.overflow = ''; // Restore scrolling
        
        // Enable message input
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        
        if (userInput) {
            userInput.disabled = false;
            userInput.focus(); // Otomatik olarak input alanına odaklan
        }
        if (sendButton) sendButton.disabled = false;
        
        // Update user preferences in the preferences module
        if (typeof userPreferences !== 'undefined') {
            userPreferences = { ...onboardingPreferences };
            if (typeof updatePreferencesUI === 'function') {
                updatePreferencesUI();
            }
        }
        
        // Tercihlerden bir özet oluştur
        let preferenceSummary = createPreferenceSummary(onboardingPreferences);
        
        // Otomatik AI mesajı ile karşılama
        showWelcomeResponse(preferenceSummary);
        
    } catch (error) {
        console.error('Error saving preferences:', error);
        
        // Show error message
        const toast = document.createElement('div');
        toast.classList.add('toast', 'toast-error');
        toast.innerHTML = '<i class="fas fa-exclamation-circle"></i> Tercihleriniz kaydedilemedi! Lütfen tekrar deneyin.';
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

// Tercihlerden özet oluştur
function createPreferenceSummary(preferences) {
    const summary = [];
    
    if (preferences.budget) {
        const budgetMap = {
            'low': 'düşük bütçeli (0-500₺)',
            'medium': 'orta bütçeli (500-2000₺)',
            'high': 'yüksek bütçeli (2000₺+)'
        };
        summary.push(budgetMap[preferences.budget]);
    }
    
    if (preferences.company) {
        const companyMap = {
            'alone': 'yalnız',
            'family': 'ailenizle',
            'friends': 'arkadaşlarınızla',
            'partner': 'sevgilinizle'
        };
        summary.push(companyMap[preferences.company]);
    }
    
    if (preferences.time) {
        summary.push(`${preferences.time} saatlik`);
    }
    
    if (preferences.interests && preferences.interests.length > 0) {
        const interestMap = {
            'food': 'yeme-içme',
            'shopping': 'alışveriş',
            'nature': 'doğa',
            'sports': 'spor',
            'theater': 'tiyatro',
            'cinema': 'sinema',
            'concert': 'konser',
            'museum': 'müze',
            'comedy': 'komedi'
        };
        
        const interests = preferences.interests.map(i => interestMap[i] || i);
        if (interests.length === 1) {
            summary.push(`${interests[0]} odaklı`);
        } else if (interests.length === 2) {
            summary.push(`${interests[0]} ve ${interests[1]} içeren`);
        } else {
            const lastInterest = interests.pop();
            summary.push(`${interests.join(', ')} ve ${lastInterest} içeren`);
        }
    }
    
    return summary.join(', ') + ' bir Ankara gezi planı';
}

// Otomatik AI karşılama mesajı gönder
function showWelcomeResponse(preferenceSummary) {
    // Welcome mesajını kaldır
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Typing indicator göster
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.classList.remove('hidden');
    }
    
    // Scroll to bottom
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 1.5 saniye sonra yapay yanıt göster
    setTimeout(() => {
        // Typing indicator gizle
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
        
        // AI mesajını ekle
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'bot-message', 'new');
            
            const now = new Date();
            const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            messageDiv.innerHTML = `
                <div class="avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Tercihleriniz başarıyla kaydedildi! Şimdi sizin için ${preferenceSummary} önerebilirim. "Ankara'da gezilecek yerler öner" yazarak başlayabilir veya başka bir soru sorabilirsiniz.</p>
                    <span class="timestamp">${timeString}</span>
                </div>
            `;
            
            chatMessages.appendChild(messageDiv);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Play arrival animation
            setTimeout(() => {
                messageDiv.classList.remove('new');
            }, 1000);
        }
    }, 1500);
}

// Check if onboarding is visible
function isOnboardingVisible() {
    return !onboardingModal.classList.contains('hidden');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initOnboarding);