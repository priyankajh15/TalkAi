from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uvicorn
from routers import ai_router, health_router

# Load environment variables from .env file
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="TalkAI Backend",
    description="AI processing backend for TalkAI platform",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # Allow Node.js backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router.router)
app.include_router(ai_router.router)

# Run the server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "true").lower() == "true"
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=debug
    )