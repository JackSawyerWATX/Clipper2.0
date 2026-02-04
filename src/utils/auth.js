const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get authentication token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get user data from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Make authenticated API request
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized, clear auth data
  if (response.status === 401) {
    clearAuth();
    window.location.href = '/'; // Redirect to login
  }

  return response;
};

// Verify token is valid
export const verifyToken = async () => {
  const token = getToken();
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetchWithAuth('/api/auth/verify');
    
    if (!response.ok) {
      clearAuth();
      return false;
    }

    const data = await response.json();
    
    // Update user data in localStorage
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data.valid;
  } catch (error) {
    console.error('Token verification failed:', error);
    clearAuth();
    return false;
  }
};

// Check if user has required role
export const hasRole = (requiredRoles) => {
  const user = getUser();
  
  if (!user || !user.role) {
    return false;
  }

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }

  return user.role === requiredRoles;
};

export default {
  API_URL,
  getToken,
  getUser,
  clearAuth,
  fetchWithAuth,
  verifyToken,
  hasRole,
};
