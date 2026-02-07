from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
from services.ai_engine import ai_engine

router = APIRouter()
logger = logging.getLogger(__name__)

# Track API usage statistics
_total_requests = 0
_total_errors = 0

class VoiceRequest(BaseModel):
    """Voice request with validation"""
    user_message: str = Field(..., min_length=1, max_length=1000)
    call_data: Optional[Dict[str, Any]] = None
    voice_settings: Optional[Dict[str, Any]] = None
    call_sid: Optional[str] = None
    knowledge_base: Optional[List[Dict[str, Any]]] = []
    
    @validator('user_message')
    def validate_message(cls, v):
        """Ensure message is not empty or just whitespace"""
        if not v or not v.strip():
            raise ValueError('user_message cannot be empty')
        return v.strip()
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_message": "Tell me about your cloud services",
                "call_data": {
                    "companyName": "TechCorp",
                    "information": "Cloud hosting provider"
                },
                "voice_settings": {
                    "personality": "priyanshu",
                    "language": "auto"
                },
                "call_sid": "CA123456789",
                "knowledge_base": [
                    {
                        "title": "Cloud Services",
                        "content": "We provide enterprise cloud hosting..."
                    }
                ]
            }
        }

class VoiceResponse(BaseModel):
    """Voice response with comprehensive metadata"""
    # Core response fields
    ai_response: str
    detected_language: str
    language_confidence: float
    sentiment: Dict[str, Any]
    personality: str
    context_used: bool
    
    # Optional fields
    conversation_stage: Optional[str] = None
    should_escalate: Optional[bool] = False
    abusive_detected: Optional[bool] = False
    
    # ✅ NEW: Enhanced metadata fields
    intent: Optional[str] = None
    intent_confidence: Optional[float] = None
    goodbye_detected: Optional[bool] = False
    kb_used: Optional[bool] = False
    timestamp: Optional[str] = None

@router.post("/voice-response", response_model=VoiceResponse)
async def generate_voice_response(request: VoiceRequest):
    """
    Generate dynamic AI responses with advanced features:
    - Language detection (Hindi/English/Hinglish)
    - Sentiment analysis
    - Dynamic intent classification
    - Smart knowledge base extraction
    - Goodbye detection
    - Conversation memory
    - Abusive content filtering
    """
    global _total_requests, _total_errors
    _total_requests += 1
    
    try:
        # Log request
        call_id = request.call_sid or f"CALL_{_total_requests}"
        logger.info(f"[{call_id}] Processing voice request")
        logger.debug(f"[{call_id}] Message: {request.user_message[:100]}...")
        logger.debug(f"[{call_id}] KB items: {len(request.knowledge_base)}")
        
        # Generate dynamic response using AI engine
        result = await ai_engine.generate_response(
            user_message=request.user_message,
            call_data=request.call_data or {},
            voice_settings=request.voice_settings or {},
            call_sid=request.call_sid,
            knowledge_base=request.knowledge_base or []
        )
        
        # Log successful response
        logger.info(f"[{call_id}] Response generated successfully")
        logger.debug(f"[{call_id}] Language: {result.get('detected_language')}")
        logger.debug(f"[{call_id}] Intent: {result.get('intent')} (confidence: {result.get('intent_confidence')})")
        logger.debug(f"[{call_id}] Stage: {result.get('conversation_stage')}")
        
        # Check for goodbye
        if result.get('goodbye_detected'):
            logger.info(f"[{call_id}] Goodbye detected - ending conversation")
        
        # Check for escalation
        if result.get('should_escalate'):
            logger.warning(f"[{call_id}] Escalation requested")
        
        # Check for abusive content
        if result.get('abusive_detected'):
            logger.warning(f"[{call_id}] Abusive content detected")
        
        # Build response with enhanced metadata
        return VoiceResponse(
            ai_response=result['ai_response'],
            detected_language=result['detected_language'],
            language_confidence=result['language_confidence'],
            sentiment=result['sentiment'],
            personality=result['personality'],
            context_used=result['context_used'],
            conversation_stage=result.get('conversation_stage'),
            should_escalate=result.get('should_escalate', False),
            abusive_detected=result.get('abusive_detected', False),
            # ✅ NEW: Enhanced metadata
            intent=result.get('intent'),
            intent_confidence=result.get('intent_confidence'),
            goodbye_detected=result.get('goodbye_detected', False),
            kb_used=len(request.knowledge_base) > 0,
            timestamp=datetime.now().isoformat()
        )
        
    except ValueError as e:
        # Validation errors
        _total_errors += 1
        logger.error(f"[{request.call_sid or 'UNKNOWN'}] Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
        
    except Exception as e:
        # Unexpected errors - return graceful fallback
        _total_errors += 1
        call_id = request.call_sid or f"CALL_{_total_requests}"
        
        logger.error(f"[{call_id}] Voice response generation failed: {str(e)}")
        logger.error(f"[{call_id}] Error type: {type(e).__name__}")
        logger.warning(f"[{call_id}] Returning fallback response")
        
        # Return graceful fallback instead of HTTP error
        personality = "priyanshu"
        if request.voice_settings and 'personality' in request.voice_settings:
            personality = request.voice_settings['personality']
        
        return VoiceResponse(
            ai_response="I'm experiencing technical difficulties. Let me connect you with our team for assistance.",
            detected_language="english",
            language_confidence=0.5,
            sentiment={"label": "neutral", "score": 0.5},
            personality=personality,
            context_used=False,
            conversation_stage="error",
            should_escalate=True,
            abusive_detected=False,
            intent="error",
            intent_confidence=0.0,
            goodbye_detected=False,
            kb_used=False,
            timestamp=datetime.now().isoformat()
        )

@router.get("/stats")
async def get_api_stats():
    """
    Get API usage statistics
    
    Useful for monitoring and debugging production issues.
    """
    success_count = _total_requests - _total_errors
    error_rate = (_total_errors / max(_total_requests, 1)) * 100
    success_rate = (success_count / max(_total_requests, 1)) * 100
    
    return {
        "total_requests": _total_requests,
        "successful_requests": success_count,
        "failed_requests": _total_errors,
        "success_rate_percent": round(success_rate, 2),
        "error_rate_percent": round(error_rate, 2),
        "timestamp": datetime.now().isoformat()
    }

@router.post("/test")
async def test_voice_engine():
    """
    Test endpoint for debugging AI engine
    
    Sends a test request and returns the response.
    Useful for verifying the AI engine is working correctly.
    """
    try:
        test_request = VoiceRequest(
            user_message="Hello, how are you?",
            call_data={"companyName": "Test Company"},
            voice_settings={"personality": "priyanshu", "language": "auto"},
            call_sid="TEST_CALL",
            knowledge_base=[]
        )
        
        result = await generate_voice_response(test_request)
        
        return {
            "status": "success",
            "test_passed": True,
            "response": result.dict(),
            "message": "AI engine is working correctly"
        }
        
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        return {
            "status": "error",
            "test_passed": False,
            "error": str(e),
            "message": "AI engine test failed"
        }

@router.get("/health")
async def voice_router_health():
    """
    Health check for voice router
    """
    return {
        "status": "healthy",
        "router": "voice_router",
        "total_requests_processed": _total_requests,
        "timestamp": datetime.now().isoformat()
    }