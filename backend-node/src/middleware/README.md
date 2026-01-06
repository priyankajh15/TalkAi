# Middleware

Express middleware for authentication, error handling, and request processing.

## Files

- `auth.middleware.js` - JWT token validation and user context
- `errorHandler.middleware.js` - Global error handling and logging
- `rateLimit.middleware.js` - Rate limiting for API endpoints
- `requestId.middleware.js` - Unique request ID generation
- `role.middleware.js` - Role-based access control

## Usage

```javascript
const auth = require('./middleware/auth.middleware');
const role = require('./middleware/role.middleware');

// Protected route with role check
router.post('/', auth, role('company_admin'), controller.create);
```

## Auth Flow

1. Extract Bearer token from Authorization header
2. Verify JWT signature and expiration
3. Add user context (userId, companyId, role) to req.user