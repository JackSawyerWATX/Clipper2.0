# Authentication Implementation

## Overview
This application now uses secure JWT-based authentication with bcrypt password hashing.

## Features Implemented

### Backend Security
- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: 24-hour expiration (configurable)
- **Protected Routes**: Middleware-based authentication
- **Role-Based Access Control**: Administrator, Manager, Employee, Viewer roles

### Authentication Endpoints

#### 1. Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123",
  "email": "john@example.com",
  "role": "Employee"  // Optional: defaults to Employee
}

Response:
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "Employee",
    "status": "Active",
    "permissions": []
  }
}
```

#### 3. Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>

Response:
{
  "valid": true,
  "user": { ... }
}
```

#### 4. Change Password
```
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### 5. Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logout successful",
  "note": "Please delete the token on the client side"
}
```

### Protected User Management Routes

All `/api/users/*` routes now require authentication:

- `GET /api/users` - List all users (Admin/Manager only)
- `GET /api/users/:id` - Get user details (Authenticated)
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin/Manager only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Frontend Integration

The frontend automatically:
- Stores JWT token in localStorage
- Includes token in all API requests
- Redirects to login on 401 errors
- Verifies token on app load
- Persists login across page refreshes

### Security Middleware

**Authentication Middleware** (`verifyToken`)
- Validates JWT token from Authorization header
- Adds user info to request object
- Returns 401 if token is missing or invalid

**Role-Based Middleware** (`checkRole`)
- Restricts access based on user role
- Returns 403 if user lacks required permissions

**Optional Auth** (`optionalAuth`)
- Adds user info if token exists but doesn't require it

## Usage Examples

### Making Authenticated Requests (Frontend)

```javascript
import { fetchWithAuth } from './utils/auth'

// GET request
const response = await fetchWithAuth('/api/customers')
const customers = await response.json()

// POST request
const response = await fetchWithAuth('/api/orders', {
  method: 'POST',
  body: JSON.stringify(orderData)
})
```

### Protecting Backend Routes

```javascript
const { verifyToken, checkRole } = require('../middleware/auth')

// Require authentication
router.get('/protected', verifyToken, (req, res) => {
  // req.user contains authenticated user info
  res.json({ user: req.user })
})

// Require specific role
router.delete('/admin-only', verifyToken, checkRole('Administrator'), (req, res) => {
  // Only administrators can access this
})

// Multiple roles allowed
router.get('/managers', verifyToken, checkRole('Administrator', 'Manager'), (req, res) => {
  // Admins and Managers can access
})
```

## User Roles

1. **Administrator**: Full system access
2. **Manager**: Can manage users and view all data
3. **Employee**: Standard access to business operations
4. **Viewer**: Read-only access

## Security Best Practices

### For Production
1. **Change JWT_SECRET**: Use a strong, random secret key
2. **Use HTTPS**: Always use secure connections in production
3. **Token Expiration**: Consider shorter expiration times for sensitive apps
4. **Password Requirements**: Minimum 8 characters (can be enhanced)
5. **Rate Limiting**: Add rate limiting to prevent brute force attacks

### Environment Variables
Ensure `.env` file contains:
```
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## Testing Authentication

### Create First User
Since all user routes now require authentication, you need to create the first admin user directly in the database:

```sql
-- Password: 'admin123' (hashed with bcrypt)
INSERT INTO users (username, password_hash, email, role, status, permissions)
VALUES (
  'admin',
  '$2b$10$rBV2kU.qhVErzqOTX0YJhODnOyF7rZQJ9sYqR3q3kGKGgJy7cqPt2',
  'admin@clipper.com',
  'Administrator',
  'Active',
  '[]'
);
```

Or hash a password using Node.js:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('your_password', 10).then(console.log);
```

### Test Login
1. Start the server: `cd server && npm start`
2. Open the frontend: `npm run dev`
3. Login with your credentials
4. Token will be stored automatically

## Troubleshooting

**401 Unauthorized**: Token is missing, expired, or invalid
- Check if token exists in localStorage
- Verify JWT_SECRET matches between requests
- Check token expiration

**403 Forbidden**: User lacks required permissions
- Check user's role in database
- Verify route's role requirements

**Token Not Persisting**: Clear localStorage and login again
```javascript
localStorage.clear()
```

## Files Created/Modified

### Created
- `server/middleware/auth.js` - Authentication middleware
- `server/routes/auth.js` - Authentication endpoints
- `src/utils/auth.js` - Frontend auth utilities

### Modified
- `server/routes/users.js` - Added password hashing and role checks
- `server/server.js` - Added auth routes
- `src/pages/Login.jsx` - Integrated real authentication
- `src/App.jsx` - Added token verification and persistence
- `.env` - Added JWT configuration
