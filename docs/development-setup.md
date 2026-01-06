# Development Setup

Complete setup guide for TalkAi backend development environment.

## Prerequisites

- **Node.js** 16+ 
- **MongoDB** 4.4+
- **npm** or **yarn**

---

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd TalkAi
```

### 2. Install Dependencies
```bash
cd backend-node
npm install
```

### 3. Environment Configuration

Create `.env` file in `backend-node/` directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/talkai

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

### 4. Database Setup

**Start MongoDB:**
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Create Database:**
```bash
# Connect to MongoDB
mongosh

# Create database (will be created automatically on first write)
use talkai
```

---

## Running the Application

### Development Mode
```bash
cd backend-node
npm start
```

**Server will start on:** `http://localhost:3000`

### Verify Installation

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-09-06T10:30:00.000Z",
  "uptime": 10.5,
  "database": "connected"
}
```

---

## Project Structure

```
backend-node/
├── src/
│   ├── config/          # Database, CORS, logging config
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── validators/      # Input validation schemas
│   ├── app.js          # Express app setup
│   └── server.js       # Server startup
├── logs/               # Application logs
├── .env               # Environment variables
├── package.json       # Dependencies
└── README.md          # Quick reference
```

---

## Development Workflow

### 1. Create New Feature
```bash
# Create controller
touch src/controllers/feature.controller.js

# Create model
touch src/models/Feature.model.js

# Create routes
touch src/routes/feature.routes.js

# Create validator
touch src/validators/feature.validator.js
```

### 2. Add Route to App
```javascript
// src/app.js
const featureRoutes = require('./routes/feature.routes');
app.use('/api/v1/feature', featureRoutes);
```

### 3. Test Endpoints
```bash
# Using curl
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Corp","email":"test@test.com","password":"Test123!"}'
```

---

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | - | ✅ |
| `LOG_LEVEL` | Winston log level | `info` | ❌ |
| `NODE_ENV` | Environment mode | `development` | ❌ |

---

## Logging

**Log Files:**
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

**Log Levels:**
- `error` - Error messages
- `warn` - Warning messages  
- `info` - General information
- `debug` - Debug information

**Console Output:**
Development mode shows colorized logs in console.

---

## Common Issues

### MongoDB Connection Failed
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGO_URI
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### JWT Secret Missing
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```