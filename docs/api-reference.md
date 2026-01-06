# API Reference

Complete API documentation for TalkAi backend endpoints.

## Base URL
```
http://localhost:3000
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### POST /api/v1/auth/signup

Create new company and admin user.

**Request:**
```json
{
  "companyName": "Acme Corp",
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signup successful",
  "companyId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

**Validation Rules:**
- `companyName`: 2-100 characters, required
- `email`: Valid email format, required
- `password`: Min 8 chars, must contain uppercase, lowercase, number, special character

### POST /api/v1/auth/login

Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Knowledge Base Endpoints

### POST /api/v1/knowledge
*Requires: Authentication, company_admin role*

Create knowledge base item.

**Request:**
```json
{
  "title": "Product FAQ",
  "content": "Frequently asked questions about our product...",
  "category": "support"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "companyId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Product FAQ",
    "content": "Frequently asked questions...",
    "category": "support",
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  }
}
```

### GET /api/v1/knowledge
*Requires: Authentication*

List knowledge base items with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in title and content

**Example:** `/api/v1/knowledge?page=1&limit=5&search=product`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "title": "Product FAQ",
      "content": "Frequently asked questions...",
      "category": "support",
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "pages": 1
  }
}
```

### PUT /api/v1/knowledge/:id
*Requires: Authentication, company_admin role*

Update knowledge base item.

**Request:**
```json
{
  "title": "Updated Product FAQ",
  "content": "Updated content...",
  "category": "help"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "title": "Updated Product FAQ",
    "content": "Updated content...",
    "category": "help",
    "updatedAt": "2023-09-06T11:00:00.000Z"
  }
}
```

### DELETE /api/v1/knowledge/:id
*Requires: Authentication, company_admin role*

Soft delete knowledge base item.

**Response (200):**
```json
{
  "success": true,
  "message": "Knowledge item deleted"
}
```

---

## Protected Endpoints

### GET /api/v1/protected/me
*Requires: Authentication*

Get current user profile.

**Response (200):**
```json
{
  "message": "Access granted",
  "user": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "companyId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "role": "company_admin"
  }
}
```

---

## Health Check

### GET /health

Check application and database health.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2023-09-06T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Knowledge item not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later.",
  "requestId": "req_123456789"
}
```