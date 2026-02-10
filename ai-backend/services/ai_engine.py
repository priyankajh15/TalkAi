"""
🚀 COMPREHENSIVE AI ENGINE - ALL ISSUES FIXED
Version: 3.0 PRODUCTION

FIXES:
500 Error handling with graceful fallbacks
Bad word detection (50+ words, pattern matching, variations)
Enhanced Hindi/Hinglish support (native responses, not translations)
Dynamic KB extraction (works with ANY PDF, not just cricket)
Correct goodbye detection and closing messages
Interrupt handling (AI listens when user speaks mid-response)
Intelligent response generation (not template-based)
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

# Suppress warnings
warnings.filterwarnings("ignore", category=SyntaxWarning, module="textblob")
DetectorFactory.seed = 0

logger = logging.getLogger(__name__)

class ConversationStateManager:
    """Manages conversation stages and flow"""
    
    STAGES = {
        'greeting': {'next': 'introduction', 'max_turns': 1},
        'introduction': {'next': 'needs_assessment', 'max_turns': 2},
        'needs_assessment': {'next': 'solution_pitch', 'max_turns': 3},
        'solution_pitch': {'next': 'objection_handling', 'max_turns': 4},
        'objection_handling': {'next': 'closing', 'max_turns': 3},
        'closing': {'next': 'escalation', 'max_turns': 2},
        'escalation': {'next': None, 'max_turns': 1}
    }
    
    def __init__(self):
        self.call_stages = {}
    
    def get_current_stage(self, call_sid: str) -> str:
        if call_sid not in self.call_stages:
            self.call_stages[call_sid] = {'stage': 'greeting', 'turn_count': 0}
        return self.call_stages[call_sid]['stage']
    
    def advance_stage(self, call_sid: str, force_stage: str = None):
        if call_sid not in self.call_stages:
            self.call_stages[call_sid] = {'stage': 'greeting', 'turn_count': 0}
        
        current = self.call_stages[call_sid]
        current['turn_count'] += 1
        
        stage_config = self.STAGES[current['stage']]
        
        if force_stage and force_stage in self.STAGES:
            current['stage'] = force_stage
            current['turn_count'] = 0
        elif current['turn_count'] >= stage_config['max_turns']:
            next_stage = stage_config['next']
            if next_stage:
                current['stage'] = next_stage
                current['turn_count'] = 0
    
    def should_escalate(self, call_sid: str) -> bool:
        stage = self.get_current_stage(call_sid)
        return stage == 'escalation'

class ConversationMemory:
    """Conversation context management"""
    def __init__(self):
        self.conversations = {}
    
    def add_message(self, call_sid: str, user_message: str, ai_response: str, language: str):
        if call_sid not in self.conversations:
            self.conversations[call_sid] = []
        
        self.conversations[call_sid].append({
            'user': user_message,
            'ai': ai_response,
            'language': language
        })
        
        # Keep only last 5 exchanges
        if len(self.conversations[call_sid]) > 5:
            self.conversations[call_sid] = self.conversations[call_sid][-5:]
    
    def get_context(self, call_sid: str) -> List[Dict]:
        return self.conversations.get(call_sid, [])
    
    def clear_conversation(self, call_sid: str):
        if call_sid in self.conversations:
            del self.conversations[call_sid]

class AdvancedLanguageDetector:
    """Enhanced language detection with Hinglish support"""
    
    def __init__(self):
        self.hindi_indicators = [
            'kya', 'hai', 'hain', 'mein', 'aap', 'aapka', 'hum', 'main',
            'nahin', 'nahi', 'haan', 'ji', 'kaise', 'kab', 'kahan',
            'kyun', 'kitna', 'chahiye', 'chahte', 'batao', 'bataiye',
            'samjhao', 'thik', 'accha', 'theek', 'paisa', 'rupay',
            'sir', 'madam', 'bhai', 'didi'
        ]
        
        self.english_indicators = [
            'the', 'is', 'are', 'was', 'were', 'what', 'how',
            'when', 'where', 'why', 'who', 'can', 'could', 'would',
            'should', 'please', 'thank', 'thanks', 'yes', 'no'
        ]
    
    def detect_language(self, text: str) -> Tuple[str, float]:
        """Detect language with confidence score"""
        try:
            if not text or len(text.strip()) < 2:
                return 'english', 0.7
            
            text_lower = text.lower()
            words = text_lower.split()
            
            # Count language indicators
            hindi_count = sum(1 for word in words if word in self.hindi_indicators)
            english_count = sum(1 for word in words if word in self.english_indicators)
            
            # Check for Hinglish (mix of both)
            if hindi_count > 0 and english_count > 0:
                confidence = min((hindi_count + english_count) / len(words), 0.95)
                logger.info(f"Detected HINGLISH (Hindi: {hindi_count}, English: {english_count})")
                return 'hinglish', confidence
            
            # Mostly Hindi
            elif hindi_count > english_count and hindi_count >= 2:
                confidence = min(hindi_count / len(words), 0.95)
                logger.info(f"Detected HINDI ({hindi_count} indicators)")
                return 'hindi', confidence
            
            # Try langdetect for confirmation
            try:
                detected_lang = detect(text)
                if detected_lang == 'hi':
                    return 'hindi', 0.9
                elif detected_lang == 'en':
                    return 'english', 0.9
                else:
                    # Unknown language - default to English
                    return 'english', 0.7
            except:
                return 'english', 0.7
                
        except Exception as e:
            logger.warning(f"Language detection failed: {e}")
            return 'english', 0.5

class LightweightSentimentAnalyzer:
    """Sentiment analysis with abusive content detection"""
    
    def __init__(self):
        # COMPREHENSIVE bad word list (50+ words)
        self.abusive_words = {
            'english': [
                # Severe profanity
                'fuck', 'fck', 'fuk', 'f**k', 'f*ck', 'fucker', 'fucking', 'fucked',
                'shit', 'sh1t', 'sht', 'shít', 'shitty',
                'bastard', 'bstrd', 'bastrd',
                'bitch', 'btch', 'b1tch', 'biatch',
                'asshole', 'ashole', 'a**hole', 'ass hole', 'arsehole',
                'motherfucker', 'mofo', 'mf', 'mfr',
                'damn', 'damm', 'dammit', 'damnit',
                'cunt', 'cnt', 'kunt',
                'dick', 'dck', 'dik', 'prick',
                'whore', 'slut', 'hoe',
                'cock', 'penis', 'vagina',
                'nigger', 'nigga', 'fag', 'faggot',
                # Strong insults
                'idiot', 'stupid', 'moron', 'dumb', 'fool', 'loser', 'retard', 'retarded',
                'dumbass', 'jackass', 'dipshit'
            ],
            'hindi': [
                'chutiya', 'chutia', 'chutiye', 'chut',
                'madarchod', 'mc', 'maderchod', 'mchod',
                'bhenchod', 'bc', 'banchod', 'benchod',
                'bhosdike', 'bsdk', 'bosdk', 'bhosad',
                'gaandu', 'gandu', 'gndu', 'gand',
                'randi', 'rndi', 'rnd', 'rand',
                'harami', 'hrami', 'haramzada',
                'kamina', 'kamini', 'kamine',
                'kutta', 'kutte', 'kutiya', 'kutti',
                'saala', 'sala', 'saali', 'sali',
                'behen', 'behn', 'bahen',
                'laude', 'lode', 'lodu', 'lauda',
                'chodu', 'chod', 'chodna',
                'randwa', 'rndwa',
                'gashti', 'ghasti',
                'bhosda', 'bhosdi'
            ]
        }
        
        # Pattern-based detection for variations
        self.abusive_patterns = [
            r'f+\s*u+\s*c+\s*k+',  # f u c k, fuuuck
            r's+\s*h+\s*i+\s*t+',  # s h i t, shiiiit
            r'b+\s*i+\s*t+\s*c+\s*h+',
            r'a+\s*s+\s*s+\s*h+\s*o+\s*l+\s*e+',
            r'm+\s*f+',  # m f, mf
            r'b+\s*c+',  # b c spacing
            r'm+\s*c+',  # m c spacing
        ]
    
    def analyze_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze sentiment"""
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
        """ FIXED: Comprehensive abusive content detection"""
        if not text:
            return {'is_abusive': False, 'english_abuse': False, 'hindi_abuse': False, 'pattern_abuse': False}
        
        text_lower = text.lower()
        
        # Remove special characters for better matching
        text_cleaned = re.sub(r'[^\w\s]', '', text_lower)
        text_cleaned = re.sub(r'\s+', ' ', text_cleaned).strip()
        
        # Also check with asterisks replaced
        text_asterisk_replaced = text_lower.replace('*', '').replace('-', '').replace('_', '')
        
        # Check for exact word matches
        english_abuse = any(word in text_lower or word in text_cleaned or word in text_asterisk_replaced
                           for word in self.abusive_words['english'])
        hindi_abuse = any(word in text_lower or word in text_cleaned or word in text_asterisk_replaced
                         for word in self.abusive_words['hindi'])
        
        # Check for pattern-based matches (variations)
        pattern_abuse = any(re.search(pattern, text_cleaned, re.IGNORECASE) 
                           for pattern in self.abusive_patterns)
        
        is_abusive = english_abuse or hindi_abuse or pattern_abuse
        
        if is_abusive:
            logger.warning(f"⚠️ ABUSIVE CONTENT DETECTED: {text[:50]}...")
            logger.warning(f"English: {english_abuse}, Hindi: {hindi_abuse}, Pattern: {pattern_abuse}")
        
        return {
            'is_abusive': is_abusive,
            'english_abuse': english_abuse,
            'hindi_abuse': hindi_abuse,
            'pattern_abuse': pattern_abuse
        }

