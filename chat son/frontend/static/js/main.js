// Main JavaScript for ChatBot functionality

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');
const themeToggle = document.querySelector('.theme-toggle');

// State
let activeConversationId = null;
let darkMode = localStorage.getItem('darkMode') === 'enabled';
let currentRouteData = null;

// Initialize the application
function init() {
    // Apply saved theme
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Setup event listeners
    messageForm.addEventListener('submit', handleSubmit);
    themeToggle.addEventListener('click', toggleTheme);

    // Update welcome message
    updateWelcomeMessage();

    // Temporarily disable message input until onboarding is complete
    checkUserPreferences();
}

// Check if user preferences exist - if not, input should be disabled
async function checkUserPreferences() {
    try {
        const response = await fetch('/api/user/preferences');

        if (response.ok) {
            const data = await response.json();

            if (!data || Object.keys(data).length === 0) {
                // Disable input until onboarding is completed
                if (userInput) userInput.disabled = true;
                if (sendButton) sendButton.disabled = true;
            }
        }
    } catch (error) {
        console.error('Error checking user preferences:', error);
    }
}

// Update welcome message with Ankara travel info
function updateWelcomeMessage() {
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `
            <h2>Ankara'yı Keşfedin! 🌟</h2>
            <p>Merhaba, ben kişisel Ankara Gezi Rehberinizim! 🗺️ Tercihlerinize göre özel gezi rotaları oluşturabilirim.</p>
            <ul>
                <li>🗺️ <strong>Kişiselleştirilmiş Rotalar</strong> - "Yarın Ankara'da ne yapmalıyım?" gibi sorular sorabilirsiniz.</li>
                <li>🍽️ <strong>Restoran Önerileri</strong> - "Ankara'da en iyi kebapçılar nerede?" diye sorabilirsiniz.</li>
                <li>🏛️ <strong>Turistik Yerler</strong> - "Ankara'da mutlaka görülmesi gereken yerler" diyebilirsiniz.</li>
                <li>🎭 <strong>Etkinlik Önerileri</strong> - "Bu hafta sonu Ankara'da hangi etkinlikler var?" diye sorabilirsiniz.</li>
                <li>⏱️ <strong>Zaman Kısıtlı Rotalar</strong> - "Ankara'da 3 saatte neler yapabilirim?" şeklinde sorabilirsiniz.</li>
            </ul>
            <p>Sağ üstteki ⚙️ ayarlar butonundan tercihlerinizi güncelleyerek daha kişiselleştirilmiş öneriler alabilirsiniz!</p>
            <p>Ne tür bir Ankara gezi rotası oluşturmamı istersiniz? 🤔</p>
        `;
    }
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Clear input
    userInput.value = '';

    // Add user message to chat
    addMessageToChat(message, 'user');

    // Show typing indicator
    showTypingIndicator();

    try {
        // Send message to API
        const response = await sendMessage(message, activeConversationId);

        // Hide typing indicator
        hideTypingIndicator();

        // Add bot response to chat
        addMessageToChat(response.response, 'bot');

        // Update conversation ID
        activeConversationId = response.conversation_id;

        // If this is a new conversation, refresh the sidebar
        if (!activeSidebarConversationId) {
            activeSidebarConversationId = activeConversationId;
            await loadConversations();
        }
    } catch (error) {
        console.error('Error sending message:', error);

        // Hide typing indicator
        hideTypingIndicator();

        // Add error message
        addMessageToChat('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.', 'bot');
    }
}

