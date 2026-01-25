"""
Lightweight AI Engine - No Heavy Packages (torch, transformers)
Dynamic responses with basic sentiment analysis using TextBlob
"""
import os
import logging
from typing import Dict, List, Tuple, Optional
from langdetect import detect, DetectorFactory
from textblob import TextBlob
import openai
import json

# Set seed for consistent language detection
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)

class ConversationMemory:
    """Manages conversation context and memory"""
    def __init__(self):
        self.conversations = {}
    
    def add_message(self, call_sid: str, user_msg: str, ai_response: str, language: str):
        if call_sid not in self.conversations:
            self.conversations[call_sid] = []
        
        self.conversations[call_sid].append({
            'user': user_msg,
            'ai': ai_response,
            'language': language
        })
        
        # Keep only last 5 exchanges
        if len(self.conversations[call_sid]) > 5:
            self.conversations[call_sid] = self.conversations[call_sid][-5:]
    
    def get_context(self, call_sid: str) -> List[Dict]:
        return self.conversations.get(call_sid, [])

class LightweightLanguageDetector:
    """Enhanced language detection with confidence scoring"""
    
    @staticmethod
    def detect_language(text: str, user_preference: str = 'auto') -> Tuple[str, float]:
        """Detect language with confidence score"""
        if user_preference in ['hi-IN', 'hindi']:
            return 'hindi', 1.0
        if user_preference in ['en-IN', 'english']:
            return 'english', 1.0
        
        try:
            # Use langdetect for primary detection
            detected = detect(text)
            confidence = 0.8
            
            # Check for Hinglish (mixed Hindi-English)
            hindi_words = ['hai', 'kya', 'mein', 'aap', 'hum', 'baare', 'ke', 'se', 'main', 
                          'acha', 'accha', 'nahi', 'haan', 'paisa', 'rupaye', 'samay', 'business']
            english_words = ['yes', 'no', 'good', 'service', 'cloud', 'price', 'cost', 'business']
            
            text_lower = text.lower()
            hindi_count = sum(1 for word in hindi_words if word in text_lower)
            english_count = sum(1 for word in english_words if word in text_lower)
            
            # Hinglish detection
            if hindi_count > 0 and english_count > 0:
                return 'hinglish', 0.9
            elif hindi_count >= 2:
                return 'hindi', 0.85
            elif detected == 'hi':
                return 'hindi', confidence
            else:
                return 'english', confidence
                
        except Exception as e:
            logger.warning(f"Language detection failed: {e}")
            return 'english', 0.5

class LightweightSentimentAnalyzer:
    """Lightweight sentiment analysis using TextBlob only"""
    
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment with TextBlob"""
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            if polarity > 0.1:
                return {'label': 'positive', 'score': polarity}
            elif polarity < -0.1:
                return {'label': 'negative', 'score': abs(polarity)}
            else:
                return {'label': 'neutral', 'score': 0.5}
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {'label': 'neutral', 'score': 0.5}

class PersonalityEngine:
    """Enhanced personality system with dynamic traits"""
    
    PERSONALITIES = {
        'priyanshu': {
            'traits': ['professional', 'helpful', 'confident'],
            'style': 'formal_friendly'
        },
        'tanmay': {
            'traits': ['energetic', 'enthusiastic', 'casual'],
            'style': 'informal_excited'
        },
        'ekta': {
            'traits': ['formal', 'respectful', 'structured'],
            'style': 'very_formal'
        },
        'priyanka': {
            'traits': ['technical', 'precise', 'analytical'],
            'style': 'technical_professional'
        }
    }
    
    @classmethod
    def get_personality_prompt(cls, personality: str, language: str, sentiment: Dict) -> str:
        """Generate personality-specific prompt for LLM"""
        p_data = cls.PERSONALITIES.get(personality, cls.PERSONALITIES['priyanshu'])
        
        base_prompt = f"""You are {personality}, a voice AI assistant with these traits: {', '.join(p_data['traits'])}.
Style: {p_data['style']}
Language: {language}
User sentiment: {sentiment['label']} (confidence: {sentiment['score']:.2f})

Respond naturally in {language} with your personality. Keep responses under 50 words for voice calls.
Be culturally appropriate and match the user's emotional tone."""
        
        return base_prompt

