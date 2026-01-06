# Backend Node.js

Express.js API server for TalkAi with authentication, company management, and knowledge base functionality.

## Setup

```bash
npm install
npm start
```

## Environment Variables

```
MONGO_URI=mongodb://localhost:27017/talkai
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=info
```

## API Endpoints

- `/api/v1/auth` - Authentication (signup, login)
- `/api/v1/knowledge` - Knowledge base management
- `/api/v1/protected` - Protected user routes
- `/health` - Health check

## Features

- JWT authentication
- Company multi-tenancy
- Knowledge base CRUD
- Request logging
- Rate limiting
- Input validation