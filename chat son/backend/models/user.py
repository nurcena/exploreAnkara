from flask_login import UserMixin

class User(UserMixin):
    """User model for Flask-Login."""
    
    def __init__(self, id, username, email, password_hash):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash