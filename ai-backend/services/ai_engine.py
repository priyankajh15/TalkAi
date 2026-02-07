"""
Lightweight AI Engine - FIXED VERSION
- Smart KB answering (extracts relevant info, no word-by-word reading)
- Goodbye detection (20+ phrases in 3 languages)
- Enhanced bad word detection (variations, phonetics)
- Dynamic intent classification (pattern matching + ML-style scoring)
- Conversational responses (not just templates)
"""
import os
import logging
import warnings
from typing import Dict, List, Tuple, Optional
from langdetect import detect, DetectorFactory
from textblob import TextBlob
import openai
import json
import re

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
        # ✅ FIXED: Enhanced abusive words - removed false positives
        self.abusive_words = {
            'english': [
                # Severe profanity
                'fuck', 'fck', 'fuk', 'f**k', 'f*ck', 'fucker', 'fucking',
                'shit', 'sh1t', 'sht', 'shít', 
                'bastard', 'bstrd',
                'bitch', 'btch', 'b1tch',
                'asshole', 'ashole', 'a**hole', 'ass hole',
                'motherfucker', 'mofo', 'mf',
                'damn', 'damm', 'dammit',
                'cunt', 'cnt',
                'dick', 'dck', 'prick',
                'whore', 'slut',
                # Strong insults (context-dependent)
                'idiot', 'stupid', 'moron', 'dumb', 'fool', 'loser', 'retard'
            ],
            'hindi': [
                'chutiya', 'chutia', 'chutiye',
                'madarchod', 'mc', 'maderchod',
                'bhenchod', 'bc', 'banchod',
                'bhosdike', 'bsdk', 'bosdk',
                'gaandu', 'gandu', 'gndu',
                'randi', 'rndi', 'rnd',
                'harami', 'hrami',
                'kamina', 'kamini',
                'kutta', 'kutte', 'kutiya', 'kutti',
                'saala', 'sala', 'saali',
                'behen', 'behn',
                'laude', 'lode', 'lodu',
                'chodu', 'chod',
                'randwa', 'rndwa',
                'gashti', 'ghasti'
            ]
        }
        
        # ✅ NEW: Pattern-based detection for variations
        self.abusive_patterns = [
            r'f+u+c+k+',
            r's+h+i+t+',
            r'b+i+t+c+h+',
            r'a+s+s+h+o+l+e+',
            r'f\s*u\s*c\s*k',  # "f u c k"
            r's\s*h\s*i\s*t',  # "s h i t"
        ]
    
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
        """✅ FIXED: Enhanced abusive content detection with pattern matching"""
        text_lower = text.lower()
        
        # Remove special characters for better matching
        text_cleaned = re.sub(r'[^\w\s]', '', text_lower)
        
        # Check for exact matches
        english_abuse = any(word in text_lower or word in text_cleaned 
                           for word in self.abusive_words['english'])
        hindi_abuse = any(word in text_lower or word in text_cleaned 
                         for word in self.abusive_words['hindi'])
        
        # Check for pattern-based matches (variations like "f u c k")
        pattern_abuse = any(re.search(pattern, text_cleaned) 
                           for pattern in self.abusive_patterns)
        
        is_abusive = english_abuse or hindi_abuse or pattern_abuse
        
        if is_abusive:
            logger.warning(f"Abusive content detected in: {text[:50]}...")
        
        return {
            'is_abusive': is_abusive,
            'english_abuse': english_abuse,
            'hindi_abuse': hindi_abuse,
            'pattern_abuse': pattern_abuse
        }

