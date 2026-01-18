from fastapi import APIRouter
import os

router = APIRouter(tags=["Health"])

@router.get("/")
async def root():
    """Basic health check endpoint"""
    return {
        "message": "TalkAI Backend is running",
        "status": "healthy",
        "version": "1.0.0",
        "mock_mode": os.getenv("USE_MOCK_AI", "true") == "true"
    }

@router.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    return {
        "status": "healthy",
        "database": "connected" if os.getenv("MONGO_URI") else "not configured",
        "ai_mode": "mock" if os.getenv("USE_MOCK_AI", "true") == "true" else "real",
        "port": os.getenv("PORT", "8000")
    }

@router.post("/ai/process-call")
async def process_call():
    """Main AI processing endpoint - currently returns mock data"""
    return {
        "transcript": "Hello, how can I help you today?",
        "ai_response": "Thank you for calling TalkAI! I'm here to assist you.",
        "audio_url": "mock-audio-response.mp3",
        "should_escalate": False,
        "confidence": 0.95
    }