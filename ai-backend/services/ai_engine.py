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
        """Enhanced language detection with better Hindi support"""
        if user_preference in ['hi-IN', 'hindi']:
            return 'hindi', 1.0
        if user_preference in ['en-IN', 'english']:
            return 'english', 1.0
        
        try:
            text_lower = text.lower()
            
            # Enhanced Hindi word detection
            hindi_words = ['hai', 'kya', 'mein', 'main', 'aap', 'hum', 'baare', 'ke', 'se', 
                          'acha', 'accha', 'nahi', 'haan', 'paisa', 'rupaye', 'samay', 
                          'business', 'kaam', 'kaise', 'kahan', 'kab', 'kyun', 'kyu',
                          'batao', 'bolo', 'samjhao', 'chahiye', 'chahte', 'pasand',
                          'theek', 'sahi', 'galat', 'problem', 'pareshani', 'madad',
                          'help', 'service', 'company', 'team', 'price', 'cost']
            
            english_words = ['yes', 'no', 'good', 'bad', 'service', 'cloud', 'price', 
                           'cost', 'business', 'company', 'team', 'help', 'support',
                           'what', 'how', 'when', 'where', 'why', 'can', 'will',
                           'would', 'should', 'could', 'tell', 'show', 'explain']
            
            # Count matches
            hindi_count = sum(1 for word in hindi_words if word in text_lower)
            english_count = sum(1 for word in english_words if word in text_lower)
            
            # Use langdetect as secondary check
            detected_lang = 'en'
            try:
                detected_lang = detect(text)
            except:
                pass
            
            # Decision logic
            if hindi_count >= 2:  # Strong Hindi indicators
                return 'hindi', 0.9
            elif hindi_count > 0 and english_count > 0:  # Mixed (Hinglish)
                return 'hinglish', 0.8
            elif detected_lang == 'hi':
                return 'hindi', 0.8
            elif english_count >= 2:
                return 'english', 0.9
            else:
                return 'english', 0.7  # Default to English
                
        except Exception as e:
            logger.warning(f"Language detection failed: {e}")
            return 'english', 0.5

