"""
Lightweight AI Engine - No Heavy Packages (torch, transformers)
Dynamic responses with basic sentiment analysis using TextBlob
"""
import os
import logging
import warnings
from typing import Dict, List, Tuple, Optional
from langdetect import detect, DetectorFactory
from textblob import TextBlob
import openai
import json

# Suppress TextBlob regex warnings
warnings.filterwarnings("ignore", category=SyntaxWarning, module="textblob")

# Set seed for consistent language detection
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)

class ConversationStateManager:
    """Manages conversation stages and flow for natural dialogue"""
    
    STAGES = {
        'greeting': {
            'next': 'introduction',
            'max_turns': 1
        },
        'introduction': {
            'next': 'needs_assessment',
            'max_turns': 2
        },
        'needs_assessment': {
            'next': 'solution_pitch',
            'max_turns': 3
        },
        'solution_pitch': {
            'next': 'objection_handling',
            'max_turns': 4
        },
        'objection_handling': {
            'next': 'closing',
            'max_turns': 3
        },
        'closing': {
            'next': 'escalation',
            'max_turns': 2
        },
        'escalation': {
            'next': None,
            'max_turns': 1
        }
    }
    
    def __init__(self):
        self.call_stages = {}  # {call_sid: {stage, turn_count}}
    
    def get_current_stage(self, call_sid: str) -> str:
        """Get current conversation stage"""
        if call_sid not in self.call_stages:
            self.call_stages[call_sid] = {'stage': 'greeting', 'turn_count': 0}
        return self.call_stages[call_sid]['stage']
    
    def advance_stage(self, call_sid: str, force_stage: str = None):
        """Move to next conversation stage"""
        if call_sid not in self.call_stages:
            self.call_stages[call_sid] = {'stage': 'greeting', 'turn_count': 0}
        
        current = self.call_stages[call_sid]
        current['turn_count'] += 1
        
        stage_config = self.STAGES[current['stage']]
        
        # Force stage change if specified
        if force_stage and force_stage in self.STAGES:
            current['stage'] = force_stage
            current['turn_count'] = 0
        # Auto-advance if max turns reached
        elif current['turn_count'] >= stage_config['max_turns']:
            next_stage = stage_config['next']
            if next_stage:
                current['stage'] = next_stage
                current['turn_count'] = 0
    
    def should_escalate(self, call_sid: str) -> bool:
        """Check if conversation should escalate to human"""
        stage = self.get_current_stage(call_sid)
        return stage == 'escalation'

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
        """Enhanced language detection with better Hindi and Hinglish support"""
        # Respect explicit language preferences
        if user_preference in ['hi-IN', 'hindi']:
            return 'hindi', 1.0
        if user_preference in ['en-IN', 'english']:
            return 'english', 1.0
        
        try:
            text_lower = text.lower()
            
            # EXPANDED Hindi word list with common phrases
            hindi_words = [
                # Common verbs
                'hai', 'hain', 'tha', 'the', 'hoga', 'hogi', 'karna', 'karne', 'kiya', 'karo',
                # Question words
                'kya', 'kaise', 'kahan', 'kab', 'kyun', 'kyu', 'kaun', 'kitna', 'kitne', 'kaunsa',
                # Pronouns
                'mein', 'main', 'aap', 'hum', 'tum', 'yeh', 'woh', 'ye', 'wo', 'iska', 'uska',
                # Common phrases
                'baare', 'ke', 'se', 'meh', 'ko', 'ka', 'ki', 'ne', 'par', 'tak',
                # Adjectives
                'acha', 'accha', 'achha', 'bura', 'theek', 'thik', 'sahi', 'galat', 'badiya',
                # Responses
                'nahi', 'nahin', 'haan', 'ji', 'bilkul', 'zaroor', 'shayad', 'pakka',
                # Business terms
                'paisa', 'paise', 'rupaye', 'rupee', 'samay', 'waqt', 'business', 
                'kaam', 'service', 'madad', 'help', 'jarurat', 'chahiye',
                # Action words
                'batao', 'bolo', 'samjhao', 'dikhao', 'chahiye', 'chahte', 'pasand',
                'problem', 'pareshani', 'dikkat', 'mushkil', 'suniye', 'dekhiye',
                # Common fillers
                'toh', 'phir', 'aur', 'ya', 'lekin', 'par', 'matlab', 'agar', 'jab'
            ]
            
            english_words = [
                'yes', 'no', 'good', 'bad', 'okay', 'ok', 'fine', 'great', 'nice', 'sure',
                'service', 'cloud', 'price', 'cost', 'business', 'company', 'team',
                'help', 'support', 'please', 'thank', 'thanks', 'sorry', 'welcome',
                'what', 'how', 'when', 'where', 'why', 'who', 'which', 'whose',
                'can', 'will', 'would', 'should', 'could', 'may', 'might', 'must',
                'tell', 'show', 'explain', 'need', 'want', 'like', 'have', 'get',
                'know', 'think', 'see', 'understand', 'interested', 'looking'
            ]
            
            # Count word matches
            words_in_text = text_lower.split()
            hindi_matches = sum(1 for word in words_in_text if word in hindi_words)
            english_matches = sum(1 for word in words_in_text if word in english_words)
            
            total_words = len(words_in_text)
            hindi_ratio = hindi_matches / total_words if total_words > 0 else 0
            english_ratio = english_matches / total_words if total_words > 0 else 0
            
            logger.info(f"Language detection - Hindi: {hindi_matches}/{total_words} ({hindi_ratio:.2f}), English: {english_matches}/{total_words} ({english_ratio:.2f})")
            
            # Use langdetect as secondary check
            detected_lang = 'en'
            try:
                detected_lang = detect(text)
            except:
                pass
            
            # Enhanced decision logic with LOWER thresholds for Hinglish
            if hindi_ratio >= 0.25:  # At least 25% Hindi words
                if english_ratio >= 0.25:  # Also has English - HINGLISH
                    logger.info("Detected language: HINGLISH")
                    return 'hinglish', 0.85
                logger.info("Detected language: HINDI")
                return 'hindi', 0.9
            elif detected_lang == 'hi':
                logger.info("Detected language: HINDI (via langdetect)")
                return 'hindi', 0.8
            elif english_ratio >= 0.3:
                logger.info("Detected language: ENGLISH")
                return 'english', 0.9
            else:
                # Default based on langdetect
                result_lang = 'english' if detected_lang == 'en' else 'hinglish'
                logger.info(f"Detected language: {result_lang.upper()} (default)")
                return result_lang, 0.7
                
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
        self.openai_client = None
        try:
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key and api_key != 'your_openai_api_key_here':
                # Simple initialization without extra parameters
                import openai as openai_module
                self.openai_client = openai_module.OpenAI(api_key=api_key)
                logger.info("OpenAI client initialized successfully")
            else:
                logger.info("OpenAI API key not configured, using template responses")
        except Exception as e:
            logger.warning(f"OpenAI client init failed: {e}")
            self.openai_client = None
            
        self.memory = ConversationMemory()
        self.language_detector = LightweightLanguageDetector()
        self.sentiment_analyzer = LightweightSentimentAnalyzer()
        self.personality_engine = PersonalityEngine()
    
    async def generate_response(self, user_message: str, call_data: Dict, 
                              voice_settings: Dict, call_sid: str = None, 
                              knowledge_base: List = None) -> Dict:
        """Generate dynamic AI response with stage-based conversation flow"""
        try:
            # Initialize state manager if not exists
            if not hasattr(self, 'state_manager'):
                self.state_manager = ConversationStateManager()
            
            # Get current conversation stage
            current_stage = self.state_manager.get_current_stage(call_sid) if call_sid else 'greeting'
            logger.info(f"Current conversation stage: {current_stage}")
            
            # Language detection
            language, lang_confidence = self.language_detector.detect_language(
                user_message, voice_settings.get('language', 'auto')
            )
            
            # Sentiment analysis
            sentiment = self.sentiment_analyzer.analyze_sentiment(user_message)
            
            # Abusive content detection
            abuse_detection = self.sentiment_analyzer.detect_abusive_content(user_message)
            
            # Handle abusive content immediately
            if abuse_detection['is_abusive']:
                logger.warning(f"Abusive content detected in call {call_sid}")
                response_text = self._get_abusive_response(
                    voice_settings.get('personality', 'priyanshu'), 
                    language
                )
                return {
                    'ai_response': response_text,
                    'detected_language': language,
                    'language_confidence': lang_confidence,
                    'sentiment': sentiment,
                    'personality': voice_settings.get('personality', 'priyanshu'),
                    'context_used': False,
                    'conversation_stage': current_stage,
                    'abusive_detected': True
                }
            
            # Get conversation context
            context = self.memory.get_context(call_sid) if call_sid else []
            logger.info(f"Conversation context: {len(context)} previous exchanges")
            
            # Classify intent
            intent = self._classify_intent(user_message)
            logger.info(f"Detected intent: {intent}")
            
            # Search knowledge base
            relevant_kb_info = self._search_knowledge_base(user_message, knowledge_base or [])
            logger.info(f"KB search returned {len(relevant_kb_info)} chars of content")
            
            # Generate response
            personality = voice_settings.get('personality', 'priyanshu')
            company_name = call_data.get('companyName', 'our company')
            
            # Check if user explicitly requests human agent
            escalation_keywords = ['human', 'agent', 'representative', 'person', 'insaan', 'vyakti', 'team member', 'specialist']
            user_wants_escalation = any(keyword in user_message.lower() for keyword in escalation_keywords)
            
            if user_wants_escalation:
                logger.info("User requested escalation explicitly")
                if call_sid:
                    self.state_manager.advance_stage(call_sid, force_stage='escalation')
                current_stage = 'escalation'
            
            # Generate response based on stage
            response_text = self._get_stage_based_response(
                stage=current_stage,
                intent=intent,
                language=language,
                personality=personality,
                kb_info=relevant_kb_info,
                company_name=company_name,
                sentiment=sentiment,
                user_message=user_message
            )
            
            logger.info(f"Generated response: {response_text[:100]}...")
            
            # Advance conversation stage naturally (if not escalating)
            if call_sid and not user_wants_escalation:
                self.state_manager.advance_stage(call_sid)
            
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
                'conversation_stage': self.state_manager.get_current_stage(call_sid) if call_sid else current_stage,
                'should_escalate': self.state_manager.should_escalate(call_sid) if call_sid else False,
                'abusive_detected': False
            }
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            logger.error(f"Stack trace: ", exc_info=True)
            return self._fallback_response(
                voice_settings.get('personality', 'priyanshu'), 
                language if 'language' in locals() else 'english'
            )
    
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
    
    def _get_stage_based_response(self, stage: str, intent: str, language: str, 
                                  personality: str, kb_info: str, 
                                  company_name: str, sentiment: Dict, 
                                  user_message: str) -> str:
        """Generate response based on conversation stage"""
        
        logger.info(f"Generating stage-based response: stage={stage}, intent={intent}, language={language}")
        
        # Stage-specific response templates
        if stage == 'greeting':
            if language == 'hindi':
                return f"Namaste! Main {personality} bol raha hun {company_name} se. Aap kaise hain?"
            elif language == 'hinglish':
                return f"Hello! Main {personality} hun {company_name} se. Aap kaise hain? How can I help you?"
            else:
                return f"Hello! I'm {personality} from {company_name}. How are you doing today?"
        
        elif stage == 'introduction':
            if kb_info:
                if language == 'hindi':
                    return f"Dhanyawad! Hamare paas ye services hain: {kb_info[:150]}. Kya aap is baare mein aur jaanna chahenge?"
                elif language == 'hinglish':
                    return f"Thank you! Hamare paas ye hai: {kb_info[:150]}. Kya aap interested hain to know more?"
                else:
                    return f"Great! We specialize in: {kb_info[:150]}. Would you like to hear more about this?"
            else:
                if language == 'hindi':
                    return f"{company_name} comprehensive business solutions provide karta hai. Aapko kis service ke baare mein jaanna hai?"
                else:
                    return f"{company_name} provides comprehensive business solutions. What specific service interests you?"
        
        elif stage == 'needs_assessment':
            # Ask probing questions based on intent
            if intent == 'pricing':
                if language == 'hindi':
                    return "Pricing aapke requirements par depend karti hai. Aap kitne users ke liye solution chahte hain?"
                elif language == 'hinglish':
                    return "Pricing depends on your requirements. Kitne users ke liye chahiye?"
                else:
                    return "Our pricing depends on your requirements. How many users would you need this for?"
            elif intent == 'services':
                if language == 'hindi':
                    return f"Bilkul! Hamare paas multiple services hain. {kb_info[:200] if kb_info else 'Cloud, hosting, aur support services'}. Aapki company ki specific need kya hai?"
                elif language == 'hinglish':
                    return f"Absolutely! We offer {kb_info[:200] if kb_info else 'cloud, hosting, support services'}. Aapki specific need kya hai?"
                else:
                    return f"Absolutely! We offer {kb_info[:200] if kb_info else 'cloud, hosting, and support services'}. What's your company's specific need?"
        
        elif stage == 'solution_pitch':
            if kb_info:
                if language == 'hindi':
                    return f"Perfect! Hamare solution mein ye features hain: {kb_info[:250]}. Ye aapki needs match kar raha hai. Kya aap demo dekhna chahenge?"
                elif language == 'hinglish':
                    return f"Perfect! Our solution includes: {kb_info[:250]}. This matches your needs. Demo dekhna chahenge?"
                else:
                    return f"Perfect! Our solution includes: {kb_info[:250]}. This aligns well with your needs. Would you like to see a demo?"
            else:
                if language == 'hindi':
                    return f"Hamare solution se aap 30-40% cost save kar sakte hain aur 24/7 support milega. Kya ye interesting lagta hai?"
                elif language == 'hinglish':
                    return "Our solution saves 30-40% cost with 24/7 support. Interesting lagta hai?"
                else:
                    return "Our solution can save you 30-40% on costs with 24/7 support included. Does this sound interesting?"
        
        elif stage == 'objection_handling':
            if sentiment['label'] == 'negative':
                if language == 'hindi':
                    return "Main samajh sakta hun aapki concern. Kya main aapko specific details share kar sakta hun jo aapki pareshani solve karenge?"
                elif language == 'hinglish':
                    return "I understand your concern. Kya main specific details share kar sakta hun?"
                else:
                    return "I understand your concern. Can I share specific details that address your worry?"
            else:
                if language == 'hindi':
                    return "Kya aapko koi aur question hai? Ya koi specific concern jo discuss karna chahenge?"
                elif language == 'hinglish':
                    return "Any other questions? Koi specific concern hai?"
                else:
                    return "Do you have any other questions or specific concerns you'd like to discuss?"
        
        elif stage == 'closing':
            if 'yes' in user_message.lower() or 'haan' in user_message.lower() or 'interested' in user_message.lower():
                if language == 'hindi':
                    return "Bahut accha! Main aapko hamare technical specialist se connect kar raha hun jo aapko detailed discussion provide karenge. Ek minute rukiye."
                elif language == 'hinglish':
                    return "Excellent! Let me connect you with our specialist. Ek minute please."
                else:
                    return "Excellent! Let me connect you with our technical specialist who can provide a detailed discussion. Please hold for a moment."
            else:
                if language == 'hindi':
                    return "Koi baat nahi. Kya aap chahenge ki main apni team se aapko call back karwa dun later?"
                elif language == 'hinglish':
                    return "No problem. Kya aap callback chahenge?"
                else:
                    return "No problem. Would you like our team to call you back later?"
        
        elif stage == 'escalation':
            if language == 'hindi':
                return "Main aapko abhi hamare senior consultant se connect kar raha hun. Dhanyawad aapki patience ke liye!"
            elif language == 'hinglish':
                return "Connecting you with our consultant now. Thank you for patience!"
            else:
                return "I'm connecting you with our senior consultant now. Thank you for your patience!"
        
        # Fallback
        if language == 'hindi':
            return "Main samajh gaya. Aur kya jaanna chahenge aap?"
        elif language == 'hinglish':
            return "I understand. Aur kya details chahiye?"
        else:
            return "I understand. Can you tell me more about what you're looking for?"

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