// Format message content for better display
function formatMessageContent(text) {
    // Rota formatını tespit et ve özel olarak formatla
    if (text.includes('Saat') || text.includes('saat') || text.includes(':00')) {
        return formatRouteMessage(text);
    }
    
    // Genel mesaj formatlaması
    let formattedText = text;
    
    // Başlıkları bold yap
    formattedText = formattedText.replace(/^(#+)\s+(.+)$/gm, '<strong>$2</strong>');
    
    // Listeler için düzgün formatla
    formattedText = formattedText.replace(/^[-*]\s+(.+)$/gm, '• $1');
    
    // Satır sonlarını düzgün işle
    formattedText = formattedText.split('\n').map(line => {
        if (line.trim()) {
            return `<p>${line}</p>`;
        }
        return '';
    }).join('');
    
    return formattedText;
}

// Format route messages specially
function formatRouteMessage(text) {
    const lines = text.split('\n');
    let formattedHtml = '';
    let routeItems = [];
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        // Saat formatını tespit et (örn: "10:00 - Anıtkabir")
        const timeMatch = line.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(.+)$/);
        if (timeMatch) {
            const [, time, location] = timeMatch;
            const details = extractLocationDetails(location);
            
            routeItems.push({
                time: time,
                name: details.name,
                address: details.address,
                description: details.description
            });
            
            formattedHtml += `
                <div class="route-suggestion">
                    <div class="route-time">🕐 ${time}</div>
                    <div class="route-location">${details.name}</div>
                    ${details.address ? `<div class="route-details">📍 ${details.address}</div>` : ''}
                    ${details.description ? `<div class="route-details">${details.description}</div>` : ''}
                </div>
            `;
        } else if (line.includes('Rota') || line.includes('rota') || line.includes('gezi')) {
            // Başlık satırı
            formattedHtml += `<p><strong>${line}</strong></p>`;
        } else {
            // Normal satır
            formattedHtml += `<p>${line}</p>`;
        }
    });
    
    // Eğer rota önerileri varsa harita butonu ekle
    if (routeItems.length > 0) {
        currentRouteData = routeItems;
        formattedHtml += `
            <button class="show-map-btn" onclick="showRouteOnMap()">
                <i class="fas fa-map-marked-alt"></i>
                Rotayı Haritada Göster
            </button>
        `;
    }
    
    return formattedHtml;
}

// Extract location details from text
function extractLocationDetails(text) {
    // Parantez içindeki adresi ayır
    const addressMatch = text.match(/\(([^)]+)\)/);
    let name = text;
    let address = '';
    let description = '';
    
    if (addressMatch) {
        address = addressMatch[1];
        name = text.replace(addressMatch[0], '').trim();
    }
    
    // Tire ile ayrılmış açıklamayı ayır
    const parts = name.split(' - ');
    if (parts.length > 1) {
        name = parts[0].trim();
        description = parts.slice(1).join(' - ').trim();
    }
    
    return { name, address, description };
}

// Show route on map
function showRouteOnMap() {
    if (!currentRouteData || currentRouteData.length === 0) {
        alert('Haritada gösterilecek rota bulunamadı!');
        return;
    }
    
    // Create map modal
    const mapModal = document.querySelector('.map-modal') || createMapModal();
    mapModal.classList.add('show');
    
    // Initialize map after modal is visible
    setTimeout(() => {
        initializeMap(currentRouteData);
    }, 100);
}

