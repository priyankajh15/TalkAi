# Configuration

Application configuration modules for database, CORS, and logging.

## Files

- `cors.config.js` - CORS policy configuration with origin validation
- `db.js` - MongoDB connection setup using Mongoose
- `logger.js` - Winston logger configuration with file rotation

## Usage

```javascript
const connectDB = require('./config/db');
const logger = require('./config/logger');
const corsConfig = require('./config/cors.config');

// Database connection
await connectDB();

// Logging
logger.info('Application started');

// CORS in Express
app.use(cors(corsConfig));
```