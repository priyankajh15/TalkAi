import os
import random
from typing import Dict, Optional
import base64

class STTService:
    """
    Speech-to-Text service for converting audio to text
    Currently uses mock responses, can be switched to real Whisper API later
    """
    
    def __init__(self):
        self.use_mock = os.getenv("USE_MOCK_AI", "true").lower() == "true"
        self.mock_transcripts = [
            "Hello, I'm calling about my account",
            "Hi, I need help with my order",
            "Good morning, I have a question about your services",
            "Hello, I'm interested in learning more about your products",
            "Hi there, I'm having trouble with my account",
            "Good afternoon, can you help me with billing?",
            "Hello, I'd like to speak to someone about support",
            "Hi, I'm calling to inquire about your pricing"
        ]
    
    async def transcribe_audio(self, audio_data: bytes, audio_format: str = "wav") -> Dict:
        """
        Convert audio to text transcript
        
        Args:
            audio_data (bytes): Audio file data from Twilio
            audio_format (str): Audio format (wav, mp3, etc.)
            
        Returns:
            Dict: Transcription result with metadata
        """
        if self.use_mock:
            return self._generate_mock_transcript(audio_data, audio_format)
        else:
            return await self._generate_real_transcript(audio_data, audio_format)
    
    def _generate_mock_transcript(self, audio_data: bytes, audio_format: str) -> Dict:
        """
        Generate mock transcript (no API cost)
        
        Args:
            audio_data (bytes): Audio file data
            audio_format (str): Audio format
            
        Returns:
            Dict: Mock transcript with realistic metadata
        """
        # Simulate different transcript based on audio size
        audio_size = len(audio_data) if audio_data else 0
        
        if audio_size < 1000:
            # Short audio - likely greeting
            transcript = random.choice([
                "Hello",
                "Hi there",
                "Good morning",
                "Hey"
            ])
        elif audio_size < 5000:
            # Medium audio - simple question
            transcript = random.choice([
                "Hello, can you help me?",
                "Hi, I have a question",
                "Good morning, I need assistance",
                "Hey, I'm calling about my account"
            ])
        else:
            # Longer audio - detailed message
            transcript = random.choice(self.mock_transcripts)
        
        # Simulate confidence based on "audio quality"
        confidence = round(random.uniform(0.85, 0.98), 3)
        
        # Simulate processing time based on audio length
        processing_time = round(audio_size / 10000 + random.uniform(0.2, 0.8), 2)
        
        return {
            "transcript": transcript,
            "confidence": confidence,
            "language": "en-US",
            "duration": round(audio_size / 8000, 2),  # Mock duration calculation
            "processing_time": processing_time,
            "audio_format": audio_format,
            "audio_size_bytes": audio_size,
            "model_used": "mock-whisper-1",
            "detected_language": "english"
        }
    
    async def _generate_real_transcript(self, audio_data: bytes, audio_format: str) -> Dict:
        """
        Generate real transcript using OpenAI Whisper API (for later)
        
        Args:
            audio_data (bytes): Audio file data
            audio_format (str): Audio format
            
        Returns:
            Dict: Real transcript from Whisper API
        """
        # This will be implemented when you add real OpenAI API
        # For now, return mock transcript
        return self._generate_mock_transcript(audio_data, audio_format)
    
    def transcribe_from_url(self, audio_url: str) -> Dict:
        """
        Transcribe audio from URL (for Twilio recordings)
        
        Args:
            audio_url (str): URL to audio file from Twilio
            
        Returns:
            Dict: Transcription result
        """
        if self.use_mock:
            # Mock response for URL-based transcription
            return {
                "transcript": random.choice(self.mock_transcripts),
                "confidence": round(random.uniform(0.88, 0.96), 3),
                "language": "en-US",
                "source": "url",
                "audio_url": audio_url,
                "model_used": "mock-whisper-1"
            }
        else:
            # Real implementation would download and process the audio
            # For now, return mock
            return self.transcribe_from_url(audio_url)
    
    def detect_language(self, audio_data: bytes) -> str:
        """
        Detect language from audio
        
        Args:
            audio_data (bytes): Audio file data
            
        Returns:
            str: Detected language code
        """
        if self.use_mock:
            # Mock language detection
            languages = ["en-US", "en-GB", "es-ES", "fr-FR"]
            return random.choice(languages)
        else:
            # Real language detection would use Whisper
            return "en-US"
    
    def validate_audio_format(self, audio_format: str) -> bool:
        """
        Check if audio format is supported
        
        Args:
            audio_format (str): Audio format to validate
            
        Returns:
            bool: True if supported
        """
        supported_formats = ["wav", "mp3", "m4a", "ogg", "flac"]
        return audio_format.lower() in supported_formats

# Create global instance
stt_service = STTService()