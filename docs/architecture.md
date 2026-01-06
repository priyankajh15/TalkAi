# System Architecture

TalkAi backend system architecture and component overview.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   Node.js API   │    │    MongoDB      │
│                 │◄──►│     Server      │◄──►│   Database      │
│ Web/Mobile/API  │    │  (Express.js)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Current Implementation

### ✅ **Implemented Components**

**API Server (Node.js/Express)**
- RESTful API endpoints
- JWT authentication
- Request validation
- Error handling
- Logging system

**Database Layer (MongoDB)**
- Multi-tenant data model
- Company-scoped collections
- Relationship management
- Indexing strategy

**Authentication System**
- JWT token-based auth
- Role-based access control
- Password hashing (bcrypt)
- Session management

---

## Application Layers

### 1. **API Layer** (`src/routes/`)
```
HTTP Requests
├── /api/v1/auth/*      → Authentication
├── /api/v1/knowledge/* → Knowledge Base
├── /api/v1/protected/* → User Profile
└── /health             → Health Check
```

### 2. **Middleware Layer** (`src/middleware/`)
```
Request Pipeline
├── requestId          → Unique request tracking
├── cors               → Cross-origin policy
├── rateLimit          → API rate limiting
├── auth               → JWT validation
├── role               → Permission checking
└── errorHandler       → Global error handling
```

### 3. **Controller Layer** (`src/controllers/`)
```
Business Logic
├── auth.controller    → Signup/Login logic
└── knowledge.controller → CRUD operations
```

### 4. **Data Layer** (`src/models/`)
```
Database Models
├── Company           → Company profiles
├── CompanyUser       → User accounts
├── CallLog           → Call records
├── KnowledgeBase     → Knowledge articles
└── EscalationRule    → Escalation triggers
```

---

## Request Flow

### Authentication Request
```
1. POST /api/v1/auth/login
   ├── requestId middleware
   ├── CORS middleware
   ├── rate limiting
   ├── input validation
   ├── auth.controller.login()
   │   ├── find user by email
   │   ├── verify password
   │   └── generate JWT token
   └── return token response
```

### Protected Resource Request
```
1. GET /api/v1/knowledge
   ├── requestId middleware
   ├── CORS middleware
   ├── rate limiting
   ├── auth middleware
   │   ├── extract JWT token
   │   ├── verify signature
   │   └── set req.user context
   ├── knowledge.controller.listItems()
   │   ├── build company-scoped query
   │   ├── apply pagination/search
   │   └── fetch from database
   └── return paginated results
```

---

## Data Architecture

### Multi-Tenant Design
```
Company A                    Company B
├── Users                   ├── Users
├── Knowledge Base          ├── Knowledge Base
├── Call Logs              ├── Call Logs
└── Escalation Rules       └── Escalation Rules
```

**Isolation Strategy:**
- All queries include `companyId` filter
- JWT tokens contain company context
- Automatic data scoping in controllers

### Database Relationships
```
Company (1:many)
├── CompanyUser
├── CallLog
├── KnowledgeBase
└── EscalationRule
```

---

## Security Architecture

### Authentication Flow
```
1. User Login
   ├── Password verification (bcrypt)
   ├── JWT token generation
   └── Token includes: userId, companyId, role

2. API Request
   ├── Extract Bearer token
   ├── Verify JWT signature
   ├── Check expiration
   └── Set user context
```

### Authorization Layers
```
1. Authentication (auth middleware)
   └── Valid JWT token required

2. Authorization (role middleware)  
   └── Role-based permissions

3. Data Isolation (controller level)
   └── Company-scoped queries
```

---

## Configuration Management

### Environment-Based Config
```
Development
├── Local MongoDB
├── Console logging
├── Permissive CORS
└── Debug mode

Production
├── Remote MongoDB
├── File logging
├── Strict CORS
└── Error-only logs
```

### Configuration Files
- `src/config/db.js` - Database connection
- `src/config/cors.config.js` - CORS policy
- `src/config/logger.js` - Logging setup

---

## Error Handling Strategy

### Global Error Handler
```
Error Types
├── Validation Errors (400)
├── Authentication Errors (401)
├── Authorization Errors (403)
├── Not Found Errors (404)
├── Conflict Errors (409)
└── Server Errors (500)
```

### Logging Strategy
```
Log Levels
├── error   → System errors, exceptions
├── warn    → Business logic warnings
├── info    → Request/response info
└── debug   → Detailed debugging info
```

---

## Performance Considerations

### Database Indexing
- `CompanyUser.email` (unique)
- `KnowledgeBase.companyId + isActive`
- `CallLog.companyId + startTime`

### Request Optimization
- Pagination for list endpoints
- Text search indexing
- Connection pooling (MongoDB)

### Security Measures
- Rate limiting per IP
- JWT token expiration
- Password complexity requirements
- Request ID tracking