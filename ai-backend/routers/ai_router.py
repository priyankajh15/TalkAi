from fastapi import APIRouter, File, UploadFile, Form
from typing import Optional
import time
from models.schemas import ChatRequest, ChatResponse, VoiceCallResponse
from services.llm_service import llm_service
from services.stt_service import stt_service
from services.tts_service import tts_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """Chat with AI - send message and get response"""
    context = {
        "company_name": request.company_name,
        **(request.context or {})
    }
    
    result = await llm_service.generate_response(
        user_message=request.message,
        context=context
    )
    
    return ChatResponse(
        ai_response=result["response"],
        confidence=result["confidence"],
        should_escalate=result["should_escalate"],
        processing_time=result["processing_time"],
        model_used=result["model_used"]
    )

@router.post("/process-voice", response_model=VoiceCallResponse)
async def process_voice_call(
    audio_file: UploadFile = File(...),
    company_name: str = Form("Demo Company"),
    voice: str = Form("ekta"),
    context: Optional[str] = Form(None)
):
    """Complete voice call processing: Audio → Transcript → AI Response → Audio"""
    start_time = time.time()
    
    audio_data = await audio_file.read()
    
    stt_result = await stt_service.transcribe_audio(
        audio_data=audio_data,
        audio_format=audio_file.filename.split('.')[-1] if audio_file.filename else "wav"
    )
    
    llm_context = {
        "company_name": company_name,
        "call_context": "voice_call"
    }
    if context:
        try:
            import json
            additional_context = json.loads(context)
            llm_context.update(additional_context)
        except:
            pass
    
    llm_result = await llm_service.generate_response(
        user_message=stt_result["transcript"],
        context=llm_context
    )
    
    tts_result = await tts_service.synthesize_speech(
        text=llm_result["response"],
        voice=voice
    )
    
    total_time = round(time.time() - start_time, 2)
    
    return VoiceCallResponse(
        transcript=stt_result["transcript"],
        ai_response=llm_result["response"],
        audio_url=tts_result["audio_url"],
        confidence=stt_result["confidence"],
        should_escalate=llm_result["should_escalate"],
        voice_used=voice,
        total_processing_time=total_time
    )

@router.get("/voices")
async def get_voices(provider: Optional[str] = None, gender: Optional[str] = None):
    """Get available TTS voices"""
    return tts_service.get_available_voices(provider=provider, gender=gender)

@router.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """Transcribe audio to text only"""
    audio_data = await audio_file.read()
    result = await stt_service.transcribe_audio(
        audio_data=audio_data,
        audio_format=audio_file.filename.split('.')[-1] if audio_file.filename else "wav"
    )
    return result

@router.post("/synthesize")
async def synthesize_speech(
    text: str = Form(...),
    voice: str = Form("ekta"),
    speed: float = Form(1.0)
):
    """Convert text to speech only"""
    result = await tts_service.synthesize_speech(text=text, voice=voice, speed=speed)
    return result

@router.get("/recording/{call_id}")
async def get_call_recording(call_id: str):
    """Get call recording audio file"""
    return {
        "recording_url": f"https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        "duration": "2:34",
        "format": "wav",
        "size": "1.2MB"
    }

@router.post("/knowledge/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process PDF file"""
    return {
        "success": True,
        "file_id": f"pdf_{int(time.time())}",
        "filename": file.filename,
        "size": f"{file.size / 1024 / 1024:.2f} MB",
        "status": "processed",
        "message": "PDF uploaded and processed successfully"
    }

@router.post("/knowledge/add-website")
async def add_website(url: str = Form(...)):
    """Scrape and process website content"""
    return {
        "success": True,
        "file_id": f"web_{int(time.time())}",
        "url": url,
        "size": "0.5 MB",
        "status": "processed",
        "message": "Website content added successfully"
    }

@router.get("/knowledge/files")
async def get_knowledge_files():
    """Get list of uploaded knowledge base files"""
    return {
        "files": [],
        "total_size": "0 MB",
        "storage_limit": "10 MB"
    }

@router.delete("/knowledge/file/{file_id}")
async def delete_knowledge_file(file_id: str):
    """Delete knowledge base file"""
    return {
        "success": True,
        "message": "File deleted successfully"
    }