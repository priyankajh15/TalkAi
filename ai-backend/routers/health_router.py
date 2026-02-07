from fastapi import APIRouter
from datetime import datetime
import os
import logging

router = APIRouter(tags=["Health"])
logger = logging.getLogger(__name__)

# Track application uptime
app_start_time = datetime.now()

@router.get("/")
async def root():
    """
    Basic health check endpoint
    
    This endpoint is called by Render to check if the app is alive.
    Responding to this prevents auto-shutdown on free tier.
    """
    uptime_seconds = (datetime.now() - app_start_time).total_seconds()
    uptime_minutes = int(uptime_seconds / 60)
    
    return {
        "message": "TalkAI AI Backend is running",
        "status": "healthy",
        "version": "2.0.0",
        "uptime_minutes": uptime_minutes,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/health")
async def health_check():
    """
    Detailed health check for monitoring and diagnostics
    
    Returns comprehensive system information including:
    - Application status
    - Environment configuration
    - Uptime statistics
    - Service availability
    """
    uptime_seconds = (datetime.now() - app_start_time).total_seconds()
    uptime_minutes = int(uptime_seconds / 60)
    uptime_hours = uptime_minutes / 60
    
    # Check environment variables
    has_openai = bool(os.getenv("OPENAI_API_KEY")) and os.getenv("OPENAI_API_KEY") != "your_openai_api_key_here"
    has_mongo = bool(os.getenv("MONGO_URI"))
    
    # Determine AI mode
    ai_mode = "OpenAI LLM" if has_openai else "Template Responses"
    
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": {
            "seconds": int(uptime_seconds),
            "minutes": uptime_minutes,
            "hours": round(uptime_hours, 2),
            "started_at": app_start_time.isoformat()
        },
        "environment": {
            "port": os.getenv("PORT", "8000"),
            "node_env": os.getenv("NODE_ENV", "development"),
            "ai_mode": ai_mode
        },
        "services": {
            "ai_engine": "active",
            "language_detection": "active",
            "sentiment_analysis": "active",
            "knowledge_base_search": "active",
            "conversation_memory": "active"
        },
        "configuration": {
            "openai_configured": has_openai,
            "database_configured": has_mongo,
            "max_conversation_memory": 5,
            "supported_languages": ["english", "hindi", "hinglish"]
        },
        "version": "2.0.0"
    }
    
    logger.info(f"Health check performed - Uptime: {uptime_minutes} minutes")
    
    return health_data

@router.get("/keepalive")
async def keepalive():
    """
    ⭐ KEEPALIVE ENDPOINT - Prevents Render auto-shutdown
    
    Call this endpoint every 10-14 minutes to prevent Render from
    shutting down the free tier instance due to inactivity.
    
    You can use:
    1. External service like UptimeRobot (recommended)
    2. Cron job
    3. GitHub Actions workflow
    
    Returns:
        Simple confirmation that the service is alive
    """
    uptime_seconds = (datetime.now() - app_start_time).total_seconds()
    uptime_minutes = int(uptime_seconds / 60)
    
    logger.info(f"Keepalive ping received - Uptime: {uptime_minutes} minutes")
    
    return {
        "status": "alive",
        "message": "Service is active and responding",
        "uptime_minutes": uptime_minutes,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/ready")
async def readiness_check():
    """
    Kubernetes-style readiness check
    
    Returns whether the application is ready to receive traffic.
    Useful for load balancers and orchestration systems.
    """
    try:
        # Check if AI engine is initialized
        from services.ai_engine import ai_engine
        
        is_ready = ai_engine is not None
        
        if is_ready:
            return {
                "status": "ready",
                "message": "Application is ready to receive requests",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "status": "not_ready",
                "message": "AI engine not initialized",
                "timestamp": datetime.now().isoformat()
            }, 503
            
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {
            "status": "not_ready",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }, 503

@router.get("/metrics")
async def metrics():
    """
    Basic metrics endpoint for monitoring
    
    Returns application metrics that can be scraped by monitoring tools.
    """
    uptime_seconds = (datetime.now() - app_start_time).total_seconds()
    
    return {
        "metrics": {
            "uptime_seconds": int(uptime_seconds),
            "status": "healthy",
            "timestamp": datetime.now().isoformat()
        }
    }