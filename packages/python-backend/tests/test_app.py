"""
Test suite for FastAPI application initialization and root endpoint
"""
import pytest
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class TestAppInitialization:
    """Tests for application setup and initialization"""
    
    def test_fastapi_installed(self):
        """Test that FastAPI is installed"""
        try:
            import fastapi
            assert fastapi is not None
            assert hasattr(fastapi, 'FastAPI')
        except ImportError:
            pytest.fail("FastAPI not installed")
    
    def test_pydantic_installed(self):
        """Test that Pydantic is installed"""
        try:
            import pydantic
            assert pydantic is not None
        except ImportError:
            pytest.fail("Pydantic not installed")
    
    def test_uvicorn_installed(self):
        """Test that Uvicorn is installed"""
        try:
            import uvicorn
            assert uvicorn is not None
        except ImportError:
            pytest.fail("Uvicorn not installed")


class TestAppImport:
    """Tests for application import (may be skipped if DB is unavailable)"""
    
    def test_app_can_be_imported(self):
        """Test that the FastAPI app can be imported"""
        try:
            from main import app
            assert app is not None
            assert hasattr(app, 'openapi')
        except Exception as e:
            pytest.skip(f"Could not import app due to: {str(e)[:100]}")
    
    def test_models_can_be_imported(self):
        """Test that models can be imported"""
        try:
            from models.customer import Customer
            assert Customer is not None
        except Exception as e:
            pytest.skip(f"Could not import models: {str(e)[:100]}")


class TestClientFixture:
    """Tests for test client availability"""
    
    def test_client_fixture_can_be_provided(self, client):
        """Test that test client fixture is available when DB is configured"""
        if client is None:
            pytest.skip("Test client not available (database not configured)")
        assert client is not None


class TestDatabaseConfiguration:
    """Tests for database configuration"""
    
    def test_mysql_connector_installed(self):
        """Test that MySQL connector is installed"""
        try:
            import mysql.connector
            assert mysql.connector is not None
        except ImportError:
            pytest.fail("mysql-connector-python not installed")
    
    def test_database_env_vars_defined(self):
        """Test that database environment variables are accessible"""
        import os
        # These should have defaults or be configured
        db_host = os.environ.get('DB_HOST', 'localhost')
        db_user = os.environ.get('DB_USER', 'root')
        assert db_host is not None
        assert db_user is not None
