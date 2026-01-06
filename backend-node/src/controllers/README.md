# Controllers

API request handlers for authentication and knowledge management.

## Files

- `auth.controller.js` - User signup and login with JWT tokens
- `knowledge.controller.js` - CRUD operations for knowledge base items

## Auth Controller

- `POST /signup` - Company and admin user creation (atomic transaction)
- `POST /login` - User authentication with JWT token

## Knowledge Controller

- `POST /` - Create knowledge base item
- `GET /` - List items with pagination and search
- `PUT /:id` - Update knowledge item
- `DELETE /:id` - Soft delete knowledge item

All knowledge operations are scoped to the authenticated user's company.