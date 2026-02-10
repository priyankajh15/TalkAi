"""
✅ DYNAMIC KB EXTRACTION - Adapts to Question Complexity

Instead of hardcoding max_sentences=2 or 3, this intelligently decides
how many sentences to return based on the user's question.

REPLACE THE ENTIRE SmartKBExtractor CLASS (lines 447-512) with this:
"""

class SmartKBExtractor:
    """✅ IMPROVED: Dynamic extraction that adapts to question complexity"""
    
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
        ✅ DYNAMIC: Automatically determines optimal sentence count based on question
        
        Args:
            question: User's question
            kb_content: Knowledge base content to search
            max_sentences: Optional override (if None, auto-detected)
        
        Returns:
            Relevant answer with appropriate length
        """
        if not kb_content or not question:
            return ""
        
        # ✅ DYNAMIC: Analyze question complexity
        complexity_info = SmartKBExtractor._analyze_question_complexity(question)
        
        # Use provided max_sentences or auto-detected value
        if max_sentences is None:
            max_sentences = complexity_info['max_sentences']
            max_chars = complexity_info['max_chars']
        else:
            # If manually overridden, use standard limits
            max_chars = min(max_sentences * 80, 200)
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"📊 Question complexity: {complexity_info['complexity']} "
                   f"(max_sentences={max_sentences}, max_chars={max_chars})")
        logger.debug(f"   Reason: {complexity_info['reason']}")
        
        # Split into proper sentences
        import re
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
        
        # ✅ Build result dynamically based on complexity
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
        
        logger.info(f"✅ Extracted {len(top_sentences)} sentence(s), {len(result)} chars")
        
        return result


# ============================================================================
# UPDATED: _generate_smart_kb_answer (line 786)
# ============================================================================
# Also update this function to use the dynamic extraction:

def _generate_smart_kb_answer(
    self,
    user_question: str,
    kb_content: str,
    language: str,
    personality: str,
    intent: str
) -> str:
    """✅ DYNAMIC: Generate intelligent answer that adapts to question complexity"""
    
    # ✅ DYNAMIC: No max_sentences parameter - let it auto-detect!
    relevant_answer = SmartKBExtractor.extract_relevant_answer(
        user_question, 
        kb_content
        # max_sentences removed - automatically determined!
    )
    
    if not relevant_answer:
        return self._get_no_info_response(language, personality)
    
    # Build conversational response
    if language == 'hindi':
        intros = {
            'priyanshu': "Ji haan, ",
            'tanmay': "Haan bilkul, ",
            'ekta': "Zaroor, ",
            'priyanka': "Bilkul ji, "
        }
        follow_ups = [
            " Kya aur kuch jaanna chahenge?",
            " Koi aur sawal?",
            " Aur kuch?"
        ]
    elif language == 'hinglish':
        intros = {
            'priyanshu': "Sure! ",
            'tanmay': "Yes, ",
            'ekta': "Of course, ",
            'priyanka': "Absolutely, "
        }
        follow_ups = [
            " Kuch aur chahiye?",
            " Any other questions?",
            " Aur kuch?"
        ]
    else:  # English
        intros = {
            'priyanshu': "Sure! ",
            'tanmay': "Yes, ",
            'ekta': "Certainly, ",
            'priyanka': "Absolutely, "
        }
        follow_ups = [
            " What else would you like to know?",
            " Any other questions?",
            " Anything else?"
        ]
    
    intro = intros.get(personality, intros['priyanshu'])
    import random
    follow_up = random.choice(follow_ups)
    
    response = f"{intro}{relevant_answer}{follow_up}"
    
    # ✅ Safety cap (should rarely trigger with dynamic limits)
    if len(response) > 280:
        response = response[:277].strip() + "..."
    
    return response


# ============================================================================
# EXAMPLE USAGE & EXPECTED BEHAVIOR
# ============================================================================
"""
SIMPLE QUESTIONS (1 sentence, ~100 chars):
Q: "What is cricket?"
A: "Sure! Cricket is a bat-and-ball sport. Any other questions?"

Q: "How many players?"
A: "Certainly, There are 11 players per team. What else would you like to know?"

MODERATE QUESTIONS (2 sentences, ~160 chars):
Q: "Give me the highlights"
A: "Sure! India scored 350 runs with Virat scoring a century. Australia was all out for 280. Any other questions?"

Q: "Tell me about pricing"
A: "Absolutely, Our basic plan starts at $99/month. Enterprise plans are customized based on needs. Anything else?"

DETAILED QUESTIONS (3 sentences, ~200 chars):
Q: "Explain how cloud hosting works"
A: "Certainly, Cloud hosting distributes your website across multiple servers for redundancy. If one server fails, another takes over automatically. This ensures 99.9% uptime. Would you like more information?"

Q: "What are the differences between plans?"
A: "Sure! The basic plan includes 100GB storage and email support. Pro adds 500GB and phone support. Enterprise offers unlimited resources and dedicated account manager. What else would you like to know?"
"""