class LightweightSentimentAnalyzer:
    """Lightweight sentiment analysis using TextBlob only"""
    
    def __init__(self):
        # Enhanced abusive words in Hindi and English
        self.abusive_words = {
            'english': ['fuck', 'shit', 'damn', 'bastard', 'bitch', 'asshole', 'idiot', 
                       'stupid', 'moron', 'dumb', 'fool', 'loser', 'suck', 'sucks',
                       'hate', 'worst', 'terrible', 'awful', 'garbage', 'trash'],
            'hindi': ['chutiya', 'madarchod', 'bhenchod', 'randi', 'saala', 'kamina', 
                     'harami', 'gandu', 'bakchod', 'bhosdike', 'laude', 'lodu',
                     'gaandu', 'chodu', 'randwa', 'kutiya', 'kutta', 'pagal',
                     'bewakoof', 'gadha', 'ullu']
        }
    
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
    
    def detect_abusive_content(self, text: str) -> Dict[str, bool]:
        """Enhanced abusive content detection with partial matching"""
        text_lower = text.lower()
        
        # Check for exact matches
        english_abuse = any(word in text_lower for word in self.abusive_words['english'])
        hindi_abuse = any(word in text_lower for word in self.abusive_words['hindi'])
        
        # Check for partial matches (for variations)
        if not english_abuse:
            for word in self.abusive_words['english']:
                if len(word) > 4:  # Only check longer words for partial matches
                    if word[:4] in text_lower or word[:-1] in text_lower:
                        english_abuse = True
                        break
        
        if not hindi_abuse:
            for word in self.abusive_words['hindi']:
                if len(word) > 4:
                    if word[:4] in text_lower or word[:-1] in text_lower:
                        hindi_abuse = True
                        break
        
        return {
            'is_abusive': english_abuse or hindi_abuse,
            'english_abuse': english_abuse,
            'hindi_abuse': hindi_abuse
        }

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
                              voice_settings: Dict, call_sid: str = None, knowledge_base: List = None) -> Dict:
        """Generate dynamic AI response with full context"""
        try:
            # Language detection
            language, lang_confidence = self.language_detector.detect_language(
                user_message, voice_settings.get('language', 'auto')
            )
            
            # Sentiment analysis
            sentiment = self.sentiment_analyzer.analyze_sentiment(user_message)
            
            # Abusive content detection
            abuse_detection = self.sentiment_analyzer.detect_abusive_content(user_message)
            
            # Get conversation context
            context = self.memory.get_context(call_sid) if call_sid else []
            
            # Generate response using OpenAI or templates
            personality = voice_settings.get('personality', 'priyanshu')
            response_text = await self._generate_llm_response(
                user_message, personality, language, sentiment, context, call_data, knowledge_base or [], abuse_detection
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
                'context_used': len(context) > 0,
                'abusive_detected': abuse_detection['is_abusive']
            }
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            return self._fallback_response(voice_settings.get('personality', 'priyanshu'), language)
    
    async def _generate_llm_response(self, user_message: str, personality: str, 
                                   language: str, sentiment: Dict, context: List, 
                                   call_data: Dict, knowledge_base: List, abuse_detection: Dict = None) -> str:
        """Generate response using OpenAI GPT with fallback to templates"""
        # Check if OpenAI API key is available
        if not self.openai_client:
            logger.info("OpenAI not available, using enhanced template responses")
            return self._get_enhanced_template_response(user_message, personality, language, call_data, sentiment, context, knowledge_base, abuse_detection)
        
        # Handle abusive content
        if abuse_detection and abuse_detection.get('is_abusive'):
            return self._get_abusive_response(personality, language)
        
        try:
            # Build context-aware prompt
            system_prompt = self.personality_engine.get_personality_prompt(personality, language, sentiment)
            
            # Add business context
            company_name = call_data.get('companyName', 'our company')
            information = call_data.get('information', '')
            
            # Add knowledge base context if available
            kb_context = ""
            if knowledge_base:
                kb_content = "\n".join([f"- {kb.get('title', '')}: {kb.get('content', '')[:200]}..." for kb in knowledge_base[:3]])
                kb_context = f"\n\nCompany Knowledge Base:\n{kb_content}"
            
            context_prompt = f"""
Business Context:
- Company: {company_name}
- Service Info: {information}{kb_context}
- This is a B2B voice call for cloud services

Previous conversation: {json.dumps(context[-2:]) if context else 'None'}

User said: "{user_message}"

Respond as {personality} in {language}. Focus on:
1. Use knowledge base info to answer specific questions
2. Addressing user's specific question/concern
3. Mentioning relevant services from knowledge base
4. Offering to connect with technical team if appropriate
5. Matching user's emotional tone
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
            return self._get_enhanced_template_response(user_message, personality, language, call_data, sentiment, context, knowledge_base)
    
    def _get_enhanced_template_response(self, user_message: str, personality: str, 
                                      language: str, call_data: Dict, sentiment: Dict, context: List, knowledge_base: List = None, abuse_detection: Dict = None) -> str:
        """Enhanced template responses with sentiment, context awareness AND knowledge base integration"""
        # Handle abusive content first
        if abuse_detection and abuse_detection.get('is_abusive'):
            return self._get_abusive_response(personality, language)
        
        company_name = call_data.get('companyName', 'our company')
        
        # Classify intent
        intent = self._classify_intent(user_message)
        
        # Search knowledge base for relevant content
        relevant_kb_info = self._search_knowledge_base(user_message, knowledge_base or [])
        
        # Get base templates with knowledge base integration
        response = self._get_kb_enhanced_response(personality, language, intent, company_name, relevant_kb_info, sentiment)
        
        # Adjust for sentiment
        if sentiment['label'] == 'negative' and sentiment['score'] > 0.7:
            if language == 'hindi':
                response = f"Main samajh sakta hun aapki pareshani. {response}"
            else:
                response = f"I understand your concerns. {response}"
        elif sentiment['label'] == 'positive' and sentiment['score'] > 0.7:
            if language == 'hindi':
                response = f"Bahut khushi ki baat hai! {response}"
            else:
                response = f"That's wonderful to hear! {response}"
        
        return response
    
    def _search_knowledge_base(self, user_message: str, knowledge_base: List) -> str:
        """Search knowledge base for relevant content based on user message"""
        if not knowledge_base:
            return ""
        
        user_msg_lower = user_message.lower()
        relevant_content = []
        match_scores = []
        
        # Enhanced search with better matching
        for kb_item in knowledge_base:
            content = kb_item.get('content', '').lower()
            title = kb_item.get('title', '').lower()
            
            # Get meaningful words (3+ characters, not common words)
            user_words = [word for word in user_msg_lower.split() 
                         if len(word) > 2 and word not in ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'hai', 'aur', 'kya', 'koi']]
            
            score = 0
            matched_words = []
            
            # Score based on word matches
            for word in user_words:
                if word in content:
                    score += 2  # Content match
                    matched_words.append(word)
                elif word in title:
                    score += 3  # Title match (higher priority)
                    matched_words.append(word)
                # Partial matches
                elif any(word in content_word for content_word in content.split() if len(content_word) > 4):
                    score += 1
            
            if score > 0:
                match_scores.append((score, kb_item, matched_words))
        
        # Sort by score and return best matches
        if match_scores:
            match_scores.sort(key=lambda x: x[0], reverse=True)
            # Return top 2 matches with highest scores
            top_matches = match_scores[:2]
            relevant_content = [item[1].get('content', '')[:400] for item in top_matches]
            return " ".join(relevant_content)
        
        # If no matches found, return first KB item as fallback
        if knowledge_base:
            return knowledge_base[0].get('content', '')[:400]
        
        return ""
    
    def _get_kb_enhanced_response(self, personality: str, language: str, intent: str, 
                                company_name: str, kb_info: str, sentiment: Dict) -> str:
        """Generate response prioritizing knowledge base content over business templates"""
        
        # PRIORITY 1: Use knowledge base content if available and relevant
        if kb_info and len(kb_info.strip()) > 20:  # Ensure meaningful content
            # Personality-based response templates with ACTUAL knowledge base content
            if language in ['hindi', 'hinglish']:
                templates = {
                    'priyanshu': f"Hamare knowledge base ke anusaar: {kb_info[:250]}... Kya aap chahenge ki main aapko technical team se connect kar dun more details ke liye?",
                    'tanmay': f"Wow! Hamare knowledge base mein ye amazing info hai: {kb_info[:250]}... Ye bahut exciting hai! More details ke liye team se connect karna chahenge?",
                    'ekta': f"Hamare official documentation ke anusaar: {kb_info[:250]}... Kya main respectfully comprehensive information ke liye specialists arrange kar sakti hun?",
                    'priyanka': f"Technical perspective se, hamare documentation shows: {kb_info[:250]}... Detailed specifications ke liye solutions architect se connect karna chahenge?"
                }
            else:  # English
                templates = {
                    'priyanshu': f"Based on our knowledge base: {kb_info[:250]}... Would you like me to connect you with our technical team for more detailed information?",
                    'tanmay': f"Oh wow! Here's what our knowledge base says: {kb_info[:250]}... This is so exciting! Want to get connected with our team for more details?",
                    'ekta': f"According to our official documentation: {kb_info[:250]}... May I respectfully arrange a consultation with our specialists for comprehensive information?",
                    'priyanka': f"From a technical perspective, our documentation shows: {kb_info[:250]}... Shall I connect you with our solutions architect for detailed specifications?"
                }
            
            return templates.get(personality, templates['priyanshu'])
        
        # PRIORITY 2: Fallback to generic business responses only if NO KB content
        if language in ['hindi', 'hinglish']:
            templates = {
                'priyanshu': f"Aapke sawal ke liye dhanyawad. {company_name} comprehensive business solutions provide karta hai. Main aapko technical team se connect karne mein madad kar sakta hun.",
                'tanmay': f"Wow, bahut accha question! {company_name} ke paas amazing business solutions hain! Kya main aapko hamare awesome team se connect kar dun?",
                'ekta': f"Aapki inquiry appreciate karti hun. {company_name} comprehensive business solutions provide karta hai. Kya main specialists ke saath consultation arrange kar sakti hun?",
                'priyanka': f"Technical perspective se, {company_name} comprehensive business solutions implement karta hai. Solutions architect se connect karna chahenge?"
            }
        else:  # English
            templates = {
                'priyanshu': f"Thank you for your inquiry. {company_name} offers comprehensive business solutions. I'd be happy to connect you with our technical team for detailed information.",
                'tanmay': f"Oh wow, great question! {company_name} has some amazing business solutions! This is so exciting! Want me to get you connected with our awesome team?",
                'ekta': f"I appreciate your inquiry. {company_name} provides comprehensive business solutions. May I respectfully arrange a consultation with our distinguished specialists?",
                'priyanka': f"From a technical perspective, {company_name} implements comprehensive business solutions. Shall I connect you with our solutions architect for detailed technical specifications?"
            }
        
        return templates.get(personality, templates['priyanshu'])
    
    def _classify_intent(self, user_message: str) -> str:
        """Dynamic intent classification with scoring system"""
        msg = user_message.lower()
        
        # Enhanced intent keywords with weights
        intent_patterns = {
            'services': {
                'keywords': ['service', 'offer', 'provide', 'do', 'kya', 'seva', 'product', 'solution', 'help', 'support', 'feature', 'capability'],
                'phrases': ['what do you', 'kya aap', 'tell me about', 'batao', 'explain', 'samjhao'],
                'weight': 1.0
            },
            'pricing': {
                'keywords': ['price', 'cost', 'rate', 'fee', 'paisa', 'kitna', 'amount', 'charge', 'expensive', 'cheap', 'budget', 'plan'],
                'phrases': ['how much', 'kitna paisa', 'cost me', 'price for', 'rate card'],
                'weight': 1.2
            },
            'interested': {
                'keywords': ['interested', 'yes', 'accha', 'haan', 'good', 'great', 'amazing', 'perfect', 'excellent', 'wonderful'],
                'phrases': ['sounds good', 'accha lagta', 'i like', 'pasand hai'],
                'weight': 0.8
            },
            'contact': {
                'keywords': ['contact', 'phone', 'email', 'address', 'sampark', 'call', 'reach', 'connect', 'meeting'],
                'phrases': ['get in touch', 'sampark karna', 'call me', 'contact details'],
                'weight': 1.1
            },
            'complaint': {
                'keywords': ['problem', 'issue', 'complaint', 'wrong', 'error', 'galat', 'pareshani', 'dikkat', 'bad'],
                'phrases': ['not working', 'kaam nahi', 'having trouble', 'problem hai'],
                'weight': 1.3
            },
            'demo': {
                'keywords': ['demo', 'show', 'example', 'trial', 'test', 'dikhao', 'example', 'sample'],
                'phrases': ['show me', 'dikhao mujhe', 'can i see', 'demo chahiye'],
                'weight': 1.0
            }
        }
        
        intent_scores = {}
        
        # Calculate scores for each intent
        for intent, patterns in intent_patterns.items():
            score = 0
            
            # Check keywords
            for keyword in patterns['keywords']:
                if keyword in msg:
                    score += patterns['weight']
            
            # Check phrases (higher weight)
            for phrase in patterns['phrases']:
                if phrase in msg:
                    score += patterns['weight'] * 1.5
            
            intent_scores[intent] = score
        
        # Return intent with highest score, or 'interested' as default
        if max(intent_scores.values()) > 0:
            return max(intent_scores, key=intent_scores.get)
        else:
            return 'interested'
    
    def _get_abusive_response(self, personality: str, language: str) -> str:
        """Generate appropriate response for abusive content"""
        responses = {
            'english': "I understand you may be frustrated, but I'd appreciate if we could keep our conversation respectful. How can I help you today?",
            'hindi': "Main samajh sakta hun aap pareshaan ho sakte hain, lekin main appreciate karunga agar hum apni conversation respectful rakh saken. Aaj main aapki kaise madad kar sakta hun?"
        }
        return responses.get(language, responses['english'])
    
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