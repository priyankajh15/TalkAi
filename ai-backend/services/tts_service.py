import os
import random
from typing import Dict, Optional
import uuid

class TTSService:
    """
    Text-to-Speech service for converting text to audio
    Currently uses mock responses, can be switched to real TTS APIs later
    """
    
    def __init__(self):
        self.use_mock = os.getenv("USE_MOCK_AI", "true").lower() == "true"
        self.available_voices = {
            "alloy": {"gender": "neutral", "language": "en-US", "provider": "openai"},
            "echo": {"gender": "male", "language": "en-US", "provider": "openai"},
            "fable": {"gender": "neutral", "language": "en-US", "provider": "openai"},
            "ekta": {"gender": "female", "language": "en-IN", "provider": "elevenlabs"},
            "priyanshu": {"gender": "male", "language": "en-IN", "provider": "elevenlabs"},
            "anuj": {"gender": "male", "language": "en-IN", "provider": "elevenlabs"},
            "priyanka": {"gender": "female", "language": "en-IN", "provider": "elevenlabs"},
            "tanmay": {"gender": "male", "language": "en-IN", "provider": "elevenlabs"},
            "ridhima": {"gender": "female", "language": "en-IN", "provider": "elevenlabs"},
            "tarun": {"gender": "male", "language": "en-IN", "provider": "elevenlabs"}
        }
    
    async def synthesize_speech(self, text: str, voice: str = "ekta", speed: float = 1.0) -> Dict:
        """
        Convert text to speech audio
        
        Args:
            text (str): Text to convert to speech
            voice (str): Voice to use for synthesis
            speed (float): Speech speed (0.25 to 4.0)
            
        Returns:
            Dict: Audio synthesis result with metadata
        """
        if self.use_mock:
            return self._generate_mock_audio(text, voice, speed)
        else:
            return await self._generate_real_audio(text, voice, speed)
    
    def _generate_mock_audio(self, text: str, voice: str, speed: float) -> Dict:
        """
        Generate mock audio response (no API cost)
        
        Args:
            text (str): Text to synthesize
            voice (str): Voice to use
            speed (float): Speech speed
            
        Returns:
            Dict: Mock audio response with realistic metadata
        """
        # Generate unique filename for mock audio
        audio_id = str(uuid.uuid4())[:8]
        mock_filename = f"mock_audio_{audio_id}.mp3"
        
        # Calculate estimated duration based on text length and speed
        # Average speaking rate: ~150 words per minute
        word_count = len(text.split())
        base_duration = (word_count / 150) * 60  # seconds
        estimated_duration = round(base_duration / speed, 2)
        
        # Simulate processing time based on text length
        processing_time = round(len(text) / 100 + random.uniform(0.3, 1.2), 2)
        
        # Get voice info
        voice_info = self.available_voices.get(voice, self.available_voices["ekta"])
        
        return {
            "audio_url": f"https://mock-tts-storage.com/{mock_filename}",
            "audio_filename": mock_filename,
            "duration": estimated_duration,
            "text_length": len(text),
            "word_count": word_count,
            "voice_used": voice,
            "voice_gender": voice_info["gender"],
            "voice_language": voice_info["language"],
            "provider": f"mock-{voice_info['provider']}",
            "speed": speed,
            "processing_time": processing_time,
            "audio_format": "mp3",
            "sample_rate": 24000,
            "bitrate": "64kbps",
            "file_size_bytes": int(estimated_duration * 8000),  # Mock file size
            "model_used": "mock-tts-1"
        }
    
    async def _generate_real_audio(self, text: str, voice: str, speed: float) -> Dict:
        """
        Generate real audio using TTS APIs (for later)
        
        Args:
            text (str): Text to synthesize
            voice (str): Voice to use
            speed (float): Speech speed
            
        Returns:
            Dict: Real audio from TTS API
        """
        # This will be implemented when you add real TTS APIs
        # For now, return mock audio
        return self._generate_mock_audio(text, voice, speed)
    
    def get_available_voices(self, provider: str = None, gender: str = None) -> Dict:
        """
        Get list of available voices
        
        Args:
            provider (str): Filter by provider (openai, elevenlabs)
            gender (str): Filter by gender (male, female, neutral)
            
        Returns:
            Dict: Available voices with metadata
        """
        voices = self.available_voices.copy()
        
        if provider:
            voices = {k: v for k, v in voices.items() if v["provider"] == provider}
        
        if gender:
            voices = {k: v for k, v in voices.items() if v["gender"] == gender}
        
        return {
            "voices": voices,
            "total_count": len(voices),
            "providers": list(set(v["provider"] for v in voices.values())),
            "languages": list(set(v["language"] for v in voices.values()))
        }
    
    def validate_voice(self, voice: str) -> bool:
        """
        Check if voice is available
        
        Args:
            voice (str): Voice name to validate
            
        Returns:
            bool: True if voice is available
        """
        return voice in self.available_voices
    
    def validate_speed(self, speed: float) -> bool:
        """
        Check if speed is within valid range
        
        Args:
            speed (float): Speed to validate
            
        Returns:
            bool: True if speed is valid
        """
        return 0.25 <= speed <= 4.0
    
    def estimate_cost(self, text: str, provider: str = "openai") -> Dict:
        """
        Estimate cost for TTS synthesis
        
        Args:
            text (str): Text to synthesize
            provider (str): TTS provider
            
        Returns:
            Dict: Cost estimation
        """
        char_count = len(text)
        
        # Mock pricing (approximate real pricing)
        pricing = {
            "openai": 0.000015,  # $0.015 per 1K characters
            "elevenlabs": 0.00003  # $0.30 per 1K characters
        }
        
        cost_per_char = pricing.get(provider, pricing["openai"])
        estimated_cost = char_count * cost_per_char
        
        return {
            "character_count": char_count,
            "provider": provider,
            "cost_per_1k_chars": cost_per_char * 1000,
            "estimated_cost_usd": round(estimated_cost, 6),
            "currency": "USD"
        }

# Create global instance
tts_service = TTSService()