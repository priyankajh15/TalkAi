# Models

MongoDB schemas using Mongoose for data persistence.

## Files

- `Company.model.js` - Company profile and subscription settings
- `CompanyUser.model.js` - User accounts linked to companies
- `CallLog.model.js` - Call history and transcripts
- `KnowledgeBase.model.js` - Knowledge base articles and content
- `EscalationRule.model.js` - Call escalation trigger keywords

## Key Relationships

- Company → CompanyUser (1:many)
- Company → CallLog (1:many)
- Company → KnowledgeBase (1:many)
- Company → EscalationRule (1:many)

## Features

- Multi-tenant data isolation by companyId
- Soft delete support (isActive field)
- Automatic timestamps (createdAt, updatedAt)
- Enum validation for status fields