from flask import Flask, redirect, url_for, render_template, request, flash, jsonify
from flask_login import LoginManager, login_required, current_user, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
import pyodbc
from config import Config
from chatbot.routes import chatbot_bp
from models.user import User
from models.db import get_db_connection

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__, static_folder='../frontend/static', template_folder='../frontend/templates')
    app.config.from_object(config_class)
    
    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    
    @login_manager.user_loader
    def load_user(user_id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE UserID = ?", (user_id,))
        user_data = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user_data:
            return User(
                id=user_data.UserID,
                username=user_data.Username,
                email=user_data.Email,
                password_hash=user_data.PasswordHash
            )
        return None
    
    # Register blueprints
    app.register_blueprint(chatbot_bp)
    
    # Routes
    @app.route('/')
    def index():
        if current_user.is_authenticated:
            return render_template('index.html')
        return redirect(url_for('login'))
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for('index'))
            
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Users WHERE Username = ?", (username,))
            user_data = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if user_data and check_password_hash(user_data.PasswordHash, password):
                user = User(
                    id=user_data.UserID,
                    username=user_data.Username,
                    email=user_data.Email,
                    password_hash=user_data.PasswordHash
                )
                login_user(user)
                
                # Update last login date
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("UPDATE Users SET LastLoginDate = GETDATE() WHERE UserID = ?", (user.id,))
                conn.commit()
                cursor.close()
                conn.close()
                
                return redirect(url_for('index'))
            
            flash('Geçersiz kullanıcı adı veya şifre')
        
        return render_template('login.html')
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if current_user.is_authenticated:
            return redirect(url_for('index'))
            
        if request.method == 'POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            
            # Check if username or email already exists
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Users WHERE Username = ? OR Email = ?", (username, email))
            existing_user = cursor.fetchone()
            
            if existing_user:
                flash('Kullanıcı adı veya email zaten kullanılıyor')
                cursor.close()
                conn.close()
                return render_template('register.html')
            
            # Create new user
            hashed_password = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO Users (Username, Email, PasswordHash) VALUES (?, ?, ?)",
                (username, email, hashed_password)
            )
            conn.commit()
            cursor.close()
            conn.close()
            
            flash('Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.')
            return redirect(url_for('login'))
        
        return render_template('register.html')
    
    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        return redirect(url_for('login'))
    
    @app.route('/api/conversations')
    @login_required
    def get_conversations():
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ConversationID, ConversationName, StartDate, LastUpdateDate 
            FROM Conversations 
            WHERE UserID = ? 
            ORDER BY LastUpdateDate DESC
        """, (current_user.id,))
        
        conversations = []
        for row in cursor.fetchall():
            conversations.append({
                'id': row.ConversationID,
                'name': row.ConversationName,
                'date': row.StartDate.strftime('%Y-%m-%d %H:%M')
            })
        
        cursor.close()
        conn.close()
        return jsonify(conversations)
    @app.route('/api/user/preferences', methods=['GET', 'POST'])
    @login_required
    def user_preferences():
        """Handle user preferences."""
        if request.method == 'GET':
            # Get preferences from database
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT Budget, Company, Dress, Mood, TimePreference, Interests FROM UserPreferences WHERE UserID = ?",
                (current_user.id,)
            )
            
            preferences = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if preferences:
                # Convert interests string to list
                interests = preferences.Interests.split(',') if preferences.Interests else []
                
                return jsonify({
                    'budget': preferences.Budget,
                    'company': preferences.Company,
                    'dress': preferences.Dress,
                    'mood': preferences.Mood,
                    'time': preferences.TimePreference,
                    'interests': interests
                })
            
            return jsonify({})
        
        elif request.method == 'POST':
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            # Extract preferences
            budget = data.get('budget')
            company = data.get('company')
            dress = data.get('dress')
            mood = data.get('mood')
            time_preference = data.get('time')
            interests = ','.join(data.get('interests', []))
            
            # Save to database
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if user already has preferences
            cursor.execute(
                "SELECT COUNT(*) AS count FROM UserPreferences WHERE UserID = ?",
                (current_user.id,)
            )
            count = cursor.fetchone().count
            
            if count > 0:
                # Update existing preferences
                cursor.execute(
                    """
                    UPDATE UserPreferences 
                    SET Budget = ?, Company = ?, Dress = ?, Mood = ?, TimePreference = ?, 
                    Interests = ?, UpdatedDate = GETDATE() 
                    WHERE UserID = ?
                    """,
                    (budget, company, dress, mood, time_preference, interests, current_user.id)
                )
            else:
                # Insert new preferences
                cursor.execute(
                    """
                    INSERT INTO UserPreferences 
                    (UserID, Budget, Company, Dress, Mood, TimePreference, Interests)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (current_user.id, budget, company, dress, mood, time_preference, interests)
                )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return jsonify({'success': True})
    return app
    
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])