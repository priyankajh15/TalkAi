from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging
from services.ai_engine import ai_engine

router = APIRouter()
logger = logging.getLogger(__name__)

class VoiceRequest(BaseModel):
    user_message: str
    call_data: Optional[Dict[str, Any]] = None
    voice_settings: Optional[Dict[str, Any]] = None
    call_sid: Optional[str] = None
    knowledge_base: Optional[List[Dict[str, str]]] = []

class VoiceResponse(BaseModel):
    ai_response: str
    detected_language: str
    language_confidence: float
    sentiment: Dict[str, Any]
    personality: str
    context_used: bool

@router.post("/voice-response", response_model=VoiceResponse)
async def generate_voice_response(request: VoiceRequest):
    """
    Phase 3: Generate dynamic AI responses with advanced language detection,
    sentiment analysis, conversation memory, and LLM-powered responses
    """
    try:
        # Generate dynamic response using advanced AI engine
        result = await ai_engine.generate_response(
            user_message=request.user_message,
            call_data=request.call_data or {},
            voice_settings=request.voice_settings or {},
            call_sid=request.call_sid,
            knowledge_base=request.knowledge_base or []
        )
        
        return VoiceResponse(
            ai_response=result['ai_response'],
            detected_language=result['detected_language'],
            language_confidence=result['language_confidence'],
            sentiment=result['sentiment'],
            personality=result['personality'],
            context_used=result['context_used']
        )
        
    except Exception as e:
        print(f"Voice response generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Phase 3: All static response logic moved to ai_engine.py
# This router now uses the advanced AI engine for dynamic responses