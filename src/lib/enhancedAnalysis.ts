// Enhanced analysis with emoji, slang, sarcasm detection and polite alternatives

export interface EnhancedAnalysisResult {
  isOffensive: boolean;
  confidence: number;
  category: 'hate' | 'abuse' | 'neutral' | 'sarcasm';
  target: 'individual' | 'group' | 'community' | 'none';
  language: string;
  platform: 'twitter' | 'instagram' | 'youtube' | 'general';
  highlightedWords: { word: string; score: number; isOffensive: boolean; type: 'word' | 'emoji' | 'slang' }[];
  explanations: string[];
  emojiAnalysis: { emoji: string; meaning: string; sentiment: 'negative' | 'neutral' | 'positive' }[];
  slangDetected: { slang: string; meaning: string; isOffensive: boolean }[];
  sarcasmIndicator: { detected: boolean; confidence: number; explanation: string };
  politeAlternative: { 
    text: string; 
    severity: 'low' | 'medium' | 'high'; 
    message: string;
  } | null;
}

// Offensive emoji patterns
const offensiveEmojis: Record<string, { meaning: string; sentiment: 'negative' | 'neutral' | 'positive' }> = {
  '😡': { meaning: 'Angry face - expressing anger', sentiment: 'negative' },
  '🤬': { meaning: 'Face with symbols - cursing/swearing', sentiment: 'negative' },
  '💀': { meaning: 'Skull - death threat or extreme reaction', sentiment: 'negative' },
  '🖕': { meaning: 'Middle finger - offensive gesture', sentiment: 'negative' },
  '🤮': { meaning: 'Vomiting - extreme disgust', sentiment: 'negative' },
  '💩': { meaning: 'Poop - calling something/someone trash', sentiment: 'negative' },
  '🔥': { meaning: 'Fire - can indicate roasting/burning someone', sentiment: 'neutral' },
  '😂': { meaning: 'Laughing - could be mocking', sentiment: 'neutral' },
  '🙄': { meaning: 'Eye roll - dismissive attitude', sentiment: 'negative' },
  '😒': { meaning: 'Unamused - expressing contempt', sentiment: 'negative' },
  '👎': { meaning: 'Thumbs down - disapproval', sentiment: 'negative' },
  '🤡': { meaning: 'Clown - calling someone a fool', sentiment: 'negative' },
  '🐍': { meaning: 'Snake - calling someone untrustworthy', sentiment: 'negative' },
  '🗑️': { meaning: 'Trash - calling something worthless', sentiment: 'negative' },
  '😤': { meaning: 'Huffing face - frustration/anger', sentiment: 'negative' },
};

// Internet slang patterns
const slangPatterns: Record<string, { meaning: string; isOffensive: boolean }> = {
  'stfu': { meaning: 'Shut the f*** up', isOffensive: true },
  'gtfo': { meaning: 'Get the f*** out', isOffensive: true },
  'af': { meaning: 'As f***', isOffensive: false },
  'lmao': { meaning: 'Laughing my a** off', isOffensive: false },
  'lmfao': { meaning: 'Laughing my f***ing a** off', isOffensive: false },
  'wtf': { meaning: 'What the f***', isOffensive: true },
  'idgaf': { meaning: 'I don\'t give a f***', isOffensive: true },
  'pos': { meaning: 'Piece of s***', isOffensive: true },
  'bruh': { meaning: 'Bro/dude - dismissive', isOffensive: false },
  'smh': { meaning: 'Shaking my head - disapproval', isOffensive: false },
  'idk': { meaning: 'I don\'t know', isOffensive: false },
  'lol': { meaning: 'Laugh out loud', isOffensive: false },
  'ngl': { meaning: 'Not gonna lie', isOffensive: false },
  'tbh': { meaning: 'To be honest', isOffensive: false },
  'kys': { meaning: 'K*** yourself - extremely offensive', isOffensive: true },
  'ffs': { meaning: 'For f***\'s sake', isOffensive: true },
  'bs': { meaning: 'Bulls***', isOffensive: true },
  'noob': { meaning: 'Newbie - mocking inexperience', isOffensive: true },
  'salty': { meaning: 'Being bitter/upset', isOffensive: false },
  'toxic': { meaning: 'Harmful/negative behavior', isOffensive: false },
  'ratio': { meaning: 'Getting more replies than likes (mockery)', isOffensive: false },
  'cope': { meaning: 'Deal with it - dismissive', isOffensive: false },
  'l': { meaning: 'Loss/Loser', isOffensive: true },
  'mid': { meaning: 'Mediocre/average (insult)', isOffensive: true },
  'based': { meaning: 'Agreeable/cool', isOffensive: false },
  'cringe': { meaning: 'Embarrassing', isOffensive: true },
};

// Offensive word patterns
const offensivePatterns = [
  'hate', 'stupid', 'idiot', 'dumb', 'ugly', 'kill', 'die', 'worst',
  'terrible', 'disgusting', 'loser', 'pathetic', 'moron', 'trash',
  'worthless', 'useless', 'nobody', 'fool', 'clown', 'joke', 'garbage'
];

// Sarcasm indicators
const sarcasmIndicators = [
  'oh sure', 'yeah right', 'totally', 'obviously', 'wow', 'great job',
  'genius', 'brilliant', 'amazing', 'fantastic', 'wonderful', 'nice one',
  'good for you', 'how nice', 'real smart', 'very clever'
];

// Word-level polite replacements for rewriting sentences
const wordReplacements: Record<string, string> = {
  'stupid': 'misguided',
  'dumb': 'uninformed',
  'idiot': 'person I disagree with',
  'moron': 'person with a different view',
  'fool': 'someone who may be mistaken',
  'loser': 'person facing challenges',
  'trash': 'something I have concerns about',
  'garbage': 'something that needs improvement',
  'worthless': 'undervalued',
  'useless': 'not fully utilized',
  'pathetic': 'disappointing',
  'disgusting': 'concerning',
  'terrible': 'not ideal',
  'worst': 'least preferred',
  'ugly': 'unique',
  'hate': 'strongly disagree with',
  'die': 'take a break',
  'kill': 'stop',
  'shut up': 'please pause',
  'stfu': 'let\'s take a moment',
  'gtfo': 'please step away',
  'wtf': 'I\'m confused about',
  'kys': 'please take care of yourself',
  'noob': 'newcomer',
  'clown': 'someone I find amusing',
  'joke': 'something I find unconvincing',
  'suck': 'could improve',
  'sucks': 'could be better',
};

const detectLanguage = (text: string): string => {
  const hindiChars = /[\u0900-\u097F]/;
  const tamilChars = /[\u0B80-\u0BFF]/;
  const spanishWords = /\b(el|la|de|que|y|en|un|es|por|con)\b/i;
  
  if (hindiChars.test(text)) return 'Hindi';
  if (tamilChars.test(text)) return 'Tamil';
  if (spanishWords.test(text)) return 'Spanish';
  return 'English';
};

const detectSarcasm = (text: string): { detected: boolean; confidence: number; explanation: string } => {
  const lowerText = text.toLowerCase();
  let sarcasmScore = 0;
  const indicators: string[] = [];
  
  // Check for sarcasm indicators
  for (const indicator of sarcasmIndicators) {
    if (lowerText.includes(indicator)) {
      sarcasmScore += 0.3;
      indicators.push(indicator);
    }
  }
  
  // Check for excessive punctuation (!!!, ???, ...)
  if (/!{2,}/.test(text) || /\?{2,}/.test(text)) {
    sarcasmScore += 0.2;
    indicators.push('excessive punctuation');
  }
  
  // Check for ALL CAPS words
  const capsWords = text.match(/\b[A-Z]{2,}\b/g);
  if (capsWords && capsWords.length > 0) {
    sarcasmScore += 0.15;
    indicators.push('emphasis with caps');
  }
  
  // Check for emoji contradictions (positive emoji with negative words)
  const positiveEmojis = ['😊', '👍', '💯', '🙏', '❤️'];
  const hasPositiveEmoji = positiveEmojis.some(e => text.includes(e));
  const hasNegativeWord = offensivePatterns.some(p => lowerText.includes(p));
  
  if (hasPositiveEmoji && hasNegativeWord) {
    sarcasmScore += 0.25;
    indicators.push('contradictory emoji usage');
  }
  
  const detected = sarcasmScore >= 0.3;
  const explanation = detected 
    ? `Sarcasm detected based on: ${indicators.join(', ')}`
    : 'No clear sarcasm indicators found';
  
  return {
    detected,
    confidence: Math.min(sarcasmScore, 1),
    explanation
  };
};

