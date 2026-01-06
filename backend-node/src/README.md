# Source Structure

Main application source code organized by functionality.

## Directory Structure

- `config/` - Database, CORS, and logging configuration
- `controllers/` - Request handlers for API endpoints
- `middleware/` - Authentication, error handling, rate limiting
- `models/` - MongoDB schemas and data models
- `routes/` - API route definitions and middleware binding
- `validators/` - Input validation schemas using Joi

## Entry Points

- `app.js` - Express application setup and middleware configuration
- `server.js` - Server startup and database connection