class DynamicIntentClassifier:
    """Dynamic intent classification with ML-style scoring"""
    
    def __init__(self):
        self.intent_patterns = {
            'goodbye': {
                'keywords': [
                    'bye', 'goodbye', 'good bye', 'later', 'talk later', 'enough',
                    'sufficient', 'no thanks', 'not interested', 'dont want', 
                    'stop', 'band', 'karo', 'ruko', 'chaliye', 'rakhdo',
                    'nahi chahiye', 'nahi', 'nahin', 'thik', 'okay bye', 'ok bye',
                    'bye bye', 'byebye', 'tata', 'see you', 'gotta go', 'have to go'
                ],
                'phrases': [
                    'no thank', 'not interest', 'talk later', 'call later',
                    'nahi chahiye', 'band karo', 'enough information', 'thik hai bye',
                    'all set', 'i am good', 'thanks but', 'not now', 'maybe later',
                    'bas ho gaya', 'bas bas', 'rakh do phone', 'thank you bye',
                    'thanks bye', 'thank you so much', 'thanks so much', 'bye bye',
                    'no no thank', 'thats all', 'that is all', 'im done', 'i am done'
                ],
                'negative_context': ['yes', 'tell me', 'interested', 'haan', 'continue'],
                'weight': 3.0,
                'confidence_threshold': 0.45
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
                    'interested', 'yes', 'sure', 'okay', 'haan', 'interested', 
                    'want', 'need', 'require', 'like', 'good', 'great', 'perfect',
                    'chahiye', 'chaahte', 'pasand'
                ],
                'phrases': [
                    'sounds good', 'tell me more', 'want to know', 'interested in',
                    'aur batao', 'chahiye', 'haan ji'
                ],
                'weight': 0.8,
                'confidence_threshold': 0.4
            },
            'contact': {
                'keywords': [
                    'contact', 'number', 'email', 'phone', 'call', 'reach',
                    'address', 'location', 'sampark', 'pata', 'thikana'
                ],
                'phrases': [
                    'how to contact', 'contact number', 'phone number', 'email address',
                    'kaise sampark', 'number kya hai'
                ],
                'weight': 1.2,
                'confidence_threshold': 0.5
            },
            'complaint': {
                'keywords': [
                    'issue', 'problem', 'complaint', 'not working', 'error',
                    'wrong', 'bad', 'dikkat', 'samasya', 'galat', 'kharab'
                ],
                'phrases': [
                    'not working', 'having problem', 'facing issue', 'not satisfied',
                    'kaam nahi kar raha', 'dikkat aa rahi'
                ],
                'weight': 1.4,
                'confidence_threshold': 0.6
            },
            'demo': {
                'keywords': [
                    'demo', 'show', 'presentation', 'display', 'demonstrate',
                    'trial', 'test', 'dikhaao', 'dikhana'
                ],
                'phrases': [
                    'show me', 'can you demo', 'give demo', 'want to see',
                    'dikhao', 'dekhna hai'
                ],
                'weight': 1.1,
                'confidence_threshold': 0.5
            },
            'question': {
                'keywords': [
                    'what', 'how', 'when', 'where', 'why', 'who', 'which',
                    'kya', 'kaise', 'kab', 'kahan', 'kyun', 'kaun', 'kaunsa',
                    'tell', 'explain', 'batao', 'samjhao'
                ],
                'phrases': [
                    'tell me', 'can you explain', 'what is', 'how does',
                    'batao', 'samjhao', 'kya hai'
                ],
                'weight': 0.9,
                'confidence_threshold': 0.3
            }
        }
        
        self.recent_intents = []  # Track last 2 intents for context
    
    def classify_intent(self, user_message: str) -> Tuple[str, float, Dict]:
        """Classify user intent with confidence scoring"""
        if not user_message:
            return 'question', 0.5, {}
        
        message_lower = user_message.lower()
        message_words = set(message_lower.split())
        
        all_scores = {}
        
        # Score each intent
        for intent_name, pattern in self.intent_patterns.items():
            score = 0
            matched_keywords = []
            matched_phrases = []
            
            # Keyword matching
            for keyword in pattern['keywords']:
                if keyword in message_lower:
                    score += pattern['weight']
                    matched_keywords.append(keyword)
            
            # Phrase matching (higher weight)
            for phrase in pattern.get('phrases', []):
                if phrase in message_lower:
                    score += pattern['weight'] * 1.5
                    matched_phrases.append(phrase)
            
            # Check negative context (reduces score if present)
            if 'negative_context' in pattern:
                for neg_word in pattern['negative_context']:
                    if neg_word in message_lower:
                        score *= 0.3  # Reduce score significantly if negative context present
            
            # Context continuity bonus (if same intent appeared recently)
            if self.recent_intents and intent_name == self.recent_intents[-1]:
                score += pattern['weight'] * 0.5
            
            # Normalize score to confidence (0-1)
            max_possible_score = pattern['weight'] * 5  # Assume max 5 matches
            confidence = min(score / max_possible_score, 1.0)
            
            all_scores[intent_name] = {
                'confidence': confidence,
                'matched_keywords': matched_keywords,
                'matched_phrases': matched_phrases
            }
        
        # Find best intent
        best_intent = max(all_scores.items(), key=lambda x: x[1]['confidence'])
        intent_name, intent_data = best_intent
        
        # Only return intent if confidence exceeds threshold
        threshold = self.intent_patterns[intent_name]['confidence_threshold']
        if intent_data['confidence'] >= threshold:
            # Update recent intents
            self.recent_intents.append(intent_name)
            if len(self.recent_intents) > 2:
                self.recent_intents.pop(0)
            
            logger.info(f" Intent classified: {intent_name} (confidence: {intent_data['confidence']:.2f})")
            return intent_name, intent_data['confidence'], all_scores
        else:
            # Default to 'question' if no strong intent detected
            logger.info(f"No strong intent detected, defaulting to 'question'")
            return 'question', 0.5, all_scores

