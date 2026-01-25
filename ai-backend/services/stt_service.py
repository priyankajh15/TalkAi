import os
from typing import Dict
import requests

class STTService:
    """
    Speech-to-Text service using Hugging Face Whisper API
    """
    
    def __init__(self):
        self.hf_token = os.getenv('HUGGINGFACE_TOKEN')
        self.stt_model = "openai/whisper-large-v3"
    
    async def transcribe_audio(self, audio_data: bytes, audio_format: str = "wav") -> Dict:
        """
        Convert audio to text using Hugging Face Whisper
        
        Args:
            audio_data (bytes): Audio file data
            audio_format (str): Audio format (wav, mp3, etc.)
            
        Returns:
            Dict: Transcription result
        """
        try:
            if not self.hf_token:
                raise Exception("Hugging Face token not configured")
            
            # Call Hugging Face Whisper API
            api_url = f"https://api-inference.huggingface.co/models/{self.stt_model}"
            headers = {"Authorization": f"Bearer {self.hf_token}"}
            
            response = requests.post(
                api_url,
                headers=headers,
                data=audio_data
            )
            
            if response.status_code == 200:
                result = response.json()
                transcript = result.get('text', '').strip()
                
                return {
                    "transcript": transcript,
                    "confidence": 0.95,  # Whisper doesn't return confidence scores
                    "language": "en-US",
                    "audio_format": audio_format,
                    "audio_size_bytes": len(audio_data),
                    "model_used": self.stt_model,
                    "provider": "huggingface",
                    "success": True
                }
            else:
                raise Exception(f"Hugging Face STT API error: {response.status_code}")
                
        except Exception as e:
            return {
                "transcript": "",
                "error": str(e),
                "success": False
            }
    
    def transcribe_from_url(self, audio_url: str) -> Dict:
        """
        Transcribe audio from URL (for Twilio recordings)
        
        Args:
            audio_url (str): URL to audio file
            
        Returns:
            Dict: Transcription result
        """
        try:
            # Download audio from URL
            audio_response = requests.get(audio_url)
            if audio_response.status_code == 200:
                return self.transcribe_audio(audio_response.content)
            else:
                raise Exception(f"Failed to download audio from URL: {audio_response.status_code}")
                
        except Exception as e:
            return {
                "transcript": "",
                "error": str(e),
                "success": False
            }
    
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