from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from chatbot.services import ChatbotService
from models.db import get_db_connection
from models.user import User
import logging
import datetime


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint
chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/api')

# Initialize chatbot service
chatbot_service = ChatbotService()

@chatbot_bp.route('/chat', methods=['POST'])
@login_required
def chat():
    """
    Chat endpoint that processes user messages and returns AI responses.
    
    Expected JSON payload:
    {
        "message": "User message here",
        "conversation_id": "optional-conversation-id"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        conversation_id = data.get('conversation_id')
        
        # Log incoming message
        logger.info(f"Received message: {user_message[:50]}{'...' if len(user_message) > 50 else ''}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create a new conversation if none exists
        if not conversation_id:
            cursor.execute(
                "INSERT INTO Conversations (UserID, ConversationName, StartDate, LastUpdateDate) VALUES (?, ?, GETDATE(), GETDATE())",
                (current_user.id, "Ankara Gezi Sohbeti")
            )
            conn.commit()
            cursor.execute("SELECT @@IDENTITY AS ID")
            conversation_id = cursor.fetchone()[0]
        else:
            # Update last update date for the conversation
            cursor.execute(
                "UPDATE Conversations SET LastUpdateDate = GETDATE() WHERE ConversationID = ? AND UserID = ?",
                (conversation_id, current_user.id)
            )
            conn.commit()
        
        # Store user message
        cursor.execute(
            "INSERT INTO Messages (ConversationID, UserID, IsUserMessage, MessageContent) VALUES (?, ?, 1, ?)",
            (conversation_id, current_user.id, user_message)
        )
        conn.commit()
        
        # Process message with chatbot service
        response = chatbot_service.process_message(user_message, str(conversation_id))
        
        # Store bot response
        cursor.execute(
            "INSERT INTO Messages (ConversationID, UserID, IsUserMessage, MessageContent) VALUES (?, ?, 0, ?)",
            (conversation_id, current_user.id, response)
        )
        conn.commit()
        
        cursor.close()
        conn.close()
        
        # Return response
        return jsonify({
            'response': response,
            'conversation_id': conversation_id
        })
        
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({'error': 'An error occurred processing your request'}), 500

@chatbot_bp.route('/conversation/<int:conversation_id>', methods=['GET'])
@login_required
def get_conversation_history(conversation_id):
    """Get the messages for a specific conversation."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if conversation belongs to user
        cursor.execute(
            "SELECT * FROM Conversations WHERE ConversationID = ? AND UserID = ?",
            (conversation_id, current_user.id)
        )
        
        if not cursor.fetchone():
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Get messages
        cursor.execute(
            """
            SELECT MessageID, IsUserMessage, MessageContent, SentDate 
            FROM Messages 
            WHERE ConversationID = ? 
            ORDER BY SentDate ASC
            """,
            (conversation_id,)
        )
        
        messages = []
        for row in cursor.fetchall():
            messages.append({
                'id': row.MessageID,
                'is_user': bool(row.IsUserMessage),
                'content': row.MessageContent,
                'time': row.SentDate.strftime('%H:%M')
            })
        
        cursor.close()
        conn.close()
        
        return jsonify(messages)
        
    except Exception as e:
        logger.error(f"Error getting conversation history: {str(e)}")
        return jsonify({'error': 'An error occurred getting the conversation history'}), 500

@chatbot_bp.route('/conversation/<int:conversation_id>', methods=['PUT'])
@login_required
def update_conversation(conversation_id):
    """Update conversation name."""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({'error': 'Conversation name is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if conversation belongs to user
        cursor.execute(
            "SELECT * FROM Conversations WHERE ConversationID = ? AND UserID = ?",
            (conversation_id, current_user.id)
        )
        
        if not cursor.fetchone():
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Update conversation name
        cursor.execute(
            "UPDATE Conversations SET ConversationName = ? WHERE ConversationID = ?",
            (data['name'], conversation_id)
        )
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error updating conversation: {str(e)}")
        return jsonify({'error': 'An error occurred updating the conversation'}), 500

@chatbot_bp.route('/conversation/<int:conversation_id>', methods=['DELETE'])
@login_required
def delete_conversation(conversation_id):
    """Delete a conversation and its messages."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if conversation belongs to user
        cursor.execute(
            "SELECT * FROM Conversations WHERE ConversationID = ? AND UserID = ?",
            (conversation_id, current_user.id)
        )
        
        if not cursor.fetchone():
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Delete messages first (foreign key constraint)
        cursor.execute(
            "DELETE FROM Messages WHERE ConversationID = ?",
            (conversation_id,)
        )
        
        # Delete conversation
        cursor.execute(
            "DELETE FROM Conversations WHERE ConversationID = ?",
            (conversation_id,)
        )
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        return jsonify({'error': 'An error occurred deleting the conversation'}), 500