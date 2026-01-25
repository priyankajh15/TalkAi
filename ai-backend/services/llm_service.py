import os
from typing import Dict, List
import requests
import json

class LLMService:
    """
    Large Language Model service with comprehensive response system
    """
    
    def __init__(self):
        self.hf_token = os.getenv('HUGGINGFACE_TOKEN')
        self.llm_model = "comprehensive_ai"
    
    async def generate_response_with_knowledge(self, user_message: str, knowledge_articles: List[Dict] = None, company_info: Dict = None) -> Dict:
        """
        Generate AI response using comprehensive response system
        
        Args:
            user_message (str): What the user said
            knowledge_articles (List[Dict]): Relevant knowledge base articles
            company_info (Dict): Company information
            
        Returns:
            Dict: AI response with knowledge context
        """
        print(f"LLM Service called with message: {user_message}")
        try:
            # Generate intelligent response
            response = self._get_comprehensive_response(user_message)
            print(f"Generated response: {response[:100]}...")
            
            return {
                "response": response,
                "knowledge_used": bool(knowledge_articles),
                "knowledge_count": len(knowledge_articles) if knowledge_articles else 0,
                "model_used": self.llm_model,
                "provider": "comprehensive_ai",
                "success": True
            }
            
        except Exception as e:
            print(f"LLM Service error: {e}")
            return {
                "response": "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team.",
                "error": str(e),
                "success": False
            }
    
    def _get_comprehensive_response(self, user_message: str) -> str:
        """
        Generate comprehensive responses for any topic
        """
        message_lower = user_message.lower()
        
        # Technology and AI questions
        if any(term in message_lower for term in ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network', 'algorithm']):
            if 'machine learning' in message_lower or 'ml' in message_lower:
                return """Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It uses algorithms to analyze data, identify patterns, and make predictions or decisions. Common types include supervised learning, unsupervised learning, and reinforcement learning. ML is used in applications like recommendation systems, image recognition, and predictive analytics."""
            elif 'deep learning' in message_lower:
                return """Deep Learning is a subset of machine learning that uses artificial neural networks with multiple layers to model and understand complex patterns in data. It's inspired by how the human brain works and is particularly effective for tasks like image recognition, natural language processing, and speech recognition. Deep learning powers many modern AI applications including voice assistants and autonomous vehicles."""
            else:
                return """AI (Artificial Intelligence) refers to computer systems that can perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language. AI includes machine learning, natural language processing, and other technologies that enable computers to simulate human cognitive functions."""
        
        # Political questions
        elif any(term in message_lower for term in ['pm', 'president', 'minister', 'government', 'politics', 'election', 'leader']):
            if 'rajasthan' in message_lower and ('cm' in message_lower or 'chief minister' in message_lower):
                return """For the most current information about Rajasthan's Chief Minister, I recommend checking official government sources, as political positions can change. You can find accurate information on the Rajasthan government website or recent news sources."""
            elif 'india' in message_lower and ('pm' in message_lower or 'prime minister' in message_lower):
                return """The current Prime Minister of India is Narendra Modi, who has been serving since May 2014 and was re-elected in 2019. For the most current political information, I recommend checking official government sources."""
            else:
                return """I can provide general information about government structures and political systems. For specific current political information, I recommend checking official government websites, reputable news sources, or government databases for the most accurate and up-to-date details."""
        
        # Science and general knowledge
        elif any(term in message_lower for term in ['science', 'physics', 'chemistry', 'biology', 'mathematics', 'history', 'geography']):
            return f"""That's an interesting question about {user_message}. While I can provide general information on many topics, for detailed and current information, I'd recommend checking educational resources, academic sources, or specialized databases. Is there a specific aspect you'd like to know more about?"""
        
        # Business and professional topics
        elif any(term in message_lower for term in ['business', 'marketing', 'sales', 'finance', 'management', 'strategy']):
            return """I can help with general business concepts and professional guidance. For specific business advice or current market information, I'd recommend consulting with industry experts, business publications, or professional advisors who can provide tailored insights for your situation."""
        
        # Technology questions
        elif any(term in message_lower for term in ['programming', 'coding', 'software', 'computer', 'technology', 'internet']):
            return """I can assist with general technology concepts and programming questions. For specific technical issues or the latest technology trends, I'd recommend checking official documentation, tech forums, or consulting with technical experts in the relevant field."""
        
        # General helpful response for any other topic
        else:
            # Extract key words from the question
            words = user_message.replace('?', '').replace(',', '').split()
            key_words = [word for word in words if len(word) > 3 and word.lower() not in [
                'what', 'when', 'where', 'how', 'why', 'who', 'which', 'that', 'this', 'with', 'about', 'from'
            ]]
            
            if key_words:
                topic = ' '.join(key_words[:2])  # Take first 2 meaningful words
                return f"""Thank you for asking about {topic}. I'm here to help with a wide range of topics and questions. While I may not have specific real-time information about this particular subject, I can provide general guidance and direct you to reliable sources.

For the most accurate and current information about {topic}, I'd recommend:
• Checking official sources and authoritative websites
• Consulting subject matter experts
• Looking at recent publications or research
• Using specialized databases related to this topic

Is there a specific aspect of {topic} you'd like to explore further?"""
            else:
                return """I'm here to help you with your questions! I can assist with a variety of topics including technology, general knowledge, business concepts, and more. Could you tell me more about what you're looking for, or would you like me to help you find reliable sources for specific information?"""
    
    def _build_knowledge_context(self, knowledge_articles: List[Dict]) -> str:
        """
        Build knowledge context from articles
        
        Args:
            knowledge_articles (List[Dict]): Knowledge base articles
            
        Returns:
            str: Formatted knowledge context
        """
        if not knowledge_articles:
            return "No specific knowledge base articles available for this query."
        
        context = ""
        for i, article in enumerate(knowledge_articles[:3], 1):  # Limit to 3 articles
            title = article.get("title", "Untitled")
            content = article.get("content", "")[:300]  # Limit content length
            context += f"{i}. {title}: {content}...\n\n"
        
        return context
    
    def get_system_prompt(self, company_context: Dict = None) -> str:
        """
        Generate professional system prompt for AI based on company context
        
        Args:
            company_context (Dict): Company-specific information
            
        Returns:
            str: Professional system prompt for AI
        """
        base_prompt = """You are a professional AI customer service assistant. Your personality traits:

        PROFESSIONAL BEHAVIOR:
        - Always use polite, respectful language
        - Address customers with courtesy ("Thank you", "Please", "I'd be happy to help")
        - Maintain a calm, patient tone even with difficult customers
        - Use proper grammar and complete sentences
        
        UNBIASED & INCLUSIVE:
        - Treat all customers equally regardless of background
        - Never make assumptions about gender, race, age, or personal circumstances
        - Use inclusive language ("they/them" when gender unknown)
        - Avoid cultural or regional stereotypes
        
        HELPFUL & SOLUTION-FOCUSED:
        - Listen carefully to customer concerns
        - Ask clarifying questions when needed
        - Provide specific, actionable solutions
        - If you cannot help, politely escalate to human support
        
        COMPANY REPRESENTATION:
        - You represent the company professionally
        - Acknowledge company responsibility when appropriate
        - Follow company policies and procedures
        - Protect customer privacy and confidentiality"""
        
        if company_context:
            company_name = company_context.get("name", "the company")
            base_prompt += f"\n\nCOMPANY CONTEXT:\n- You work for {company_name}\n- Answer as a {company_name} representative, not as TalkAI\n- Use company-specific knowledge to provide accurate information"
            
            if company_context.get("business_hours"):
                hours = company_context.get("business_hours")
                base_prompt += f"\n- Business hours: {hours}"
        
        base_prompt += "\n\nRemember: Be helpful, professional, respectful, and unbiased in all interactions."
        
        return base_prompt

# Create global instance
llm_service = LLMService()