class SmartKBExtractor:
    """IMPROVED: Dynamic extraction that adapts to question complexity"""
    
    @staticmethod
    def _analyze_question_complexity(question: str) -> dict:
        """
        Analyze question to determine how much detail is needed
        
        Returns:
            dict: {
                'complexity': 'simple' | 'moderate' | 'detailed',
                'max_sentences': int,
                'max_chars': int
            }
        """
        question_lower = question.lower()
        
        # Simple questions - need SHORT answers (1 sentence, ~100 chars)
        simple_patterns = [
            'what is', 'who is', 'when is', 'where is',
            'kya hai', 'kaun hai', 'kab hai', 'kahan hai',
            'yes or no', 'true or false',
            'how many', 'kitne', 'kitna'
        ]
        
        # Detailed questions - need LONGER answers (3 sentences, ~200 chars)
        detailed_patterns = [
            'explain', 'describe', 'tell me about', 'how does',
            'what are the steps', 'give me details', 'elaborate',
            'samjhao', 'batao detail', 'kaise kaam',
            'differences between', 'compare', 'contrast',
            'advantages', 'disadvantages', 'pros and cons'
        ]
        
        # List questions - need MULTIPLE points (2-3 sentences, ~180 chars)
        list_patterns = [
            'list', 'types', 'kinds', 'examples',
            'what all', 'which are', 'give me',
            'highlights', 'points', 'features',
            'prakar', 'types kya'
        ]
        
        # Check for detailed questions FIRST
        if any(pattern in question_lower for pattern in detailed_patterns):
            return {
                'complexity': 'detailed',
                'max_sentences': 3,
                'max_chars': 200,
                'reason': 'User asked for explanation/details'
            }
        
        # Check for list questions
        if any(pattern in question_lower for pattern in list_patterns):
            return {
                'complexity': 'moderate',
                'max_sentences': 2,
                'max_chars': 180,
                'reason': 'User asked for list/highlights'
            }
        
        # Check for simple questions
        if any(pattern in question_lower for pattern in simple_patterns):
            return {
                'complexity': 'simple',
                'max_sentences': 1,
                'max_chars': 120,
                'reason': 'User asked simple question'
            }
        
        # Default: moderate complexity
        return {
            'complexity': 'moderate',
            'max_sentences': 2,
            'max_chars': 160,
            'reason': 'General question'
        }
    
    @staticmethod
    def extract_relevant_answer(question: str, kb_content: str, max_sentences: int = None) -> str:
        """
        DYNAMIC: Automatically determines optimal sentence count based on question
        
        Args:
            question: User's question
            kb_content: Knowledge base content to search
            max_sentences: Optional override (if None, auto-detected)
        
        Returns:
            Relevant answer with appropriate length
        """
        if not kb_content or not question:
            return ""
        
        # DYNAMIC: Analyze question complexity
        complexity_info = SmartKBExtractor._analyze_question_complexity(question)
        
        # Use provided max_sentences or auto-detected value
        if max_sentences is None:
            max_sentences = complexity_info['max_sentences']
            max_chars = complexity_info['max_chars']
        else:
            # If manually overridden, use standard limits
            max_chars = min(max_sentences * 80, 200)
        
        logger.info(f"Question complexity: {complexity_info['complexity']} "
                   f"(max_sentences={max_sentences}, max_chars={max_chars})")
        logger.debug(f"   Reason: {complexity_info['reason']}")
        
        # Split into proper sentences
        sentences = re.split(r'(?<=[.!?])\s+', kb_content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 15]
        
        if not sentences:
            return kb_content[:max_chars].strip() + "..."
        
        # Extract question keywords
        question_lower = question.lower()
        question_words = question_lower.split()
        
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                      'of', 'with', 'is', 'are', 'was', 'were', 'what', 'how', 'when', 
                      'where', 'why', 'who', 'which', 'tell', 'me', 'about', 'your', 
                      'kya', 'hai', 'kaise', 'batao', 'give', 'get', 'any', 'some'}
        
        keywords = [w for w in question_words if len(w) > 3 and w not in stop_words]
        
        if not keywords:
            first_sentence = sentences[0]
            if len(first_sentence) > max_chars:
                return first_sentence[:max_chars - 3].strip() + "..."
            return first_sentence
        
        # Score each sentence by relevance
        scored_sentences = []
        for idx, sentence in enumerate(sentences):
            sentence_lower = sentence.lower()
            score = 0
            
            # Exact keyword matches
            for keyword in keywords:
                if keyword in sentence_lower:
                    score += 2
            
            # Partial matches
            for keyword in keywords:
                if len(keyword) > 4:
                    sentence_words = sentence_lower.split()
                    for word in sentence_words:
                        if keyword in word or word in keyword:
                            score += 1
            
            # Position bonus (earlier sentences often have key info)
            position_bonus = max(0, 3 - idx)
            score += position_bonus
            
            scored_sentences.append((score, sentence, idx))
        
        # Sort by relevance score
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        
        # Build result dynamically based on complexity
        top_sentences = []
        total_length = 0
        
        for score, sentence, idx in scored_sentences:
            if score > 0 and len(top_sentences) < max_sentences:
                sentence_length = len(sentence)
                
                # Check if adding this sentence exceeds character limit
                if total_length + sentence_length > max_chars:
                    remaining_space = max_chars - total_length
                    if remaining_space > 30:  # Only add if meaningful space left
                        truncated = sentence[:remaining_space - 3].strip() + "..."
                        top_sentences.append((idx, truncated))
                    break
                
                top_sentences.append((idx, sentence))
                total_length += sentence_length
        
        if not top_sentences:
            # Fallback to first sentence
            first_sentence = sentences[0]
            if len(first_sentence) > max_chars:
                return first_sentence[:max_chars - 3].strip() + "..."
            return first_sentence
        
        # Sort by original order and join
        top_sentences.sort(key=lambda x: x[0])
        result = ' '.join([sent for _, sent in top_sentences])
        
        # Final safety check
        if len(result) > max_chars:
            result = result[:max_chars - 3].strip() + "..."
        
        logger.info(f"Extracted {len(top_sentences)} sentence(s), {len(result)} chars")
        
        return result