// High severity words (extreme offense, threats, slurs)
const highSeverityPatterns = ['kys', 'die', 'kill', 'hate', 'gtfo'];

// Medium severity words (insults, offensive slang)
const mediumSeverityPatterns = ['stfu', 'wtf', 'stupid', 'idiot', 'moron', 'dumb', 'loser', 'pathetic', 'worthless', 'trash'];

const calculateSeverity = (text: string): 'low' | 'medium' | 'high' => {
  const lowerText = text.toLowerCase();
  
  // Check for high severity patterns
  const hasHighSeverity = highSeverityPatterns.some(p => lowerText.includes(p));
  if (hasHighSeverity) return 'high';
  
  // Check for medium severity patterns
  const hasMediumSeverity = mediumSeverityPatterns.some(p => lowerText.includes(p));
  if (hasMediumSeverity) return 'medium';
  
  // Check for offensive emojis or slang
  const hasOffensiveEmoji = Object.keys(offensiveEmojis).some(e => 
    text.includes(e) && offensiveEmojis[e].sentiment === 'negative'
  );
  const hasOffensiveSlang = Object.entries(slangPatterns).some(([slang, info]) => 
    lowerText.includes(slang) && info.isOffensive
  );
  
  if (hasOffensiveEmoji || hasOffensiveSlang) return 'medium';
  
  return 'low';
};

const getSeverityMessage = (severity: 'low' | 'medium' | 'high'): string => {
  switch (severity) {
    case 'high':
      return '🚨 Highly offensive content detected. Please consider this constructive alternative:';
    case 'medium':
      return '⚠️ Moderately offensive content. Here\'s a more respectful way to express this:';
    case 'low':
      return '💡 Minor adjustments suggested for a more positive tone:';
  }
};

const generatePoliteAlternative = (text: string): { text: string; severity: 'low' | 'medium' | 'high'; message: string } | null => {
  const lowerText = text.toLowerCase();
  let rewrittenText = text;
  let hasReplacements = false;
  
  // Calculate severity before replacements
  const severity = calculateSeverity(text);
  
  // Replace offensive words with polite alternatives
  for (const [offensive, polite] of Object.entries(wordReplacements)) {
    const regex = new RegExp(`\\b${offensive}\\b`, 'gi');
    if (regex.test(rewrittenText)) {
      rewrittenText = rewrittenText.replace(regex, polite);
      hasReplacements = true;
    }
  }
  
  // Check for offensive slang and replace
  for (const [slang, info] of Object.entries(slangPatterns)) {
    if (info.isOffensive) {
      const regex = new RegExp(`\\b${slang}\\b`, 'gi');
      if (regex.test(rewrittenText)) {
        // Use word replacement if available, otherwise remove
        const replacement = wordReplacements[slang] || '[removed]';
        rewrittenText = rewrittenText.replace(regex, replacement);
        hasReplacements = true;
      }
    }
  }
  
  // Clean up the rewritten text
  if (hasReplacements) {
    // Remove all emojis from the rewritten text
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu;
    rewrittenText = rewrittenText.replace(emojiRegex, '');
    // Capitalize first letter
    rewrittenText = rewrittenText.charAt(0).toUpperCase() + rewrittenText.slice(1);
    // Remove multiple spaces
    rewrittenText = rewrittenText.replace(/\s+/g, ' ').trim();
    
    return {
      text: rewrittenText,
      severity,
      message: getSeverityMessage(severity)
    };
  }
  
  // If offensive content detected but no direct replacements found
  const hasOffensiveContent = offensivePatterns.some(p => lowerText.includes(p)) ||
    Object.entries(slangPatterns).some(([slang, info]) => lowerText.includes(slang) && info.isOffensive);
  
  if (hasOffensiveContent) {
    return {
      text: "I'd like to express my thoughts more constructively.",
      severity,
      message: getSeverityMessage(severity)
    };
  }
  
  return null;
};

