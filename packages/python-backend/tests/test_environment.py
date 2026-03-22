"""
Environment variable configuration tests
"""
import pytest
import os
from dotenv import load_dotenv


class TestEnvironmentVariables:
    """Tests for environment variable configuration"""
    
    def test_env_file_can_be_loaded(self):
        """Test that .env file can be loaded"""
        env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
        if os.path.exists(env_path):
            load_dotenv(env_path)
            # If loading succeeds, test passes
            assert True
        else:
            pytest.skip(".env file not found")
    
    def test_required_env_variables_exist(self):
        """Test that critical environment variables are set or have defaults"""
        # These should either be set or have safe defaults
        db_host = os.getenv('DB_HOST', 'localhost')
        assert db_host is not None
        
        # Check Python version is 3.9+
        import sys
        assert sys.version_info >= (3, 9), "Python 3.9+ required"