// Create map modal
function createMapModal() {
    const modal = document.createElement('div');
    modal.className = 'map-modal';
    modal.innerHTML = `
        <div class="map-container">
            <div class="map-header">
                <h3>Gezi Rotanız 🗺️</h3>
                <button class="close-map-btn" onclick="closeMapModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="route-map"></div>
            <div class="map-controls">
                <button class="map-control-btn" onclick="fitMapToRoute()" title="Tüm Rotayı Göster">
                    <i class="fas fa-compress-arrows-alt"></i>
                </button>
                <button class="map-control-btn" onclick="startNavigation()" title="Navigasyonu Başlat">
                    <i class="fas fa-route"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

// Close map modal
function closeMapModal() {
    const mapModal = document.querySelector('.map-modal');
    if (mapModal) {
        mapModal.classList.remove('show');
    }
}

// Initialize Google Maps
let map;
let markers = [];
let directionsService;
let directionsRenderer;

function initializeMap(routeData) {
    // Ankara'nın merkezi
    const ankaraCenter = { lat: 39.9334, lng: 32.8597 };
    
    // Harita oluştur
    map = new google.maps.Map(document.getElementById('route-map'), {
        center: ankaraCenter,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
    });
    
    // Directions servisleri
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: '#1e88e5',
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });
    
    // Her durak için marker ekle
    const bounds = new google.maps.LatLngBounds();
    const waypoints = [];
    
    routeData.forEach((stop, index) => {
        // Geocoding API kullanarak adresi koordinata çevir
        geocodeAddress(stop.name + ', Ankara', (location) => {
            if (location) {
                const marker = new google.maps.Marker({
                    position: location,
                    map: map,
                    title: stop.name,
                    label: {
                        text: (index + 1).toString(),
                        color: 'white',
                        fontWeight: 'bold'
                    },
                    animation: google.maps.Animation.DROP
                });
                
                // Info window ekle
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px;">
                            <h4 style="margin: 0 0 5px 0;">${stop.time} - ${stop.name}</h4>
                            ${stop.address ? `<p style="margin: 5px 0;">📍 ${stop.address}</p>` : ''}
                            ${stop.description ? `<p style="margin: 5px 0;">${stop.description}</p>` : ''}
                        </div>
                    `
                });
                
                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
                
                markers.push(marker);
                bounds.extend(location);
                
                // Waypoint olarak ekle (ilk ve son hariç)
                if (index > 0 && index < routeData.length - 1) {
                    waypoints.push({
                        location: location,
                        stopover: true
                    });
                }
                
                // Tüm markerlar eklendikten sonra rotayı çiz
                if (markers.length === routeData.length) {
                    // Haritayı tüm noktalara sığdır
                    map.fitBounds(bounds);
                    
                    // Rota çiz
                    if (routeData.length > 1) {
                        const origin = markers[0].getPosition();
                        const destination = markers[markers.length - 1].getPosition();
                        
                        directionsService.route({
                            origin: origin,
                            destination: destination,
                            waypoints: waypoints,
                            travelMode: google.maps.TravelMode.DRIVING,
                            optimizeWaypoints: false
                        }, (response, status) => {
                            if (status === 'OK') {
                                directionsRenderer.setDirections(response);
                            }
                        });
                    }
                }
            }
        });
    });
}

// Geocode address to coordinates
function geocodeAddress(address, callback) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            callback(results[0].geometry.location);
        } else {
            console.error('Geocode was not successful for the following reason: ' + status);
            callback(null);
        }
    });
}

// Fit map to show all route
function fitMapToRoute() {
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        map.fitBounds(bounds);
    }
}

// Start navigation (opens in Google Maps)
function startNavigation() {
    if (currentRouteData && currentRouteData.length > 0) {
        // Google Maps URL oluştur
        let mapsUrl = 'https://www.google.com/maps/dir/';
        
        currentRouteData.forEach((stop, index) => {
            const query = encodeURIComponent(stop.name + ', Ankara, Turkey');
            mapsUrl += query + '/';
        });
        
        // Yeni sekmede aç
        window.open(mapsUrl, '_blank');
    }
}

// Add a message to the chat
function addMessageToChat(text, sender, time = null) {
    // Remove welcome message if it exists
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    if (sender === 'bot') {
        messageDiv.classList.add('new');
    }

    // Use provided time or current time
    const now = new Date();
    const timeString = time || `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Format the content
    const formattedContent = sender === 'bot' ? formatMessageContent(text) : `<p>${text}</p>`;

    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">
                ${formattedContent}
                <span class="timestamp">${timeString}</span>
            </div>
            <div class="avatar user-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                ${formattedContent}
                <span class="timestamp">${timeString}</span>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();

    // Play arrival animation
    setTimeout(() => {
        messageDiv.classList.remove('new');
    }, 1000);
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Toggle dark/light theme
function toggleTheme() {
    darkMode = !darkMode;

    if (darkMode) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Add animation class
    themeToggle.classList.add('animate');

    // Remove animation class after animation completes
    setTimeout(() => {
        themeToggle.classList.remove('animate');
    }, 500);
}

// Make functions available globally
window.showRouteOnMap = showRouteOnMap;
window.closeMapModal = closeMapModal;
window.fitMapToRoute = fitMapToRoute;
window.startNavigation = startNavigation;

// Initialize the application
document.addEventListener('DOMContentLoaded', init);