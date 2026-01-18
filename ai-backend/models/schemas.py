from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    company_name: str = "Demo Company"
    context: dict = None

class ChatResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    ai_response: str
    confidence: float
    should_escalate: bool
    processing_time: float
    model_used: str

class VoiceCallRequest(BaseModel):
    company_name: str = "Demo Company"
    voice: str = "ekta"
    context: dict = None

class VoiceCallResponse(BaseModel):
    transcript: str
    ai_response: str
    audio_url: str
    confidence: float
    should_escalate: bool
    voice_used: str
    total_processing_time: float