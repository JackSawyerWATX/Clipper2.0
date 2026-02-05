# Quick Start Guide - Authentication Setup

## Prerequisites
- Node.js installed
- MySQL server running
- Database schema created

## Step 1: Install Dependencies
Make sure all dependencies are installed (bcrypt and jsonwebtoken are already in package.json):

```bash
cd server
npm install
```

## Step 2: Configure Environment
Make sure your `.env` file has the JWT configuration:

```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

## Step 3: Create First Admin User
You need at least one admin user to access the system:

```bash
cd server
npm run create-admin
```

Follow the prompts to create your admin account:
- Username: (your choice)
- Email: (your email)
- Password: (min 8 characters)

## Step 4: Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

## Step 5: Start the Frontend
In a new terminal:
```bash
cd ..
npm run dev
```

## Step 6: Login
1. Open your browser to the frontend URL (usually http://localhost:5173)
2. Use the credentials you created in Step 3
3. You're now logged in with full admin access!

## What's Been Implemented

### Backend ✓
- Password hashing with bcrypt
- JWT token generation and verification
- Authentication middleware
- Role-based access control
- Login, signup, logout, and password change endpoints
- Protected user management routes

### Frontend ✓
- Real authentication (no more mock login)
- Token storage in localStorage
- Automatic token verification on app load
- Token included in all API requests
- Auto-redirect to login on 401 errors
- Persistent login across page refreshes

## Next Steps

### Test the Authentication
1. **Login**: Test with your admin credentials
2. **Token Persistence**: Refresh the page - you should stay logged in
3. **Logout**: Click logout (when you implement the logout button)
4. **Create Users**: Use the Admin page to create additional users
5. **Role Testing**: Try logging in with different role users

### Recommended Enhancements
1. **Add Logout Button**: Update the UI to include a logout button
2. **Password Reset**: Implement forgot password functionality
3. **Rate Limiting**: Add rate limiting to prevent brute force attacks
4. **Token Refresh**: Implement refresh tokens for better security
5. **Session Management**: Track active sessions
6. **Two-Factor Authentication**: Add 2FA for enhanced security

## Troubleshooting

### Can't Create Admin User
**Error**: "Cannot connect to database"
- Make sure MySQL is running
- Check your .env database credentials
- Verify the database exists

### Login Not Working
**Error**: "Invalid username or password"
- Verify user was created successfully
- Check username/password spelling
- Look at server logs for detailed error

**Error**: "Failed to fetch" or CORS error
- Make sure backend server is running on port 5000
- Check CORS configuration in server.js

### Token Issues
**Problem**: Keep getting logged out
- Check JWT_SECRET is consistent in .env
- Verify token expiration time (JWT_EXPIRES_IN)
- Clear browser localStorage and login again

**Problem**: 401 Unauthorized on API requests
- Token might be expired
- Check Authorization header is being sent
- Verify token format: "Bearer <token>"

## Security Reminders

⚠️ **Before Production**:
1. Change JWT_SECRET to a strong random key
2. Use HTTPS only
3. Consider shorter token expiration
4. Implement rate limiting
5. Add input validation and sanitization
6. Enable security headers (helmet.js)
7. Set up proper logging and monitoring

## API Testing with Postman/curl

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### Access Protected Route
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Support
If you encounter issues, check:
1. Server logs in the terminal
2. Browser console for frontend errors
3. Network tab to see API requests/responses
4. AUTH_README.md for detailed documentation
