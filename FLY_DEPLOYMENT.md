# Fly.io Deployment Guide

## Prerequisites
1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Create Fly.io account (credit card required for verification)

## Step 1: Login to Fly.io
```bash
fly auth login
```

## Step 2: Deploy Node Backend

```bash
cd c:\TalkAi\backend-node

# Create app and deploy
fly launch --no-deploy

# Set environment secrets (IMPORTANT!)
# Copy values from your .env file
fly secrets set MONGO_URI="<your-mongodb-uri>"
fly secrets set JWT_SECRET="<your-jwt-secret>"
fly secrets set TWILIO_ACCOUNT_SID="<your-twilio-sid>"
fly secrets set TWILIO_AUTH_TOKEN="<your-twilio-token>"
fly secrets set TWILIO_PHONE_NUMBER="<your-twilio-number>"
fly secrets set CORS_ORIGINS="<your-frontend-urls>"
fly secrets set AI_BACKEND_URL_PROD="<your-ai-backend-fly-url>"
fly secrets set BASE_URL_PROD="<your-node-backend-fly-url>"

# Deploy
fly deploy
```

## Step 3: Deploy Python AI Backend

```bash
cd c:\TalkAi\ai-backend

# Create app and deploy
fly launch --no-deploy

# Set environment secrets (add your OpenAI key)
fly secrets set OPENAI_API_KEY="<your-openai-api-key>"
fly secrets set MONGODB_URI="<your-mongodb-uri>"

# Deploy
fly deploy
```

## Step 4: Update Frontend on Vercel

Go to Vercel dashboard → Your project → Settings → Environment Variables

**No changes needed!** The auto-fallback code will automatically use Fly.io URLs.

## Step 5: Test

1. Visit your frontend
2. Try making a call
3. Check logs: `fly logs -a <your-app-name>`

## Verify Deployment

```bash
# Check Node backend
fly status -a talkai-node-backend
fly logs -a talkai-node-backend

# Check Python backend
fly status -a talkai-ai-backend
fly logs -a talkai-ai-backend
```

## Rollback to Render (if needed)

Just update frontend `apiConfig.js`:
```javascript
// Change getCurrentEndpoint to return 'backup'
let currentEndpoint = 'backup';
```

## Cost: $0 (Free Tier)
- 2 VMs used (3 free available)
- Both backends stay warm 24/7
- No cold start issues
