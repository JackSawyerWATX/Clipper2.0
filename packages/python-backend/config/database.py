"""
Database configuration and connection pool for MySQL
"""
import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from parent directory
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'clipper_db'),
    'port': int(os.getenv('DB_PORT', 3306)),
}

# Create connection pool
connection_pool = pooling.MySQLConnectionPool(
    pool_name="clipper_pool",
    pool_size=10,
    pool_reset_session=True,
    **DB_CONFIG
)

def get_db_connection():
    """
    Get a database connection from the pool
    """
    try:
        connection = connection_pool.get_connection()
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        raise

def test_connection():
    """
    Test the database connection
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        cursor.close()
        connection.close()
        print("✅ MySQL Database connected successfully")
        return True
    except Exception as e:
        print(f"❌ MySQL Database connection failed: {str(e)}")
        return False
