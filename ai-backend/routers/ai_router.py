from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Request
from typing import Optional, List, Dict
import time
import requests
import json
from models.schemas import ChatRequest, ChatResponse, VoiceCallResponse
from services.llm_service import llm_service
from services.stt_service import stt_service
from services.tts_service import tts_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: Request):
    """Chat with AI using knowledge base context"""
    try:
        # Get raw request body for debugging
        body = await request.body()
        body_str = body.decode('utf-8', errors='replace')  # Handle encoding issues
        print(f"Raw request body: {body_str}")
        
        # Parse JSON manually with better error handling
        try:
            data = json.loads(body_str)
            print(f"Parsed data: {data}")
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
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
        
        print(f"Processing message: {message}")
        # Get knowledge base articles from Node.js backend (optional)
        knowledge_articles = await get_knowledge_base_context(message)
        
        # Build company info
        company_info = {
            "name": company_name or "our company",
            "business_hours": "9 AM - 6 PM EST"  # This could come from database
        }
        
        # Generate response with knowledge context
        result = await llm_service.generate_response_with_knowledge(
            user_message=message,
            knowledge_articles=knowledge_articles,
            company_info=company_info
        )
        
        if not result["success"]:
            # Return a simple fallback response instead of error
            return ChatResponse(
                ai_response="I'm here to help! How can I assist you today?",
                confidence=0.8,
                should_escalate=False,
                processing_time=1.0,
                model_used="fallback"
            )
        
        return ChatResponse(
            ai_response=result["response"],
            confidence=0.95,  # Hugging Face doesn't return confidence
            should_escalate=False,  # Could add escalation logic
            processing_time=2.0,  # Could track actual time
            model_used=result["model_used"]
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            ai_response="I'm experiencing some technical difficulties, but I'm here to help!",
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
    """Complete voice processing: Audio → Text → AI → Speech"""
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
        
        # Step 2: Get knowledge context for the transcript
        knowledge_articles = await get_knowledge_base_context(stt_result["transcript"])
        
        # Step 3: Generate AI response with knowledge
        company_info = {"name": company_name}
        llm_result = await llm_service.generate_response_with_knowledge(
            user_message=stt_result["transcript"],
            knowledge_articles=knowledge_articles,
            company_info=company_info
        )
        
        if not llm_result["success"]:
            raise HTTPException(status_code=500, detail="AI response generation failed")
        
        # Step 4: Convert AI response to speech
        tts_result = await tts_service.synthesize_speech(
            text=llm_result["response"],
            voice=voice
        )
        
        if not tts_result["success"]:
            raise HTTPException(status_code=500, detail="Speech synthesis failed")
        
        total_time = round(time.time() - start_time, 2)
        
        return VoiceCallResponse(
            transcript=stt_result["transcript"],
            ai_response=llm_result["response"],
            audio_url="data:audio/wav;base64," + str(tts_result["audio_data"]),  # Base64 audio
            confidence=stt_result["confidence"],
            should_escalate=False,
            voice_used=voice,
            total_processing_time=total_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_voices():
    """Get available TTS voices"""
    return tts_service.get_available_voices()

@router.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """Transcribe audio to text only"""
    try:
        audio_data = await audio_file.read()
        result = await stt_service.transcribe_audio(
            audio_data=audio_data,
            audio_format=audio_file.filename.split('.')[-1] if audio_file.filename else "wav"
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Transcription failed"))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    voice: str = Form("ekta")
):
    """Convert text to speech only"""
    try:
        result = await tts_service.synthesize_speech(text=text, voice=voice)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Speech synthesis failed"))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_knowledge_base_context(user_message: str) -> List[Dict]:
    """
    Get relevant knowledge base articles from Node.js backend
    
    Args:
        user_message (str): User's message to search for
        
    Returns:
        List[Dict]: Relevant knowledge articles
    """
    try:
        # Get Node.js backend URL from environment
        node_backend_url = "http://localhost:5000"  # Could be from env
        
        # Search knowledge base
        response = requests.get(
            f"{node_backend_url}/api/v1/knowledge",
            params={"search": user_message, "limit": 3},
            timeout=3
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("data", [])
        else:
            print(f"Knowledge base search failed: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"Knowledge base unavailable: {e}")
        return []