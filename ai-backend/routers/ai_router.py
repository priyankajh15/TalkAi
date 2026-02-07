from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Request
from typing import Optional, List, Dict
import time
import logging
import json
from datetime import datetime
from models.schemas import ChatRequest, ChatResponse, VoiceCallResponse

# ✅ IMPROVED: Import services with error handling
try:
    from services.llm_service import llm_service
    from services.stt_service import stt_service
    from services.tts_service import tts_service
    LLM_SERVICES_AVAILABLE = True
except ImportError as e:
    LLM_SERVICES_AVAILABLE = False
    logging.warning(f"LLM services not fully available: {e}")

router = APIRouter(prefix="/ai", tags=["AI"])
logger = logging.getLogger(__name__)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: Request):
    """
    ✅ IMPROVED: Chat with AI using knowledge base context
    
    NOTE: This is for TEXT CHAT only (not voice calls)
    For voice calls, use /voice/voice-response endpoint
    """
    try:
        # Get raw request body for debugging
        body = await request.body()
        body_str = body.decode('utf-8', errors='replace')
        logger.debug(f"Text chat request received: {body_str[:200]}...")
        
        # Parse JSON
        try:
            data = json.loads(body_str)
            logger.debug(f"Parsed data: {data}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return ChatResponse(
                ai_response="I received a malformed request. Please try again.",
                confidence=0.5,
                should_escalate=False,
                processing_time=1.0,
                model_used="error_fallback"
            )
        
        # Extract required fields
        message = data.get('message', '')
        company_name = data.get('company_name', 'Demo Company')
        knowledge_articles = data.get('knowledge_articles', [])
        
        if not message:
            return ChatResponse(
                ai_response="Please provide a message.",
                confidence=0.5,
                should_escalate=False,
                processing_time=0.1,
                model_used="validation_error"
            )
        
        logger.info(f"Processing text chat message: {message[:100]}...")
        
        # Check if LLM service is available
        if not LLM_SERVICES_AVAILABLE:
            logger.warning("LLM service not available, using fallback")
            return ChatResponse(
                ai_response="Text chat is currently unavailable. Please use voice calls for assistance.",
                confidence=0.8,
                should_escalate=False,
                processing_time=0.1,
                model_used="fallback"
            )
        
        # Build company info
        company_info = {
            "name": company_name or "our company",
            "business_hours": "9 AM - 6 PM EST"
        }
        
        # Generate response with knowledge context
        start_time = time.time()
        result = await llm_service.generate_response_with_knowledge(
            user_message=message,
            knowledge_articles=knowledge_articles,
            company_info=company_info
        )
        processing_time = time.time() - start_time
        
        if not result.get("success"):
            logger.warning("LLM service returned unsuccessful result")
            return ChatResponse(
                ai_response="I'm here to help! How can I assist you today?",
                confidence=0.8,
                should_escalate=False,
                processing_time=processing_time,
                model_used="fallback"
            )
        
        logger.info(f"Text chat response generated successfully in {processing_time:.2f}s")
        
        return ChatResponse(
            ai_response=result["response"],
            confidence=0.95,
            should_escalate=False,
            processing_time=processing_time,
            model_used=result.get("model_used", "llm_service")
        )
        
    except Exception as e:
        logger.error(f"Text chat error: {str(e)}", exc_info=True)
        return ChatResponse(
            ai_response="I'm experiencing technical difficulties. Please try again or use voice calls.",
            confidence=0.5,
            should_escalate=False,
            processing_time=1.0,
            model_used="error_fallback"
        )

@router.post("/process-voice", response_model=VoiceCallResponse)
async def process_voice_call(
    audio_file: UploadFile = File(...),
    company_name: str = Form("Demo Company"),
    voice: str = Form("ekta")
):
    """
    ✅ LEGACY: Complete voice processing pipeline
    
    NOTE: This endpoint is NOT used by the main voice call system.
    The actual voice calls use Twilio STT/TTS directly.
    Keep this for potential future custom voice processing needs.
    """
    logger.warning("Legacy /ai/process-voice endpoint called - not used in production")
    
    if not LLM_SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Voice processing services not available. Use Twilio-based voice calls instead."
        )
    
    try:
        start_time = time.time()
        
        # Step 1: Convert audio to text
        audio_data = await audio_file.read()
        stt_result = await stt_service.transcribe_audio(
            audio_data=audio_data,
            audio_format=audio_file.filename.split('.')[-1] if audio_file.filename else "wav"
        )
        
        if not stt_result["success"]:
            raise HTTPException(status_code=500, detail="Speech transcription failed")
        
        # Step 2: Generate AI response
        company_info = {"name": company_name}
        llm_result = await llm_service.generate_response_with_knowledge(
            user_message=stt_result["transcript"],
            knowledge_articles=[],
            company_info=company_info
        )
        
        if not llm_result["success"]:
            raise HTTPException(status_code=500, detail="AI response generation failed")
        
        # Step 3: Convert AI response to speech
        tts_result = await tts_service.synthesize_speech(
            text=llm_result["response"],
            voice=voice
        )
        
        if not tts_result["success"]:
            raise HTTPException(status_code=500, detail="Speech synthesis failed")
        
        total_time = round(time.time() - start_time, 2)
        
        logger.info(f"Legacy voice processing completed in {total_time}s")
        
        return VoiceCallResponse(
            transcript=stt_result["transcript"],
            ai_response=llm_result["response"],
            audio_url="data:audio/wav;base64," + str(tts_result["audio_data"]),
            confidence=stt_result["confidence"],
            should_escalate=False,
            voice_used=voice,
            total_processing_time=total_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Legacy voice processing error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_voices():
    """Get available TTS voices (for future custom voice synthesis)"""
    if not LLM_SERVICES_AVAILABLE:
        return {
            "voices": {},
            "total_count": 0,
            "provider": "none",
            "note": "TTS service not available"
        }
    
    try:
        return tts_service.get_available_voices()
    except Exception as e:
        logger.error(f"Error getting voices: {str(e)}")
        return {
            "voices": {},
            "total_count": 0,
            "provider": "error",
            "error": str(e)
        }

@router.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """Transcribe audio to text only (for future features)"""
    if not LLM_SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Transcription service not available"
        )
    
    try:
        audio_data = await audio_file.read()
        result = await stt_service.transcribe_audio(
            audio_data=audio_data,
            audio_format=audio_file.filename.split('.')[-1] if audio_file.filename else "wav"
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=500, 
                detail=result.get("error", "Transcription failed")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    voice: str = Form("ekta")
):
    """Convert text to speech only (for future features)"""
    if not LLM_SERVICES_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Speech synthesis service not available"
        )
    
    try:
        result = await tts_service.synthesize_speech(text=text, voice=voice)
        
        if not result["success"]:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Speech synthesis failed")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Synthesis error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def ai_router_status():
    """
    ✅ NEW: Check AI router status
    """
    return {
        "router": "ai_router",
        "purpose": "Text chat and future voice features",
        "llm_services_available": LLM_SERVICES_AVAILABLE,
        "active_endpoints": [
            "/ai/chat",
            "/ai/voices",
            "/ai/transcribe",
            "/ai/synthesize"
        ],
        "note": "For voice calls, use /voice/voice-response endpoint",
        "timestamp": datetime.now().isoformat()
    }