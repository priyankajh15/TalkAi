from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import uvicorn

# Load environment variables from .env file FIRST
load_dotenv()

# Import routers AFTER environment is loaded
from routers import ai_router, voice_router, health_router

# Create FastAPI application
app = FastAPI(
    title="TalkAI Backend",
    description="AI processing backend for TalkAI platform",
    version="1.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",  # Local Node.js backend
        "https://talkai-appo.onrender.com",  # Production Node.js backend
        "http://localhost:3000",  # Local frontend (for testing)
        "https://talkai-tau.vercel.app"  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router.router)
app.include_router(ai_router.router)
app.include_router(voice_router.router, prefix="/voice")

# Run the server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port
    )