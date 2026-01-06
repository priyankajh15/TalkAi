# Routes

API route definitions with middleware and controller bindings.

## Files

- `auth.routes.js` - Authentication endpoints (signup, login)
- `knowledge.routes.js` - Knowledge base CRUD operations
- `protected.routes.js` - Protected user profile endpoints
- `health.routes.js` - Application health check

## Route Structure

```
/api/v1/auth
├── POST /signup - User registration
└── POST /login - User authentication

/api/v1/knowledge
├── POST / - Create knowledge item
├── GET / - List knowledge items
├── PUT /:id - Update knowledge item
└── DELETE /:id - Delete knowledge item

/api/v1/protected
└── GET /me - Get user profile

/health
└── GET / - Health status
```

All routes except auth and health require JWT authentication.