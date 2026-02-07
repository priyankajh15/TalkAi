from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    """Request schema for text chat"""
    model_config = ConfigDict(extra='allow')
    
    message: str = Field(..., description="User's message")
    company_name: str = Field(default="Demo Company", description="Company name")
    context: Optional[dict] = Field(default=None, description="Conversation context")
    knowledge_articles: Optional[list] = Field(default=None, description="Knowledge base articles")
    company_info: Optional[dict] = Field(default=None, description="Company information")

class ChatResponse(BaseModel):
    """Response schema for text chat"""
    model_config = ConfigDict(protected_namespaces=())
    
    ai_response: str = Field(..., description="AI-generated response")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Response confidence")
    should_escalate: bool = Field(..., description="Should escalate to human")
    processing_time: float = Field(..., description="Processing time in seconds")
    model_used: str = Field(..., description="Model used for response")

class VoiceCallRequest(BaseModel):
    """Request schema for voice call processing"""
    company_name: str = Field(default="Demo Company", description="Company name")
    voice: str = Field(default="ekta", description="Voice to use")
    context: Optional[dict] = Field(default=None, description="Call context")

class VoiceCallResponse(BaseModel):
    """Response schema for voice call processing"""
    transcript: str = Field(..., description="Transcribed user speech")
    ai_response: str = Field(..., description="AI-generated response")
    audio_url: str = Field(..., description="URL to audio response")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Transcription confidence")
    should_escalate: bool = Field(..., description="Should escalate to human")
    voice_used: str = Field(..., description="Voice used for response")
    total_processing_time: float = Field(..., description="Total processing time")

# ✅ NEW: Enhanced schemas for voice router with metadata

class VoiceRequestEnhanced(BaseModel):
    """Enhanced voice request with validation"""
    model_config = ConfigDict(extra='allow')
    
    user_message: str = Field(..., min_length=1, max_length=1000, description="User's spoken message")
    call_data: Optional[Dict[str, Any]] = Field(default=None, description="Call metadata")
    voice_settings: Optional[Dict[str, Any]] = Field(default=None, description="Voice/personality settings")
    call_sid: Optional[str] = Field(default=None, description="Twilio call SID")
    knowledge_base: Optional[list] = Field(default=[], description="Knowledge base articles")

class VoiceResponseEnhanced(BaseModel):
    """Enhanced voice response with comprehensive metadata"""
    model_config = ConfigDict(protected_namespaces=(), json_schema_extra={
        "example": {
            "ai_response": "We offer comprehensive cloud hosting with 99.9% uptime...",
            "detected_language": "english",
            "language_confidence": 0.95,
            "sentiment": {"label": "positive", "score": 0.8},
            "personality": "priyanshu",
            "context_used": True,
            "conversation_stage": "needs_assessment",
            "should_escalate": False,
            "abusive_detected": False,
            "intent": "services",
            "intent_confidence": 0.87,
            "goodbye_detected": False,
            "kb_used": True,
            "timestamp": "2025-02-07T10:30:45"
        }
    })
    
    # Core response fields
    ai_response: str = Field(..., description="AI-generated response text")
    detected_language: str = Field(..., description="Detected language (hindi/english/hinglish)")
    language_confidence: float = Field(..., ge=0.0, le=1.0, description="Language detection confidence")
    sentiment: Dict[str, Any] = Field(..., description="User sentiment analysis")
    personality: str = Field(..., description="AI personality used")
    context_used: bool = Field(..., description="Conversation history used")
    
    # Optional conversation fields
    conversation_stage: Optional[str] = Field(default=None, description="Current conversation stage")
    should_escalate: Optional[bool] = Field(default=False, description="Transfer to human agent")
    abusive_detected: Optional[bool] = Field(default=False, description="Abusive content detected")
    
    # ✅ NEW: Enhanced metadata fields
    intent: Optional[str] = Field(default=None, description="Detected user intent")
    intent_confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Intent detection confidence")
    goodbye_detected: Optional[bool] = Field(default=False, description="User said goodbye")
    kb_used: Optional[bool] = Field(default=False, description="Knowledge base used")
    timestamp: Optional[str] = Field(default=None, description="Response timestamp")

# ✅ NEW: API statistics schema

class APIStatsResponse(BaseModel):
    """API usage statistics"""
    total_requests: int = Field(..., description="Total requests processed")
    successful_requests: int = Field(..., description="Successful requests")
    failed_requests: int = Field(..., description="Failed requests")
    success_rate_percent: float = Field(..., description="Success rate percentage")
    error_rate_percent: float = Field(..., description="Error rate percentage")
    timestamp: str = Field(..., description="Statistics timestamp")

# ✅ NEW: Health check schema

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    timestamp: str = Field(..., description="Check timestamp")
    uptime: Optional[Dict[str, Any]] = Field(default=None, description="Uptime information")
    services: Optional[Dict[str, str]] = Field(default=None, description="Service statuses")
    configuration: Optional[Dict[str, Any]] = Field(default=None, description="Configuration info")