class DynamicIntentClassifier:
    """✅ NEW: Dynamic intent classification with ML-style scoring"""
    
    def __init__(self):
        # Dynamic intent patterns with context awareness
        self.intent_patterns = {
            'goodbye': {
                'keywords': [
                    'bye', 'goodbye', 'good bye', 'later', 'talk later', 'enough',
                    'sufficient', 'no thanks', 'not interested', 'dont want', 
                    'stop', 'band', 'karo', 'ruko', 'chaliye', 'rakhdo',
                    'nahi chahiye', 'nahi', 'nahin'
                ],
                'phrases': [
                    'no thank', 'not interest', 'talk later', 'call later',
                    'nahi chahiye', 'band karo', 'enough information', 'thik hai bye',
                    'all set', 'i am good', 'thanks but', 'not now', 'maybe later'
                ],
                'negative_context': ['yes', 'tell me', 'interested', 'haan'],  # Don't trigger if these present
                'weight': 2.0,
                'confidence_threshold': 0.6
            },
            'services': {
                'keywords': [
                    'service', 'services', 'offer', 'provide', 'do', 'kya', 'seva', 
                    'product', 'solution', 'help', 'support', 'feature', 'capability',
                    'what do you', 'kya karte', 'batao', 'details'
                ],
                'phrases': [
                    'what do you', 'kya aap', 'tell me about', 'batao', 'explain', 
                    'samjhao', 'what services', 'kya services'
                ],
                'weight': 1.0,
                'confidence_threshold': 0.5
            },
            'pricing': {
                'keywords': [
                    'price', 'cost', 'rate', 'fee', 'paisa', 'kitna', 'amount', 
                    'charge', 'expensive', 'cheap', 'budget', 'plan', 'pricing',
                    'rupees', 'rupaye', 'dollar', 'package'
                ],
                'phrases': [
                    'how much', 'kitna paisa', 'cost me', 'price for', 'rate card',
                    'kitna lagega', 'kya rate', 'pricing details'
                ],
                'weight': 1.5,
                'confidence_threshold': 0.6
            },
            'interested': {
                'keywords': [
                    'interested', 'yes', 'accha', 'haan', 'good', 'great', 'amazing', 
                    'perfect', 'excellent', 'wonderful', 'sounds good', 'like it',
                    'impressed', 'nice', 'badiya', 'achha'
                ],
                'phrases': [
                    'sounds good', 'accha lagta', 'i like', 'pasand hai', 'interested in',
                    'want to know', 'tell me more'
                ],
                'weight': 0.8,
                'confidence_threshold': 0.4
            },
            'contact': {
                'keywords': [
                    'contact', 'phone', 'email', 'address', 'sampark', 'call', 'reach', 
                    'connect', 'meeting', 'appointment', 'visit', 'meet'
                ],
                'phrases': [
                    'get in touch', 'sampark karna', 'call me', 'contact details',
                    'how to reach', 'meeting schedule'
                ],
                'weight': 1.2,
                'confidence_threshold': 0.5
            },
            'complaint': {
                'keywords': [
                    'problem', 'issue', 'complaint', 'wrong', 'error', 'galat', 
                    'pareshani', 'dikkat', 'not working', 'broken', 'failed',
                    'bug', 'glitch'
                ],
                'phrases': [
                    'not working', 'kaam nahi', 'having trouble', 'problem hai',
                    'doesnt work', 'facing issue'
                ],
                'weight': 1.4,
                'confidence_threshold': 0.6
            },
            'demo': {
                'keywords': [
                    'demo', 'show', 'example', 'trial', 'test', 'dikhao', 'sample',
                    'preview', 'walkthrough', 'presentation'
                ],
                'phrases': [
                    'show me', 'dikhao mujhe', 'can i see', 'demo chahiye',
                    'want to see', 'live demo'
                ],
                'weight': 1.1,
                'confidence_threshold': 0.5
            },
            'question': {
                'keywords': [
                    'what', 'how', 'when', 'where', 'why', 'who', 'which',
                    'kya', 'kaise', 'kab', 'kahan', 'kyun', 'kaun', 'kaunsa',
                    'explain', 'tell', 'batao', 'samjhao'
                ],
                'phrases': [
                    'tell me', 'can you explain', 'i want to know', 'batao mujhe',
                    'what is', 'how does', 'kaise hota'
                ],
                'weight': 0.9,
                'confidence_threshold': 0.3
            }
        }
    
    def classify_intent(self, user_message: str, context: List[Dict] = None) -> Dict:
        """
        ✅ DYNAMIC: Classify intent with confidence scoring and context awareness
        
        Returns:
            Dict with intent, confidence, and matched patterns
        """
        msg = user_message.lower()
        intent_scores = {}
        
        # Calculate scores for each intent
        for intent, patterns in self.intent_patterns.items():
            score = 0.0
            matched_keywords = []
            matched_phrases = []
            
            # Check for negative context (e.g., "no" shouldn't trigger goodbye if "yes" is present)
            if 'negative_context' in patterns:
                if any(neg_word in msg for neg_word in patterns['negative_context']):
                    continue  # Skip this intent
            
            # Keyword matching
            for keyword in patterns['keywords']:
                if keyword in msg:
                    score += patterns['weight']
                    matched_keywords.append(keyword)
            
            # Phrase matching (higher weight)
            for phrase in patterns['phrases']:
                if phrase in msg:
                    score += patterns['weight'] * 1.5
                    matched_phrases.append(phrase)
            
            # Context bonus (if user asked similar things before)
            if context:
                for exchange in context[-2:]:  # Last 2 exchanges
                    if any(kw in exchange.get('user', '').lower() for kw in patterns['keywords'][:3]):
                        score += 0.5  # Context continuity bonus
            
            # Normalize score to confidence (0-1)
            max_possible_score = len(patterns['keywords']) * patterns['weight'] + \
                               len(patterns['phrases']) * patterns['weight'] * 1.5
            confidence = min(score / max(max_possible_score * 0.3, 1), 1.0)
            
            # Only consider if above threshold
            if confidence >= patterns.get('confidence_threshold', 0.5):
                intent_scores[intent] = {
                    'score': score,
                    'confidence': confidence,
                    'matched_keywords': matched_keywords,
                    'matched_phrases': matched_phrases
                }
        
        # Return intent with highest confidence
        if intent_scores:
            best_intent = max(intent_scores.items(), key=lambda x: x[1]['confidence'])
            logger.info(f"Detected intent: {best_intent[0]} (confidence: {best_intent[1]['confidence']:.2f})")
            
            return {
                'intent': best_intent[0],
                'confidence': best_intent[1]['confidence'],
                'score': best_intent[1]['score'],
                'matched_keywords': best_intent[1]['matched_keywords'],
                'matched_phrases': best_intent[1]['matched_phrases'],
                'all_intents': intent_scores
            }
        else:
            # Default to 'question' if no clear intent
            return {
                'intent': 'question',
                'confidence': 0.5,
                'score': 0,
                'matched_keywords': [],
                'matched_phrases': [],
                'all_intents': {}
            }

