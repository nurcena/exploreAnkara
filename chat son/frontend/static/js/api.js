// API interaction functions

/**
 * Send a message to the chat API
 * 
 * @param {string} message - User message
 * @param {string|null} conversationId - Conversation ID
 * @returns {Promise<Object>} - API response
 */
async function sendMessage(message, conversationId = null) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                conversation_id: conversationId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
}

/**
 * Get all conversations for the current user
 * 
 * @returns {Promise<Object[]>} - List of conversations
 */
async function getConversations() {
    try {
        const response = await fetch('/api/conversations');
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching conversations:', error);
        throw error;
    }
}

/**
 * Get conversation history
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object[]>} - List of messages
 */
async function getConversationHistory(conversationId) {
    try {
        const response = await fetch(`/api/conversation/${conversationId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        throw error;
    }
}

/**
 * Update conversation name
 * 
 * @param {string} conversationId - Conversation ID
 * @param {string} name - New conversation name
 * @returns {Promise<Object>} - API response
 */
async function updateConversation(conversationId, name) {
    try {
        const response = await fetch(`/api/conversation/${conversationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating conversation:', error);
        throw error;
    }
}

/**
 * Delete conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} - API response
 */
async function deleteConversation(conversationId) {
    try {
        const response = await fetch(`/api/conversation/${conversationId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
    }
}