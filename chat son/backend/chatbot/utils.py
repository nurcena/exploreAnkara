import re
import time

def sanitize_input(text):
    """
    Sanitize the input text to prevent injection attacks.
    
    Args:
        text: Input text to sanitize
        
    Returns:
        Sanitized text
    """
    # Remove any potential script tags
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL)
    
    # Remove other potentially dangerous HTML tags
    text = re.sub(r'<.*?>', '', text)
    
    return text

def calculate_response_time(start_time):
    """
    Calculate the response time in milliseconds.
    
    Args:
        start_time: Start time in seconds
        
    Returns:
        Response time in milliseconds
    """
    return round((time.time() - start_time) * 1000)