class LightweightResponseGenerator:
    """Generate contextual responses - lightweight version"""
    
    def __init__(self):
        # Initialize OpenAI client only if API key is available
        try:
            if os.getenv('OPENAI_API_KEY') and os.getenv('OPENAI_API_KEY') != 'your_openai_api_key_here':
                self.openai_client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            else:
                self.openai_client = None
                logger.info("OpenAI API key not configured, using template responses")
        except Exception as e:
            logger.warning(f"OpenAI client init failed: {e}")
            self.openai_client = None
            
        self.memory = ConversationMemory()
        self.language_detector = LightweightLanguageDetector()
        self.sentiment_analyzer = LightweightSentimentAnalyzer()
        self.personality_engine = PersonalityEngine()
    
    async def generate_response(self, user_message: str, call_data: Dict, 
                              voice_settings: Dict, call_sid: str = None) -> Dict:
        """Generate dynamic AI response with full context"""
        try:
            # Language detection
            language, lang_confidence = self.language_detector.detect_language(
                user_message, voice_settings.get('language', 'auto')
            )
            
            # Sentiment analysis
            sentiment = self.sentiment_analyzer.analyze_sentiment(user_message)
            
            # Get conversation context
            context = self.memory.get_context(call_sid) if call_sid else []
            
            # Generate response using OpenAI or templates
            personality = voice_settings.get('personality', 'priyanshu')
            response_text = await self._generate_llm_response(
                user_message, personality, language, sentiment, context, call_data
            )
            
            # Store in memory
            if call_sid:
                self.memory.add_message(call_sid, user_message, response_text, language)
            
            return {
                'ai_response': response_text,
                'detected_language': language,
                'language_confidence': lang_confidence,
                'sentiment': sentiment,
                'personality': personality,
                'context_used': len(context) > 0
            }
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            return self._fallback_response(voice_settings.get('personality', 'priyanshu'), language)
    
    async def _generate_llm_response(self, user_message: str, personality: str, 
                                   language: str, sentiment: Dict, context: List, 
                                   call_data: Dict) -> str:
        """Generate response using OpenAI GPT with fallback to templates"""
        # Check if OpenAI API key is available
        if not self.openai_client:
            logger.info("OpenAI not available, using enhanced template responses")
            return self._get_enhanced_template_response(user_message, personality, language, call_data, sentiment, context)
        
        try:
            # Build context-aware prompt
            system_prompt = self.personality_engine.get_personality_prompt(personality, language, sentiment)
            
            # Add business context
            company_name = call_data.get('companyName', 'our company')
            information = call_data.get('information', '')
            
            context_prompt = f"""
Business Context:
- Company: {company_name}
- Service Info: {information}
- This is a B2B voice call for cloud services

Previous conversation: {json.dumps(context[-2:]) if context else 'None'}

User said: "{user_message}"

Respond as {personality} in {language}. Focus on:
1. Addressing user's specific question/concern
2. Mentioning relevant cloud services benefits
3. Offering to connect with technical team if appropriate
4. Matching user's emotional tone
"""
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": context_prompt}
                ],
                max_tokens=100,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI generation failed: {e}")
            return self._get_enhanced_template_response(user_message, personality, language, call_data, sentiment, context)
    
    def _get_enhanced_template_response(self, user_message: str, personality: str, 
                                      language: str, call_data: Dict, sentiment: Dict, context: List) -> str:
        """Enhanced template responses with sentiment and context awareness"""
        company_name = call_data.get('companyName', 'our company')
        
        # Classify intent
        intent = self._classify_intent(user_message)
        
        # Get base templates - ALL 4 PERSONALITIES
        templates = {
            'priyanshu': {
                'interested': {
                    'english': f"That's wonderful! I'm glad you're interested in {company_name}'s cloud solutions. Our services can significantly benefit your business with enhanced security and cost savings. Would you like me to connect you with our technical team?",
                    'hindi': f"Bahut accha! Main khush hun ki aap {company_name} ke cloud solutions mein interested hain. Hamare services aapke business ko security aur cost savings ke saath fayda pahuncha sakte hain. Kya main aapko technical team se connect kar dun?"
                },
                'services': {
                    'english': f"Great question! {company_name} provides comprehensive cloud infrastructure including secure hosting, automated backups, 24/7 monitoring, and enterprise-grade security. Would you like me to connect you with our technical specialist?",
                    'hindi': f"Bahut accha sawal! {company_name} comprehensive cloud infrastructure provide karta hai jisme secure hosting, automated backups, 24/7 monitoring, aur enterprise-grade security hai. Technical specialist se connect karna chahenge?"
                },
                'pricing': {
                    'english': f"I understand pricing is important. {company_name}'s solutions typically save businesses 20-40% on cloud expenses. For accurate pricing tailored to your needs, shall I connect you with our team?",
                    'hindi': f"Main samajh sakta hun pricing important hai. {company_name} ke solutions typically 20-40% cloud expenses save karte hain. Aapke needs ke liye accurate pricing ke liye team se connect karein?"
                }
            },
            'tanmay': {
                'interested': {
                    'english': f"Awesome! That's so exciting! {company_name}'s cloud services are absolutely amazing and can totally transform your business. Want me to get you connected with our tech experts?",
                    'hindi': f"Zabardast! Ye bahut exciting hai! {company_name} ke cloud services bilkul amazing hain aur business ko transform kar sakte hain. Tech experts se connect karna chahenge?"
                },
                'services': {
                    'english': f"Oh wow, great question! {company_name} has this super cool cloud platform with hosting, storage, security - the whole package! Want to chat with our specialists?",
                    'hindi': f"Wow, bahut accha question! {company_name} ke paas ye super cool cloud platform hai hosting, storage, security ke saath - pura package! Specialists se baat karna chahenge?"
                },
                'pricing': {
                    'english': f"Great question about pricing! {company_name}'s rates are super competitive and most clients save tons of money. Want me to get you connected for a custom quote?",
                    'hindi': f"Pricing ke baare mein great question! {company_name} ke rates super competitive hain aur clients ka bahut paisa save hota hai. Custom quote ke liye connect karna chahenge?"
                }
            },
            'ekta': {
                'interested': {
                    'english': f"Thank you very much for your interest. I am pleased to inform you that {company_name}'s cloud solutions offer exceptional value and reliability. May I connect you with our distinguished technical team?",
                    'hindi': f"Aapke interest ke liye bahut dhanyawad. Main aapko batane mein khushi mehsus kar rahi hun ki {company_name} ke cloud solutions exceptional value aur reliability offer karte hain. Kya main aapko distinguished technical team se connect kar sakti hun?"
                },
                'services': {
                    'english': f"That is an excellent inquiry. {company_name} provides enterprise-grade cloud infrastructure services with comprehensive security protocols. May I respectfully suggest connecting you with our specialists?",
                    'hindi': f"Ye ek excellent inquiry hai. {company_name} enterprise-grade cloud infrastructure services comprehensive security protocols ke saath provide karta hai. Kya main respectfully suggest kar sakti hun ki specialists se connect karein?"
                },
                'pricing': {
                    'english': f"I appreciate your inquiry regarding pricing. {company_name} offers cost-effective solutions with transparent pricing models. May I arrange a consultation with our financial specialists?",
                    'hindi': f"Pricing ke regarding aapki inquiry ke liye appreciate karti hun. {company_name} cost-effective solutions transparent pricing models ke saath offer karta hai. Financial specialists ke saath consultation arrange kar sakti hun?"
                }
            },
            'priyanka': {
                'interested': {
                    'english': f"Excellent! From a technical perspective, {company_name}'s cloud infrastructure utilizes advanced virtualization and microservices architecture. Shall I connect you with our solutions architect?",
                    'hindi': f"Excellent! Technical perspective se, {company_name} ke cloud infrastructure mein advanced virtualization aur microservices architecture use hoti hai. Kya main aapko solutions architect se connect kar dun?"
                },
                'services': {
                    'english': f"From a technical standpoint, {company_name}'s platform provides IaaS, PaaS, and SaaS solutions with auto-scaling capabilities and advanced analytics. Would you like to discuss the architecture with our engineering team?",
                    'hindi': f"Technical standpoint se, {company_name} ka platform IaaS, PaaS, aur SaaS solutions auto-scaling capabilities aur advanced analytics ke saath provide karta hai. Engineering team ke saath architecture discuss karna chahenge?"
                },
                'pricing': {
                    'english': f"From a cost-optimization perspective, {company_name}'s solutions offer ROI through efficient resource allocation and automated scaling. Shall I connect you with our technical sales team for detailed metrics?",
                    'hindi': f"Cost-optimization perspective se, {company_name} ke solutions efficient resource allocation aur automated scaling ke through ROI offer karte hain. Detailed metrics ke liye technical sales team se connect karein?"
                }
            }
        }
        
        # Get response based on personality and intent
        p_templates = templates.get(personality, templates['priyanshu'])
        intent_templates = p_templates.get(intent, p_templates.get('interested', p_templates[list(p_templates.keys())[0]]))
        response = intent_templates.get(language, intent_templates.get('english', list(intent_templates.values())[0]))
        
        # Adjust for sentiment
        if sentiment['label'] == 'negative' and sentiment['score'] > 0.7:
            if language == 'hindi':
                response = f"Main samajh sakta hun. {response}"
            else:
                response = f"I understand your concerns. {response}"
        
        return response
    
    def _classify_intent(self, user_message: str) -> str:
        """Classify user intent from message"""
        msg = user_message.lower()
        if any(word in msg for word in ['interested', 'yes', 'accha', 'haan', 'good', 'great']):
            return 'interested'
        elif any(word in msg for word in ['what', 'kya', 'cloud', 'service', 'batao', 'tell']):
            return 'services'
        elif any(word in msg for word in ['price', 'cost', 'paisa', 'kitna', 'expensive', 'cheap']):
            return 'pricing'
        else:
            return 'interested'
    
    def _fallback_response(self, personality: str, language: str) -> Dict:
        """Emergency fallback response"""
        fallback_text = "Thank you for your time. Our team will be happy to assist you further."
        if language == 'hindi':
            fallback_text = "Aapke samay ke liye dhanyawad. Hamari team aapki aur madad karne mein khush hogi."
        
        return {
            'ai_response': fallback_text,
            'detected_language': language,
            'language_confidence': 0.5,
            'sentiment': {'label': 'neutral', 'score': 0.5},
            'personality': personality,
            'context_used': False
        }

# Global instance
ai_engine = LightweightResponseGenerator()