// Sidebar functionality

// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const conversationsList = document.getElementById('conversations-list');
const newChatBtn = document.getElementById('new-chat-btn');
const mainContent = document.querySelector('.main-content');

// State
let conversations = [];
let activeSidebarConversationId = null;

// Initialize sidebar
async function initSidebar() {
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    newChatBtn.addEventListener('click', startNewConversation);
    
    // Butonun başlangıç pozisyonunu ayarla
    updateToggleButtonPosition();
    
    await loadConversations();
    
    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', handleResize);
    
    // İlk yüklemede ekran boyutunu kontrol et
    handleResize();
}

// Ekran boyutu değişimini kontrol et
function handleResize() {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('sidebar-collapsed');
        mainContent.style.marginLeft = '0';
        toggleSidebarBtn.style.left = '1rem';
    } else {
        sidebar.classList.remove('sidebar-collapsed');
        mainContent.style.marginLeft = '';
        updateToggleButtonPosition();
    }
}

// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('sidebar-collapsed');

    if (sidebar.classList.contains('sidebar-collapsed')) {
        mainContent.style.marginLeft = '0';
        toggleSidebarBtn.style.left = '1rem';
    } else {
        mainContent.style.marginLeft = '';

        // Tarayıcı bir sonraki çizim için hazır olduğunda çalıştır
        requestAnimationFrame(() => {
            updateToggleButtonPosition();
        });
    }
}


// Butonun pozisyonunu güncelle
function updateToggleButtonPosition() {
    if (!sidebar.classList.contains('sidebar-collapsed')) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const sidebarLeft = sidebarRect.left;
        const sidebarWidth = sidebarRect.width;

        // Sidebar'ın içinde sağdan 12px içeride olacak şekilde butonu konumlandır
        const buttonOffset = 52; // buton genişliği 40px + sağ boşluk 12px
        const leftPosition = sidebarLeft + sidebarWidth - buttonOffset;

        toggleSidebarBtn.style.left = `${leftPosition}px`;
    }
}


// Load conversations
async function loadConversations() {
    try {
        conversationsList.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        `;
        
        conversations = await getConversations();
        
        if (conversations.length === 0) {
            conversationsList.innerHTML = `
                <div class="empty-state">
                    <p>Henüz hiç sohbet yok.</p>
                    <p>Yeni bir sohbet başlatmak için "Yeni Sohbet" butonuna tıklayın.</p>
                </div>
            `;
            return;
        }
        
        renderConversations();
    } catch (error) {
        console.error('Error loading conversations:', error);
        conversationsList.innerHTML = `
            <div class="error-state">
                <p>Sohbetler yüklenirken bir hata oluştu.</p>
                <button class="btn btn-secondary" onclick="loadConversations()">Tekrar Dene</button>
            </div>
        `;
    }
}

// Render conversations
function renderConversations() {
    conversationsList.innerHTML = '';
    
    conversations.forEach(conversation => {
        const conversationItem = document.createElement('div');
        conversationItem.classList.add('conversation-item');
        
        if (conversation.id === activeSidebarConversationId) {
            conversationItem.classList.add('active');
        }
        
        conversationItem.innerHTML = `
            <div class="conversation-name">${conversation.name}</div>
            <div class="conversation-date">${conversation.date}</div>
            <div class="conversation-actions">
                <button class="btn btn-icon btn-secondary rename-btn" data-id="${conversation.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon btn-secondary delete-btn" data-id="${conversation.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        conversationItem.addEventListener('click', () => loadConversation(conversation.id));
        
        conversationsList.appendChild(conversationItem);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.rename-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            renameConversation(btn.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            confirmDeleteConversation(btn.dataset.id);
        });
    });
}

// Load conversation
async function loadConversation(conversationId) {
    try {
        // Set active conversation
        activeSidebarConversationId = conversationId;
        activeConversationId = conversationId;
        
        // Update sidebar UI
        renderConversations();
        
        // On mobile, close sidebar after selecting a conversation
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
        
        // Clear chat messages
        chatMessages.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        `;
        
        // Load conversation history
        const messages = await getConversationHistory(conversationId);
        
        // Clear chat messages again
        chatMessages.innerHTML = '';
        
        // Display messages
        messages.forEach(message => {
            const sender = message.is_user ? 'user' : 'bot';
            addMessageToChat(message.content, sender, message.time);
        });
        
        // Scroll to bottom
        scrollToBottom();
    } catch (error) {
        console.error('Error loading conversation:', error);
        chatMessages.innerHTML = `
            <div class="error-state">
                <p>Sohbet yüklenirken bir hata oluştu.</p>
                <button class="btn btn-secondary" onclick="loadConversation('${conversationId}')">Tekrar Dene</button>
            </div>
        `;
    }
}

// Start a new conversation
function startNewConversation() {
    // Clear active conversation
    activeSidebarConversationId = null;
    activeConversationId = null;
    
    // Update sidebar UI
    renderConversations();
    
    // Clear chat messages
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <h2>Ankara'yı Keşfedin!</h2>
            <p>Merhaba, ben size Ankara'daki gezilecek yerler, tarihi mekanlar, parklar, 
               müzeler ve daha fazlası hakkında bilgiler verebilirim. Ne öğrenmek istersiniz?</p>
        </div>
    `;
    
    // On mobile, close sidebar after starting a new conversation
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Rename conversation
async function renameConversation(conversationId) {
    const conversation = conversations.find(c => c.id == conversationId);
    if (!conversation) return;
    
    const newName = prompt('Sohbet adını değiştir:', conversation.name);
    if (!newName || newName === conversation.name) return;
    
    try {
        await updateConversation(conversationId, newName);
        
        // Update local state
        conversation.name = newName;
        
        // Update UI
        renderConversations();
    } catch (error) {
        console.error('Error renaming conversation:', error);
        alert('Sohbet adı değiştirilirken bir hata oluştu.');
    }
}

// Confirm delete conversation
function confirmDeleteConversation(conversationId) {
    if (confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
        deleteConversationById(conversationId);
    }
}

// Delete conversation
async function deleteConversationById(conversationId) {
    try {
        await deleteConversation(conversationId);
        
        // Update local state
        conversations = conversations.filter(c => c.id != conversationId);
        
        // If the deleted conversation was active, start a new conversation
        if (conversationId == activeSidebarConversationId) {
            startNewConversation();
        } else {
            // Just update UI
            renderConversations();
        }
    } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Sohbet silinirken bir hata oluştu.');
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initSidebar);