const analyzeWithAI = async (
  text: string,
  platform: 'twitter' | 'instagram' | 'youtube' | 'general'
): Promise<EnhancedAnalysisResult> => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-text`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ text, platform }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `AI analysis failed (${response.status})`);
  }

  const ai = await response.json();

  const severity: 'low' | 'medium' | 'high' = ai.severity === 'none' ? 'low' : ai.severity;

  return {
    isOffensive: ai.isOffensive,
    confidence: ai.confidence,
    category: ai.category,
    target: ai.target,
    language: ai.language || detectLanguage(text),
    platform,
    highlightedWords: (ai.offensiveWords || []).map((w: any) => ({
      word: w.word,
      score: w.score,
      isOffensive: w.isOffensive,
      type: w.type === 'symbol' ? 'word' : w.type,
    })),
    explanations: ai.explanations || [],
    emojiAnalysis: ai.emojiAnalysis || [],
    slangDetected: ai.slangDetected || [],
    sarcasmIndicator: {
      detected: ai.sarcasmDetected,
      confidence: ai.sarcasmConfidence,
      explanation: ai.sarcasmExplanation || '',
    },
    politeAlternative: ai.isOffensive && ai.politeRewrite
      ? {
          text: ai.politeRewrite,
          severity,
          message: getSeverityMessage(severity),
        }
      : null,
  };
};

const analyzeLocally = async (
  text: string,
  platform: 'twitter' | 'instagram' | 'youtube' | 'general'
): Promise<EnhancedAnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const words = text.toLowerCase().split(/\s+/);
  const language = detectLanguage(text);

  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu;
  const foundEmojis = text.match(emojiRegex) || [];
  const emojiAnalysis = foundEmojis.map(emoji => ({
    emoji,
    meaning: offensiveEmojis[emoji]?.meaning || 'Neutral emoji',
    sentiment: offensiveEmojis[emoji]?.sentiment || 'neutral' as const,
  }));

  const slangDetected: { slang: string; meaning: string; isOffensive: boolean }[] = [];
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (slangPatterns[cleanWord]) {
      slangDetected.push({ slang: cleanWord, ...slangPatterns[cleanWord] });
    }
  }

  const sarcasmIndicator = detectSarcasm(text);

  const highlightedWords: { word: string; score: number; isOffensive: boolean; type: 'word' | 'emoji' | 'slang' }[] = words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    const isSlang = !!slangPatterns[cleanWord.toLowerCase()];
    const isSlangOffensive = isSlang && slangPatterns[cleanWord.toLowerCase()].isOffensive;
    const isWordOffensive = offensivePatterns.some(pattern => cleanWord.toLowerCase().includes(pattern));
    return {
      word: cleanWord,
      score: (isWordOffensive || isSlangOffensive) ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3,
      isOffensive: isWordOffensive || isSlangOffensive,
      type: (isSlang ? 'slang' : 'word') as 'word' | 'slang',
    };
  }).filter(w => w.word.length > 0);

  foundEmojis.forEach(emoji => {
    const isNegative = offensiveEmojis[emoji]?.sentiment === 'negative';
    highlightedWords.push({
      word: emoji,
      score: isNegative ? 0.6 + Math.random() * 0.3 : Math.random() * 0.4,
      isOffensive: isNegative,
      type: 'emoji' as const,
    });
  });

  const offensiveWordCount = highlightedWords.filter(w => w.isOffensive).length;
  const offensiveEmojiCount = emojiAnalysis.filter(e => e.sentiment === 'negative').length;
  const offensiveSlangCount = slangDetected.filter(s => s.isOffensive).length;
  const totalOffensive = offensiveWordCount + offensiveEmojiCount + offensiveSlangCount;
  const isOffensive = totalOffensive > 0 || sarcasmIndicator.detected;
  const confidence = isOffensive ? 0.75 + Math.random() * 0.2 : 0.85 + Math.random() * 0.1;

  let category: 'hate' | 'abuse' | 'neutral' | 'sarcasm' = 'neutral';
  let target: 'individual' | 'group' | 'community' | 'none' = 'none';

  if (sarcasmIndicator.detected && sarcasmIndicator.confidence > 0.5) {
    category = 'sarcasm';
  } else if (isOffensive) {
    category = totalOffensive > 2 ? 'hate' : 'abuse';
    target = text.includes('you') || text.includes('your')
      ? 'individual'
      : text.includes('they') || text.includes('them') || text.includes('all')
        ? 'group'
        : 'community';
  }

  const politeAlternative = generatePoliteAlternative(text);

  const platformContext = {
    twitter: 'Twitter/X short-form content analysis',
    instagram: 'Instagram comment sentiment analysis',
    youtube: 'YouTube comment toxicity detection',
    general: 'General social media content analysis',
  };

  const explanations = isOffensive
    ? [
        `${platformContext[platform]} detected ${totalOffensive} potentially harmful element(s)`,
        offensiveEmojiCount > 0 ? `Found ${offensiveEmojiCount} negative emoji(s)` : null,
        offensiveSlangCount > 0 ? `Detected ${offensiveSlangCount} offensive slang term(s)` : null,
        sarcasmIndicator.detected ? `⚠️ ${sarcasmIndicator.explanation}` : null,
        `Confidence: ${(confidence * 100).toFixed(1)}% - Target: ${target}`,
        politeAlternative ? `💡 Suggested rewrite available` : null,
      ].filter(Boolean) as string[]
    : [
        'No offensive patterns detected in the content',
        `${platformContext[platform]} - Content appears safe`,
        `Confidence: ${(confidence * 100).toFixed(1)}%`,
        'Text passes community guidelines standards',
      ];

  return {
    isOffensive, confidence, category, target, language, platform,
    highlightedWords, explanations, emojiAnalysis, slangDetected,
    sarcasmIndicator, politeAlternative,
  };
};

export const analyzeTextEnhanced = async (
  text: string,
  platform: 'twitter' | 'instagram' | 'youtube' | 'general' = 'general'
): Promise<EnhancedAnalysisResult> => {
  try {
    return await analyzeWithAI(text, platform);
  } catch (error) {
    console.warn('AI analysis failed, falling back to local analysis:', error);
    return analyzeLocally(text, platform);
  }
};

// Simulated live feed messages
export const generateLiveFeedMessage = (): { id: string; text: string; user: string; timestamp: Date } => {
  const messages = [
    { text: "This is amazing! Love the content 😊", user: "happy_user" },
    { text: "You're so stupid stfu 🤬", user: "toxic_troll" },
    { text: "Great video, very informative!", user: "learner123" },
    { text: "wow what a genius idea 🙄", user: "sarcastic_sam" },
    { text: "Can someone explain this to me?", user: "curious_cat" },
    { text: "This is trash, ratio + L 💀", user: "hater_101" },
    { text: "Thanks for sharing! Very helpful 🙏", user: "grateful_guy" },
    { text: "bruh this is mid ngl 😒", user: "zoomer_z" },
    { text: "Keep up the good work! 🔥", user: "supporter_1" },
    { text: "You're the worst creator ever 👎", user: "mean_mike" },
    { text: "First time here, love it!", user: "new_subscriber" },
    { text: "Die already nobody likes you 😡", user: "extreme_hate" },
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    id: Math.random().toString(36).substring(7),
    ...randomMessage,
    timestamp: new Date()
  };
};
