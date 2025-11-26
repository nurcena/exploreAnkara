import pyodbc
from flask import current_app

def get_db_connection():
    """Creates a connection to the MS SQL database."""
    conn = pyodbc.connect(current_app.config['DB_CONNECTION_STRING'])
    return conn