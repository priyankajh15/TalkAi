# Authentication System

JWT-based authentication system with role-based access control.

## Overview

- **JWT tokens** for stateless authentication
- **Company-scoped** user accounts
- **Role-based** access control
- **7-day** token expiration

---

## Authentication Flow

### 1. User Signup

```
POST /api/v1/auth/signup
├── Validate input (Joi schema)
├── Check email uniqueness
├── Start MongoDB transaction
├── Create Company document
├── Hash password (bcrypt, 10 rounds)
├── Create CompanyUser document
├── Commit transaction
└── Return company and user IDs
```

### 2. User Login

```
POST /api/v1/auth/login
├── Validate input
├── Find user by email
├── Compare password (bcrypt)
├── Generate JWT token
└── Return token
```

### 3. Protected Request

```
Request with Authorization header
├── Extract Bearer token
├── Verify JWT signature
├── Check token expiration
├── Add user context to req.user
└── Continue to route handler
```

---

## JWT Token Structure

**Payload:**
```json
{
  "userId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d0", 
  "role": "company_admin",
  "iat": 1694000000,
  "exp": 1694604800
}
```

**Configuration:**
- **Algorithm:** HS256
- **Secret:** `process.env.JWT_SECRET`
- **Expiration:** 7 days

---

## Middleware Stack

### auth.middleware.js

**Purpose:** Validate JWT tokens and set user context

**Process:**
1. Extract `Authorization: Bearer <token>` header
2. Verify JWT signature and expiration
3. Add decoded payload to `req.user`
4. Continue to next middleware

**Usage:**
```javascript
router.get('/protected', auth, controller.handler);
```

### role.middleware.js

**Purpose:** Enforce role-based access control

**Current Roles:**
- `company_admin` - Full access to company resources

**Usage:**
```javascript
router.post('/admin-only', auth, role('company_admin'), controller.handler);
```

---

## Password Security

**Hashing:**
- **Algorithm:** bcrypt
- **Rounds:** 10
- **Validation:** Uppercase, lowercase, number, special character, min 8 chars

**Password Requirements:**
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]
```

---

## Multi-Tenant Security

**Company Isolation:**
- All API operations scoped to `req.user.companyId`
- Database queries include `companyId` filter
- Users can only access their company's data

**Example Query:**
```javascript
// Automatic company scoping
const items = await KnowledgeBase.find({
  companyId: req.user.companyId,
  isActive: true
});
```

---

## Error Handling

**401 Unauthorized:**
- Missing Authorization header
- Invalid token format
- Expired token
- Invalid signature

**403 Forbidden:**
- Insufficient role permissions
- Account disabled

**Example Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## Security Headers

**Required Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**CORS Configuration:**
- Origin validation from `CORS_ORIGINS` env var
- Credentials support enabled
- Allowed methods: GET, POST, PUT, DELETE