import os
import random
from typing import Dict, List

class LLMService:
    """
    Large Language Model service for AI chat responses
    Currently uses mock responses, can be switched to real OpenAI later
    """
    
    def __init__(self):
        self.use_mock = os.getenv("USE_MOCK_AI", "true").lower() == "true"
        self.mock_responses = [
            "Thank you for calling! How can I assist you today?",
            "I'm here to help you with any questions you might have.",
            "Hello! I'd be happy to help you with your inquiry.",
            "Good day! What can I do for you today?",
            "Hi there! How may I help you?",
            "Thank you for reaching out. What information do you need?",
            "Hello! I'm ready to assist you with your questions.",
            "Hi! I'm here to provide you with the support you need."
        ]
    
    async def generate_response(self, user_message: str, context: Dict = None) -> Dict:
        """
        Generate AI response to user message
        
        Args:
            user_message (str): What the user said
            context (Dict): Additional context (company knowledge, call history)
            
        Returns:
            Dict: AI response with metadata
        """
        if self.use_mock:
            return self._generate_mock_response(user_message, context)
        else:
            return await self._generate_real_response(user_message, context)
    
    def _generate_mock_response(self, user_message: str, context: Dict = None) -> Dict:
        """
        Generate mock AI response (no API cost)
        
        Args:
            user_message (str): User's message
            context (Dict): Additional context
            
        Returns:
            Dict: Mock response with realistic structure
        """
        # Simple keyword-based responses for more realistic mocks
        user_lower = user_message.lower()
        
        if any(word in user_lower for word in ["hello", "hi", "hey"]):
            # Company name will come from context in real implementation
            company_name = context.get("company_name", "our company") if context else "our company"
            response = random.choice([
                f"Hello! Welcome to {company_name}. How can I help you today?",
                f"Hi there! Thank you for calling {company_name}. What can I do for you?",
                f"Hey! Thanks for calling {company_name}. How may I assist you?"
            ])
        elif any(word in user_lower for word in ["help", "support", "assist"]):
            response = random.choice([
                "I'd be happy to help you! What specific assistance do you need?",
                "Of course! I'm here to support you. What's your question?",
                "I'm ready to assist you. Please tell me more about what you need."
            ])
        elif any(word in user_lower for word in ["problem", "issue", "trouble"]):
            response = random.choice([
                "I understand you're having an issue. Let me help you resolve it.",
                "I'm sorry to hear about the problem. I'll do my best to assist you.",
                "Let's work together to solve this issue. Can you provide more details?"
            ])
        elif any(word in user_lower for word in ["thank", "thanks"]):
            response = random.choice([
                "You're very welcome! Is there anything else I can help you with?",
                "Happy to help! Do you have any other questions?",
                "My pleasure! Let me know if you need anything else."
            ])
        else:
            # Default responses for other messages
            response = random.choice(self.mock_responses)
        
        # Simulate escalation logic
        should_escalate = any(word in user_lower for word in [
            "angry", "frustrated", "manager", "supervisor", "complaint", "cancel"
        ])
        
        return {
            "response": response,
            "confidence": round(random.uniform(0.85, 0.98), 2),
            "should_escalate": should_escalate,
            "escalation_reason": "Customer requested human assistance" if should_escalate else None,
            "tokens_used": random.randint(20, 50),  # Mock token usage
            "processing_time": round(random.uniform(0.5, 2.0), 2),  # Mock processing time
            "model_used": "mock-gpt-4",
            "context_used": bool(context)
        }
    
    async def _generate_real_response(self, user_message: str, context: Dict = None) -> Dict:
        """
        Generate real AI response using OpenAI API (for later)
        
        Args:
            user_message (str): User's message
            context (Dict): Additional context
            
        Returns:
            Dict: Real AI response
        """
        # This will be implemented when you add real OpenAI API
        # For now, return mock response
        return self._generate_mock_response(user_message, context)
    
    def get_system_prompt(self, company_context: Dict = None) -> str:
        """
        Generate system prompt for AI based on company context
        
        Args:
            company_context (Dict): Company-specific information
            
        Returns:
            str: System prompt for AI
        """
        base_prompt = """You are a professional AI assistant. 
        You are helpful, polite, and efficient. Always try to resolve customer 
        inquiries professionally. If you cannot help, politely escalate to a human agent."""
        
        if company_context:
            company_name = company_context.get("company_name", "the company")
            base_prompt += f"\n\nYou are representing {company_name}. Answer as if you work for {company_name}, not TalkAI. "
            
            if company_context.get("knowledge_base"):
                base_prompt += "Use the provided knowledge base to answer questions accurately."
        
        return base_prompt

# Create global instance
llm_service = LLMService()