class SmartKBExtractor:
    """✅ NEW: Smart knowledge base extractor - extracts relevant info instead of dumping"""
    
    @staticmethod
    def extract_relevant_answer(question: str, kb_content: str, max_sentences: int = 3) -> str:
        """
        Extract relevant sentences from KB based on question
        
        Args:
            question: User's question
            kb_content: Full KB content
            max_sentences: Maximum sentences to extract
            
        Returns:
            Relevant answer extracted from KB
        """
        if not kb_content or len(kb_content.strip()) < 20:
            return ""
        
        # Step 1: Split into sentences
        # Handle multiple sentence endings
        kb_content = kb_content.replace('?', '.').replace('!', '.')
        sentences = [s.strip() for s in kb_content.split('.') if len(s.strip()) > 15]
        
        if not sentences:
            return kb_content[:300]  # Fallback
        
        # Step 2: Extract question keywords (meaningful words)
        stop_words = {
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'what', 'how', 'when', 'where', 'why', 'who', 'which', 'this', 'that',
            'tell', 'me', 'you', 'your', 'about', 'kya', 'kaise', 'batao', 'hai'
        }
        
        question_words = set(question.lower().split())
        meaningful_words = question_words - stop_words
        
        logger.info(f"KB extraction - Question keywords: {meaningful_words}")
        
        # Step 3: Score sentences by relevance
        scored_sentences = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Calculate relevance score
            score = 0
            matched_words = []
            
            # Exact word matches
            for word in meaningful_words:
                if word in sentence_lower:
                    score += 2
                    matched_words.append(word)
                # Partial matches for longer words
                elif len(word) > 4:
                    if any(word in s_word or s_word in word for s_word in sentence_lower.split()):
                        score += 1
                        matched_words.append(word)
            
            # Bonus for multiple word matches
            if len(matched_words) > 1:
                score += len(matched_words) * 0.5
            
            # Bonus for position (earlier sentences often more relevant)
            position_bonus = (len(sentences) - sentences.index(sentence)) / len(sentences)
            score += position_bonus * 0.3
            
            if score > 0:
                scored_sentences.append({
                    'sentence': sentence,
                    'score': score,
                    'matched_words': matched_words
                })
                logger.info(f"Sentence score: {score:.2f} - {sentence[:50]}... (matched: {matched_words})")
        
        # Step 4: Get top N most relevant sentences
        if scored_sentences:
            scored_sentences.sort(key=lambda x: x['score'], reverse=True)
            top_sentences = [item['sentence'] for item in scored_sentences[:max_sentences]]
            
            result = '. '.join(top_sentences)
            if not result.endswith('.'):
                result += '.'
            
            logger.info(f"Extracted {len(top_sentences)} relevant sentences from KB")
            return result
        else:
            # Fallback: use first 2-3 sentences
            fallback = '. '.join(sentences[:3])
            logger.info("No relevant sentences found, using first 3 sentences as fallback")
            return fallback

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
        self.intent_classifier = DynamicIntentClassifier()  # ✅ NEW
        self.kb_extractor = SmartKBExtractor()  # ✅ NEW
    
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
            
            # ✅ NEW: Dynamic intent classification with context
            intent_result = self.intent_classifier.classify_intent(user_message, context)
            intent = intent_result['intent']
            intent_confidence = intent_result['confidence']
            
            logger.info(f"Detected intent: {intent} (confidence: {intent_confidence:.2f})")
            
            # ✅ NEW: Handle goodbye intent FIRST
            if intent == 'goodbye' and intent_confidence > 0.6:
                logger.info("User said goodbye - closing conversation")
                response_text = self._get_goodbye_response(language, voice_settings.get('personality', 'priyanshu'))
                
                if call_sid:
                    self.state_manager.advance_stage(call_sid, force_stage='escalation')
                
                return {
                    'ai_response': response_text,
                    'detected_language': language,
                    'language_confidence': lang_confidence,
                    'sentiment': sentiment,
                    'personality': voice_settings.get('personality', 'priyanshu'),
                    'context_used': len(context) > 0,
                    'conversation_stage': 'closed',
                    'should_escalate': False,
                    'intent': intent,
                    'intent_confidence': intent_confidence,
                    'goodbye_detected': True
                }
            
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
            
            # ✅ FIXED: Check if user is asking specific question about KB content
            is_question = intent == 'question' or any(word in user_message.lower() for word in [
                'what', 'how', 'when', 'where', 'why', 'who', 'which',
                'kya', 'kaise', 'kab', 'kahan', 'kyun', 'kaun', 'kaunsa',
                'tell', 'explain', 'batao', 'samjhao', 'about', 'baare'
            ])

            if is_question and relevant_kb_info:
                # ✅ FIXED: Generate smart answer from KB (no word-by-word reading)
                logger.info("User asked question - generating smart KB-based answer")
                response_text = self._generate_smart_kb_answer(
                    user_question=user_message,
                    kb_content=relevant_kb_info,
                    language=language,
                    personality=personality,
                    intent=intent
                )
            else:
                # Use stage-based response
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
                'abusive_detected': False,
                'intent': intent,
                'intent_confidence': intent_confidence
            }
            
        except Exception as e:
            logger.error(f"Response generation failed: {e}")
            logger.error(f"Stack trace: ", exc_info=True)
            return self._fallback_response(
                voice_settings.get('personality', 'priyanshu'), 
                language if 'language' in locals() else 'english'
            )
    
    def _search_knowledge_base(self, query: str, knowledge_base: List) -> str:
        """Enhanced semantic knowledge base search with better matching"""
        if not knowledge_base:
            logger.info("No knowledge base provided")
            return ""
        
        logger.info(f"Searching {len(knowledge_base)} KB items for query: {query[:100]}")
        
        # Extract query keywords
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
        # Remove common words for better matching
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                      'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
                      'what', 'how', 'when', 'where', 'why', 'who', 'which', 'this', 'that',
                      'me', 'tell', 'about', 'your', 'you', 'i', 'my', 'can', 'could', 'would'}
        
        meaningful_words = query_words - stop_words
        
        # Score each KB item
        scored_items = []
        for item in knowledge_base:
            content = item.get('content', '').lower()
            title = item.get('title', '').lower()
            
            # Calculate relevance score
            score = 0
            
            # Title match (high weight)
            for word in meaningful_words:
                if word in title:
                    score += 10
            
            # Content match (medium weight)
            for word in meaningful_words:
                # Exact word match
                if word in content:
                    score += 2
                
                # Partial match (for longer words)
                if len(word) > 4:
                    for content_word in content.split():
                        if word in content_word or content_word in word:
                            score += 1
            
            # Bonus for multiple word matches
            matched_words = sum(1 for word in meaningful_words if word in content)
            if matched_words > 1:
                score += matched_words * 2
            
            if score > 0:
                scored_items.append({
                    'item': item,
                    'score': score
                })
        
        # Sort by relevance
        scored_items.sort(key=lambda x: x['score'], reverse=True)
        
        logger.info(f"Found {len(scored_items)} relevant KB items")
        
        if not scored_items:
            logger.info("No relevant KB content found for query")
            return ""
        
        # Return MORE content (up to 2000 chars from top 3 items)
        relevant_info = []
        total_chars = 0
        max_total_chars = 2000
        
        for item_data in scored_items[:5]:  # Check top 5 items
            item = item_data['item']
            title = item.get('title', 'Information')
            content = item.get('content', '')
            chunk_id = item.get('chunk_id', '')
            
            # Add title
            section = f"\n[{title}"
            if chunk_id:
                section += f" - Part {chunk_id}"
            section += f"]\n{content}\n"
            
            # Check if adding this would exceed limit
            if total_chars + len(section) > max_total_chars:
                # Add partial content
                remaining = max_total_chars - total_chars
                if remaining > 200:  # Only add if meaningful
                    section = section[:remaining] + "..."
                    relevant_info.append(section)
                break
            
            relevant_info.append(section)
            total_chars += len(section)
            
            logger.info(f"Added KB item: {title[:50]}... (score: {item_data['score']}, length: {len(content)})")
        
        result = "\n".join(relevant_info)
        logger.info(f"Returning {len(result)} chars of KB content from {len(relevant_info)} items")
        
        return result
    
    def _generate_smart_kb_answer(self, user_question: str, kb_content: str, 
                                  language: str, personality: str, intent: str) -> str:
        """
        ✅ FIXED: Generate smart answer from KB - extracts relevant info, NO word-by-word reading
        """
        if not kb_content or len(kb_content.strip()) < 20:
            return self._get_no_kb_response(language, personality)
        
        # ✅ NEW: Extract relevant sentences instead of dumping entire content
        relevant_answer = self.kb_extractor.extract_relevant_answer(
            question=user_question,
            kb_content=kb_content,
            max_sentences=3
        )
        
        if not relevant_answer:
            return self._get_no_kb_response(language, personality)
        
        # Get personality-based intro
        intro = self._get_personality_intro(personality, language)
        
        # Build natural conversational response
        if language == 'hindi':
            follow_up = " Kya aap is baare mein aur kuch jaanna chahenge?"
        elif language == 'hinglish':
            follow_up = " Anything else aap jaanna chahenge?"
        else:
            follow_up = " Would you like to know more about this?"
        
        # Combine intro + relevant answer + follow-up
        response = f"{intro}{relevant_answer}{follow_up}"
        
        logger.info(f"Smart KB answer generated: {response[:100]}...")
        return response
    
    def _get_personality_intro(self, personality: str, language: str) -> str:
        """Get personality-based introduction for answers"""
        intros = {
            'priyanshu': {
                'hindi': "Ji haan, main aapko batata hun. ",
                'hinglish': "Sure, let me explain. ",
                'english': "Absolutely! "
            },
            'tanmay': {
                'hindi': "Bilkul! Ye suniye! ",
                'hinglish': "For sure! Dekho, ",
                'english': "Totally! Check this out! "
            },
            'ekta': {
                'hindi': "Avashya. ",
                'hinglish': "Certainly. ",
                'english': "Certainly. "
            },
            'priyanka': {
                'hindi': "Technical details hain: ",
                'hinglish': "From a technical standpoint, ",
                'english': "Technically speaking, "
            }
        }
        
        return intros.get(personality, intros['priyanshu']).get(language, intros['priyanshu']['english'])
    
    def _get_no_kb_response(self, language: str, personality: str) -> str:
        """Response when no KB content is available"""
        responses = {
            'hindi': "Mujhe is specific question ka answer nahi pata. Main aapko apne specialist se connect kar deta hun jo detail mein bata sakenge.",
            'hinglish': "I don't have specific details on this. Let me connect you with our specialist jo explain kar sakenge.",
            'english': "I don't have specific information on that. Let me connect you with our specialist who can help."
        }
        return responses.get(language, responses['english'])
    
    def _get_goodbye_response(self, language: str, personality: str) -> str:
        """✅ NEW: Generate goodbye response based on language and personality"""
        goodbyes = {
            'priyanshu': {
                'hindi': "Dhanyawad aapka! Aapka din shubh rahe. Agar kabhi bhi madad chahiye, please call karein!",
                'hinglish': "Thank you so much! Have a great day. Agar kabhi help chahiye, feel free to call!",
                'english': "Thank you for your time! Have a wonderful day. Feel free to reach out anytime!"
            },
            'tanmay': {
                'hindi': "Bahut badiya baat ki aapne! Aapka din amazing rahe! Bye bye!",
                'hinglish': "Great talking to you! Have an amazing day! Bye!",
                'english': "It was awesome chatting with you! Have an amazing day! Bye!"
            },
            'ekta': {
                'hindi': "Aapke samay ke liye bahut bahut dhanyawad. Aapka din mangalmay ho.",
                'hinglish': "Thank you very much for your time. Aapka din shubh rahe.",
                'english': "Thank you very much for your valuable time. Wishing you a pleasant day."
            },
            'priyanka': {
                'hindi': "Dhanyawad. Agar technical assistance chahiye toh please contact karein.",
                'hinglish': "Thank you. If you need technical assistance, please reach out.",
                'english': "Thank you. Should you require technical assistance, please don't hesitate to contact us."
            }
        }
        
        return goodbyes.get(personality, goodbyes['priyanshu']).get(language, goodbyes['priyanshu']['english'])
    
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
                # ✅ Use smart extraction instead of dumping
                smart_info = self.kb_extractor.extract_relevant_answer(user_message, kb_info, 2)
                if language == 'hindi':
                    return f"Dhanyawad! Main aapko batata hun: {smart_info[:400]} Aur jaanna chahenge?"
                elif language == 'hinglish':
                    return f"Thank you! Here's what we offer: {smart_info[:400]} Want to know more?"
                else:
                    return f"Great! Let me share: {smart_info[:400]} Would you like more details?"
            else:
                if language == 'hindi':
                    return f"{company_name} comprehensive solutions provide karta hai. Aapko kis service ke baare mein jaanna hai?"
                else:
                    return f"{company_name} provides comprehensive solutions. What would you like to know?"
        
        elif stage == 'needs_assessment':
            if intent == 'pricing':
                if language == 'hindi':
                    return "Pricing aapke requirements par depend karti hai. Aap kitne users ke liye solution chahte hain?"
                else:
                    return "Our pricing depends on your requirements. How many users would you need this for?"
            elif intent == 'services':
                if kb_info:
                    smart_info = self.kb_extractor.extract_relevant_answer(user_message, kb_info, 2)
                    if language == 'hindi':
                        return f"Bilkul! {smart_info[:400]} Aapki specific need kya hai?"
                    else:
                        return f"Absolutely! {smart_info[:400]} What's your specific need?"
                else:
                    return "We offer cloud, hosting, and support services. What interests you?"
        
        elif stage == 'solution_pitch':
            if kb_info:
                smart_info = self.kb_extractor.extract_relevant_answer(user_message, kb_info, 3)
                if language == 'hindi':
                    return f"Perfect! {smart_info[:500]} Kya aap demo dekhna chahenge?"
                else:
                    return f"Perfect! {smart_info[:500]} Would you like a demo?"
            else:
                return "Our solution can save you 30-40% on costs. Interested in learning more?"
        
        elif stage == 'objection_handling':
            if sentiment['label'] == 'negative':
                if language == 'hindi':
                    return "Main samajh sakta hun. Kya main specific details share kar sakta hun?"
                else:
                    return "I understand your concern. Can I share specific details?"
            else:
                return "Do you have any other questions?"
        
        elif stage == 'closing':
            if 'yes' in user_message.lower() or 'haan' in user_message.lower():
                if language == 'hindi':
                    return "Bahut accha! Main aapko specialist se connect kar raha hun."
                else:
                    return "Excellent! Let me connect you with our specialist."
            else:
                return "No problem. Would you like us to call you back later?"
        
        elif stage == 'escalation':
            if language == 'hindi':
                return "Main aapko abhi consultant se connect kar raha hun. Dhanyawad!"
            else:
                return "Connecting you with our consultant now. Thank you!"
        
        # Fallback
        return "I understand. Can you tell me more about what you're looking for?"
    
    def _get_abusive_response(self, personality: str, language: str) -> str:
        """✅ FIXED: Firm but polite response for abusive content"""
        responses = {
            'english': "I'm here to help, but I need our conversation to be respectful. If you'd like to continue professionally, I'm happy to assist. Otherwise, I'll have to end this call.",
            'hindi': "Main aapki madad karna chahta hun, lekin hamari conversation respectful honi chahiye. Agar aap professionally baat karna chahte hain, main khush hun. Warna mujhe ye call end karni padegi.",
            'hinglish': "Main help karna chahta hun, but conversation respectful honi chahiye. If you want to continue professionally, I'm here. Otherwise I'll have to end the call."
        }
        return responses.get(language, responses['english'])
    
    def _fallback_response(self, personality: str, language: str) -> Dict:
        """Emergency fallback response"""
        fallback_text = "Thank you for your time. Our team will be happy to assist you further."
        if language == 'hindi':
            fallback_text = "Aapke samay ke liye dhanyawad. Hamari team aapki madad karegi."
        
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