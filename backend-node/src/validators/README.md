# Validators

Input validation schemas using Joi for request data validation.

## Files

- `auth.validator.js` - Signup and login validation schemas
- `knowledge.validator.js` - Knowledge base item validation

## Auth Validation

**Signup Schema:**
- `companyName` - 2-100 characters, required
- `email` - Valid email format, required
- `password` - Min 8 chars, must contain uppercase, lowercase, number, special character

**Login Schema:**
- `email` - Valid email format, required
- `password` - Required

## Usage

```javascript
const { validateSignup } = require('../validators/auth.validator');

router.post('/signup', validateSignup, controller.signup);
```

Validation errors return 400 status with detailed field-level error messages.