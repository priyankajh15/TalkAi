# Database Schema

MongoDB database schema for TalkAi backend system.

## Models Overview

- **Company** - Company profiles and settings
- **CompanyUser** - User accounts linked to companies  
- **CallLog** - Call history and transcripts
- **KnowledgeBase** - Knowledge base articles
- **EscalationRule** - Call escalation keywords

---

## Company Model

**Collection:** `companies`

```javascript
{
  _id: ObjectId,
  companyName: String, // required
  industry: String,
  businessDescription: String,
  
  // Twilio Integration
  twilioNumber: String,
  forwardToNumber: String,
  
  // AI Settings
  languageMode: String, // enum: ["english", "hindi", "auto"], default: "auto"
  voiceType: String, // enum: ["male", "female"], default: "female"
  
  // Subscription
  subscriptionStatus: String, // enum: ["active", "inactive"], default: "inactive"
  minutesUsed: Number, // default: 0
  minutesLimit: Number, // default: 0
  
  // Status
  status: String, // enum: ["active", "suspended"], default: "active"
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## CompanyUser Model

**Collection:** `companyusers`

```javascript
{
  _id: ObjectId,
  companyId: ObjectId, // ref: "Company", required
  
  name: String, // required
  email: String, // required, unique
  password: String, // required, hashed
  
  role: String, // enum: ["company_admin"], default: "company_admin"
  status: String, // enum: ["active", "disabled"], default: "active"
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email: 1` (unique)
- `companyId: 1`

---

## CallLog Model

**Collection:** `calllogs`

```javascript
{
  _id: ObjectId,
  companyId: ObjectId, // ref: "Company", required
  
  callId: String, // required
  callerNumber: String,
  
  // Timing
  startTime: Date,
  endTime: Date,
  duration: Number, // seconds
  
  // Handling
  handledBy: String, // enum: ["AI", "Human"]
  escalationReason: String,
  transcript: String,
  
  // Moderation
  abusiveDetected: Boolean, // default: false
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `companyId: 1`
- `callId: 1`
- `startTime: -1`

---

## KnowledgeBase Model

**Collection:** `knowledgebases`

```javascript
{
  _id: ObjectId,
  companyId: ObjectId, // ref: "Company", required
  
  category: String,
  title: String,
  content: String, // required
  
  isActive: Boolean, // default: true
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `companyId: 1, isActive: 1`
- `companyId: 1, title: "text", content: "text"` (text search)

---

## EscalationRule Model

**Collection:** `escalationrules`

```javascript
{
  _id: ObjectId,
  companyId: ObjectId, // ref: "Company", required
  
  keywords: [String], // trigger keywords
  enabled: Boolean, // default: true
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `companyId: 1, enabled: 1`

---

## Relationships

```
Company (1) ──── (many) CompanyUser
   │
   ├── (many) CallLog
   ├── (many) KnowledgeBase  
   └── (many) EscalationRule
```

## Data Isolation

All models (except Company) include `companyId` field for multi-tenant data isolation. API queries automatically filter by the authenticated user's company.

## Soft Delete

- **KnowledgeBase** uses `isActive: false` for soft delete
- Other models use hard delete

## Timestamps

All models include automatic `createdAt` and `updatedAt` timestamps via Mongoose schema options.