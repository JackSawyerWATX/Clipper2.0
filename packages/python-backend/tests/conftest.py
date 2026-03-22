# Test fixtures and configuration for pytest
import pytest
import sys
from pathlib import Path
import os

# Add parent directory to path to import main
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set test database environment
os.environ['DB_HOST'] = os.environ.get('DB_HOST', 'localhost')
os.environ['DB_USER'] = os.environ.get('DB_USER', 'root')
os.environ['DB_PASSWORD'] = os.environ.get('DB_PASSWORD', '')
os.environ['DB_NAME'] = os.environ.get('DB_NAME', 'clipper_db')

client_fixture = None

try:
    from fastapi.testclient import TestClient
    from main import app
    client_fixture = TestClient(app)
except Exception as e:
    # If import fails due to DB connection, that's okay for some tests
    print(f"Note: Could not import FastAPI app: {e}")
    client_fixture = None

@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return client_fixture
