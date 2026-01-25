import os
from typing import Dict
import requests
import uuid

class TTSService:
    """
    Text-to-Speech service using Hugging Face API
    """
    
    def __init__(self):
        self.hf_token = os.getenv('HUGGINGFACE_TOKEN')
        self.tts_model = "microsoft/speecht5_tts"
        self.available_voices = {
            "ekta": {"gender": "female", "language": "en-IN"},
            "priyanka": {"gender": "female", "language": "en-IN"},
            "anuj": {"gender": "male", "language": "en-IN"},
            "priyanshu": {"gender": "male", "language": "en-IN"}
        }
    
    async def synthesize_speech(self, text: str, voice: str = "ekta") -> Dict:
        """
        Convert text to speech using Hugging Face TTS
        
        Args:
            text (str): Text to convert to speech
            voice (str): Voice to use for synthesis
            
        Returns:
            Dict: Audio synthesis result
        """
        try:
            if not self.hf_token:
                raise Exception("Hugging Face token not configured")
            
            # Call Hugging Face TTS API
            api_url = f"https://api-inference.huggingface.co/models/{self.tts_model}"
            headers = {"Authorization": f"Bearer {self.hf_token}"}
            
            response = requests.post(
                api_url,
                headers=headers,
                json={"inputs": text}
            )
            
            if response.status_code == 200:
                audio_id = str(uuid.uuid4())[:8]
                audio_filename = f"hf_audio_{audio_id}.wav"
                
                return {
                    "audio_data": response.content,
                    "audio_filename": audio_filename,
                    "text_length": len(text),
                    "voice_used": voice,
                    "voice_info": self.available_voices.get(voice, self.available_voices["ekta"]),
                    "provider": "huggingface",
                    "model_used": self.tts_model,
                    "audio_format": "wav",
                    "success": True
                }
            else:
                raise Exception(f"Hugging Face TTS API error: {response.status_code}")
                
        except Exception as e:
            return {
                "error": str(e),
                "success": False
            }
    
    def get_available_voices(self) -> Dict:
        """
        Get list of available voices
        
        Returns:
            Dict: Available voices with metadata
        """
        return {
            "voices": self.available_voices,
            "total_count": len(self.available_voices),
            "provider": "huggingface",
            "model": self.tts_model
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

# Create global instance
tts_service = TTSService()