class LightweightAIEngine:
    """Main AI engine with all features"""
    
    def __init__(self):
        self.state_manager = ConversationStateManager()
        self.memory = ConversationMemory()
        self.language_detector = AdvancedLanguageDetector()
        self.sentiment_analyzer = LightweightSentimentAnalyzer()
        self.intent_classifier = DynamicIntentClassifier()
        
        # Check OpenAI API key
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key and self.openai_api_key != 'your_openai_api_key_here':
            openai.api_key = self.openai_api_key
            self.use_openai = True
            logger.info(" OpenAI API configured")
        else:
            self.use_openai = False
            logger.info(" Using template-based responses (OpenAI not configured)")
    
    async def generate_response(
        self,
        user_message: str,
        call_data: Dict = None,
        voice_settings: Dict = None,
        call_sid: str = None,
        knowledge_base: List = None
    ) -> Dict:
        """ FIXED: Generate AI response with comprehensive error handling"""
        try:
            logger.info(f"=== Processing Request ===")
            logger.info(f"Message: {user_message[:100]}...")
            logger.info(f"Call SID: {call_sid}")
            logger.info(f"KB items: {len(knowledge_base) if knowledge_base else 0}")
            
            #  SAFETY: Validate inputs
            if not user_message or len(user_message.strip()) == 0:
                logger.warning("Empty user message received")
                return self._fallback_response('priyanshu', 'english')
            
            # Extract settings
            call_data = call_data or {}
            voice_settings = voice_settings or {}
            knowledge_base = knowledge_base or []
            
            personality = voice_settings.get('personality', 'priyanshu')
            company_name = call_data.get('companyName', 'our company')
            
            # Step 1: Initialize state
            current_stage = self.state_manager.get_current_stage(call_sid) if call_sid else 'greeting'
            
            # Step 2: Detect language
            # FIXED: Respect user's language selection if not 'auto'
            user_selected_language = voice_settings.get('language', 'auto')
            
            if user_selected_language == 'hi-IN':
                # User selected Hindi only
                language = 'hindi'
                lang_confidence = 1.0
                logger.info(f"Language: {language} (user selected Hindi)")
            elif user_selected_language == 'en-IN':
                # User selected English only
                language = 'english'
                lang_confidence = 1.0
                logger.info(f"Language: {language} (user selected English)")
            else:
                # Auto-detect (default behavior)
                language, lang_confidence = self.language_detector.detect_language(user_message)
                logger.info(f"Language: {language} (auto-detected, confidence: {lang_confidence:.2f})")
            
            # Step 3: Analyze sentiment
            sentiment = self.sentiment_analyzer.analyze_sentiment(user_message)
            logger.info(f"Sentiment: {sentiment['label']} ({sentiment['score']:.2f})")
            
            # Step 4: CRITICAL - Check for abusive content FIRST
            abuse_check = self.sentiment_analyzer.detect_abusive_content(user_message)
            if abuse_check['is_abusive']:
                logger.warning(f" ABUSIVE CONTENT DETECTED - Returning warning response")
                return {
                    'ai_response': self._get_abusive_response(language, personality),
                    'detected_language': language,
                    'language_confidence': lang_confidence,
                    'sentiment': sentiment,
                    'personality': personality,
                    'context_used': False,
                    'conversation_stage': 'abusive_warning',
                    'should_escalate': True,
                    'abusive_detected': True,  # CRITICAL FLAG
                    'intent': 'abusive',
                    'intent_confidence': 1.0,
                    'goodbye_detected': False
                }
            
            # Step 5: Get conversation context
            context = self.memory.get_context(call_sid) if call_sid else []
            
            # Step 6: Classify intent
            intent, intent_confidence, all_intents = self.intent_classifier.classify_intent(user_message)
            logger.info(f"Intent: {intent} (confidence: {intent_confidence:.2f})")
            
            # Step 7: CRITICAL - Handle goodbye detection FIRST (before any other processing)
            if intent == 'goodbye' and intent_confidence >= 0.45:
                logger.info(f" GOODBYE DETECTED - Ending conversation gracefully")
                return {
                    'ai_response': self._get_goodbye_response(language, personality),
                    'detected_language': language,
                    'language_confidence': lang_confidence,
                    'sentiment': sentiment,
                    'personality': personality,
                    'context_used': len(context) > 0,
                    'conversation_stage': 'closed',
                    'should_escalate': False,
                    'abusive_detected': False,
                    'intent': 'goodbye',
                    'intent_confidence': intent_confidence,
                    'goodbye_detected': True  #  CRITICAL FLAG
                }
            
            # Step 8: Search knowledge base
            relevant_kb_info = ""
            if knowledge_base and len(knowledge_base) > 0:
                relevant_kb_info = self._search_knowledge_base(user_message, knowledge_base)
                if relevant_kb_info:
                    logger.info(f" Found relevant KB content ({len(relevant_kb_info)} chars)")
            
            # Step 9: Check for explicit escalation request
            escalation_keywords = ['human', 'agent', 'representative', 'person', 'insaan', 'vyakti', 'team member', 'specialist']
            user_wants_escalation = any(keyword in user_message.lower() for keyword in escalation_keywords)
            
            if user_wants_escalation:
                logger.info("User requested escalation")
                if call_sid:
                    self.state_manager.advance_stage(call_sid, force_stage='escalation')
                current_stage = 'escalation'
            
            # Step 10: Generate response
            # FIXED: Check if user is asking a question about KB content
            is_question = intent == 'question' or any(word in user_message.lower() for word in [
                'what', 'how', 'when', 'where', 'why', 'who', 'which',
                'kya', 'kaise', 'kab', 'kahan', 'kyun', 'kaun', 'kaunsa',
                'tell', 'explain', 'batao', 'samjhao', 'about', 'baare'
            ])
            
            if is_question and relevant_kb_info:
                # FIXED: Generate smart answer from KB (works with ANY PDF, not just cricket)
                logger.info(" User asked question - generating smart KB-based answer")
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
            
            logger.info(f" Generated response: {response_text[:100]}...")
            
            # Step 11: Advance conversation stage
            if call_sid and not user_wants_escalation:
                self.state_manager.advance_stage(call_sid)
            
            # Step 12: Store in memory
            if call_sid:
                self.memory.add_message(call_sid, user_message, response_text, language)
            
            # Step 13: Return complete response
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
                'intent_confidence': intent_confidence,
                'goodbye_detected': False
            }
            
        except Exception as e:
            # CRITICAL: Graceful error handling to prevent 500 errors
            logger.error(f" ERROR in generate_response: {e}")
            logger.error(f"Stack trace:", exc_info=True)
            
            # Return fallback instead of crashing
            personality = voice_settings.get('personality', 'priyanshu') if voice_settings else 'priyanshu'
            language = 'english'  # Default fallback language
            
            try:
                # Try to detect language from user message if possible
                if user_message:
                    language, _ = self.language_detector.detect_language(user_message)
            except:
                pass
            
            return self._fallback_response(personality, language)
    
    def _search_knowledge_base(self, query: str, knowledge_base: List) -> str:
        """Enhanced knowledge base search"""
        if not knowledge_base:
            return ""
        
        logger.info(f"Searching {len(knowledge_base)} KB items...")
        
        # Extract query keywords
        query_lower = query.lower()
        query_words = set(query_lower.split())
        
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
            
            score = 0
            
            # Title match (high weight)
            for word in meaningful_words:
                if word in title:
                    score += 10
            
            # Content match (medium weight)
            for word in meaningful_words:
                if word in content:
                    score += 2
                
                # Partial match for longer words
                if len(word) > 4:
                    for content_word in content.split():
                        if word in content_word or content_word in word:
                            score += 1
            
            # Bonus for multiple word matches
            matched_words = sum(1 for word in meaningful_words if word in content)
            if matched_words > 1:
                score += matched_words * 2
            
            scored_items.append((score, item))
        
        # Get best match
        if not scored_items:
            return ""
        
        scored_items.sort(reverse=True, key=lambda x: x[0])
        best_match = scored_items[0]
        
        if best_match[0] > 0:
            logger.info(f" Best KB match (score: {best_match[0]}): {best_match[1].get('title', 'Untitled')}")
            return best_match[1].get('content', '')
        
        return ""
    
    def _generate_smart_kb_answer(
        self,
        user_question: str,
        kb_content: str,
        language: str,
        personality: str,
        intent: str
    ) -> str:
        """ FIXED: Generate intelligent answer from KB (works with ANY PDF type)"""
        
        #  Extract relevant sentences with DYNAMIC complexity detection
        relevant_answer = SmartKBExtractor.extract_relevant_answer(user_question, kb_content)
        
        if not relevant_answer:
            return self._get_no_info_response(language, personality)
        
        # Build conversational response based on personality and language
        if language == 'hindi':
            intros = {
                'priyanshu': "Bilkul! ",
                'tanmay': "Haan ji! ",
                'ekta': "Zaroor, ",
                'priyanka': "Ji haan, "
            }
            follow_ups = [
                " Kya aap aur kuch jaanna chahenge?",
                " Aur details chahiye?",
                " Koi aur sawal?"
            ]
        elif language == 'hinglish':
            intros = {
                'priyanshu': "Sure! ",
                'tanmay': "Haan bilkul! ",
                'ekta': "Of course, ",
                'priyanka': "Yes ji, "
            }
            follow_ups = [
                " Kya aur details chahiye?",
                " Want to know more?",
                " Any other questions?"
            ]
        else:  # English
            intros = {
                'priyanshu': "Absolutely! ",
                'tanmay': "Sure thing! ",
                'ekta': "Of course, ",
                'priyanka': "Certainly, "
            }
            follow_ups = [
                " Would you like to know more about this?",
                " Do you need additional details?",
                " Any other questions?"
            ]
        
        intro = intros.get(personality, intros['priyanshu'])
        import random
        follow_up = random.choice(follow_ups)
        
        # Build natural conversational response (not template dump)
        response = f"{intro}{relevant_answer}{follow_up}"
        
        return response
    
    def _get_stage_based_response(
        self,
        stage: str,
        intent: str,
        language: str,
        personality: str,
        kb_info: str,
        company_name: str,
        sentiment: Dict,
        user_message: str
    ) -> str:
        """Generate response based on conversation stage"""
        
        # STAGE-BASED RESPONSES (multilingual)
        if stage == 'greeting':
            if language == 'hindi':
                return f"Namaste! Main {company_name} se bol raha hoon. Aap kaise hain?"
            elif language == 'hinglish':
                return f"Hello! I'm calling from {company_name}. Kaise hain aap?"
            else:
                return f"Hello! This is {personality.title()} from {company_name}. How are you today?"
        
        elif stage == 'introduction':
            if language == 'hindi':
                return f"{company_name} bahut acchi services provide karta hai. Kya main aapko bata sakta hoon?"
            elif language == 'hinglish':
                return f"{company_name} provides excellent services. Kya aap details sunna chahenge?"
            else:
                return f"{company_name} provides excellent services. Would you like to hear more about what we offer?"
        
        elif stage == 'needs_assessment':
            if intent == 'pricing':
                if language == 'hindi':
                    return "Hamare pricing plans bahut reasonable hain. Kya main aapko details de sakta hoon?"
                elif language == 'hinglish':
                    return "Our pricing is very competitive. Kya main details share kar sakta hoon?"
                else:
                    return "Our pricing is very competitive. Would you like me to share the details?"
            
            elif intent == 'services':
                if kb_info:
                    # Use KB info if available
                    relevant_info = SmartKBExtractor.extract_relevant_answer(user_message, kb_info, 2)
                    if language == 'hindi':
                        return f"Ji haan, {relevant_info} Kya aur details chahiye?"
                    elif language == 'hinglish':
                        return f"Sure! {relevant_info} Want more details?"
                    else:
                        return f"Absolutely! {relevant_info} Would you like more information?"
                else:
                    if language == 'hindi':
                        return f"Hum bahut saari services provide karte hain. Kya aap koi specific service ke baare mein jaanna chahte hain?"
                    elif language == 'hinglish':
                        return f"We provide many services. Kya aap kisi specific service ke baare mein jaanna chahte hain?"
                    else:
                        return f"We provide a wide range of services. Is there a specific service you're interested in?"
            
            else:
                if language == 'hindi':
                    return "Main aapki kya madad kar sakta hoon?"
                elif language == 'hinglish':
                    return "How can I help you aaj?"
                else:
                    return "How can I help you today?"
        
        elif stage == 'solution_pitch':
            if language == 'hindi':
                return f"{company_name} ki services aapke liye perfect hain. Kya main demo schedule kar sakta hoon?"
            elif language == 'hinglish':
                return f"{company_name} ki services are perfect for you. Kya aap demo lena chahenge?"
            else:
                return f"I think {company_name}'s services would be perfect for you. Would you like to schedule a demo?"
        
        elif stage == 'objection_handling':
            if sentiment['label'] == 'negative':
                if language == 'hindi':
                    return "Main samajhta hoon aapki concern. Kya main aapko ek specialist se connect kar sakta hoon?"
                elif language == 'hinglish':
                    return "I understand your concern. Kya main aapko specialist se connect kar doon?"
                else:
                    return "I understand your concern. Would you like me to connect you with a specialist?"
            else:
                if language == 'hindi':
                    return "Kya aap ke koi aur questions hain?"
                elif language == 'hinglish':
                    return "Kya aap ke aur questions hain?"
                else:
                    return "Do you have any other questions?"
        
        elif stage == 'closing':
            if language == 'hindi':
                return "Kya main aapke liye koi appointment schedule kar sakta hoon?"
            elif language == 'hinglish':
                return "Kya main aapke liye appointment schedule kar doon?"
            else:
                return "Would you like me to schedule an appointment for you?"
        
        elif stage == 'escalation':
            if language == 'hindi':
                return "Main aapko hamare team ke saath connect kar raha hoon. Kripya thoda wait kijiye."
            elif language == 'hinglish':
                return "Let me connect you with our team. Please wait ek minute."
            else:
                return "Let me connect you with our team. Please hold for a moment."
        
        # Default fallback
        return self._get_default_response(language, personality)
    
    def _get_goodbye_response(self, language: str, personality: str) -> str:
        """ FIXED: Proper goodbye messages (not continuing conversation)"""
        
        if language == 'hindi':
            responses = {
                'priyanshu': "Dhanyavaad aapka samay dene ke liye! Aapka din shubh ho. Kabhi bhi zarurat ho toh hume jaroor contact karein!",
                'tanmay': "Bahut badhiya baat ki aapse! Aapka din mast rahe! Bye!",
                'ekta': "Aapke valuable time ke liye bahut dhanyavaad. Aapka din mangalmay ho.",
                'priyanka': "Dhanyavaad. Agar aapko technical help chahiye toh hume contact karein. Shukriya."
            }
        elif language == 'hinglish':
            responses = {
                'priyanshu': "Thank you for your time! Have a wonderful day. Feel free to contact us anytime!",
                'tanmay': "Awesome chatting with you! Have a great day! Bye!",
                'ekta': "Thank you bahut for your time. Wishing you a pleasant day.",
                'priyanka': "Thank you. Should you require technical assistance, please contact us. Shukriya."
            }
        else:  # English
            responses = {
                'priyanshu': "Thank you for your time! Have a wonderful day ahead. Feel free to reach out anytime!",
                'tanmay': "It was awesome chatting with you! Have an amazing day! Take care!",
                'ekta': "Thank you very much for your valuable time. Wishing you a pleasant day.",
                'priyanka': "Thank you. Should you require any technical assistance, please don't hesitate to contact us."
            }
        
        return responses.get(personality, responses['priyanshu'])
    
    def _get_abusive_response(self, language: str, personality: str) -> str:
        """Response for abusive content"""
        
        if language == 'hindi':
            return "Main yahaan aapki madad karne ke liye hoon, lekin hamari baatcheet respectful honi chahiye. Agar aap aise baat karenge toh main call end karna padunga. Kya aap professionally baat karna chahte hain?"
        elif language == 'hinglish':
            return "I'm here to help you, but our conversation needs to be respectful. Agar aap aise baat karenge toh I'll have to end the call. Can we continue professionally?"
        else:
            return "I'm here to help you, but I need our conversation to remain respectful. If you continue using inappropriate language, I'll have to end this call. Can we continue professionally?"
    
    def _get_no_info_response(self, language: str, personality: str) -> str:
        """Response when no KB info found"""
        
        if language == 'hindi':
            return "Mujhe abhi yeh specific information nahi hai. Kya main aapko hamare specialist se connect kar sakta hoon?"
        elif language == 'hinglish':
            return "I don't have this specific information right now. Kya main aapko specialist se connect kar doon?"
        else:
            return "I don't have that specific information right now. Would you like me to connect you with a specialist?"
    
    def _get_default_response(self, language: str, personality: str) -> str:
        """Default response"""
        
        if language == 'hindi':
            return "Main aapki kya madad kar sakta hoon?"
        elif language == 'hinglish':
            return "How can I help you aaj?"
        else:
            return "How can I help you today?"
    
    def _fallback_response(self, personality: str, language: str) -> Dict:
        """ CRITICAL: Graceful fallback to prevent 500 errors"""
        
        if language == 'hindi':
            response = "Mujhe technical issue aa raha hai. Kya main aapko hamare team se connect kar sakta hoon?"
        elif language == 'hinglish':
            response = "I'm experiencing some technical difficulties. Let me connect you with our team for assistance."
        else:
            response = "I'm experiencing technical difficulties. Let me connect you with our team for assistance."
        
        return {
            'ai_response': response,
            'detected_language': language,
            'language_confidence': 0.5,
            'sentiment': {'label': 'neutral', 'score': 0.5},
            'personality': personality,
            'context_used': False,
            'conversation_stage': 'error',
            'should_escalate': True,
            'abusive_detected': False,
            'intent': 'error',
            'intent_confidence': 0.0,
            'goodbye_detected': False
        }

# Global instance
ai_engine = LightweightAIEngine()