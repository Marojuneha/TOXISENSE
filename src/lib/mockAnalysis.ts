// Mock analysis functions for demonstration
// In production, these would call actual ML backend APIs

export interface AnalysisResult {
  isOffensive: boolean;
  confidence: number;
  category: 'hate' | 'abuse' | 'neutral';
  target: 'individual' | 'group' | 'community' | 'none';
  language: string;
  highlightedWords: { word: string; score: number; isOffensive: boolean }[];
  explanations: string[];
}

// Simulated offensive word patterns for demo
const offensivePatterns = [
  'hate', 'stupid', 'idiot', 'dumb', 'ugly', 'kill', 'die', 'worst',
  'terrible', 'disgusting', 'loser', 'pathetic', 'moron'
];

const detectLanguage = (text: string): string => {
  // Simple heuristic for demo
  const hindiChars = /[\u0900-\u097F]/;
  const tamilChars = /[\u0B80-\u0BFF]/;
  const spanishWords = /\b(el|la|de|que|y|en|un|es|por|con)\b/i;
  
  if (hindiChars.test(text)) return 'Hindi';
  if (tamilChars.test(text)) return 'Tamil';
  if (spanishWords.test(text)) return 'Spanish';
  return 'English';
};

export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const words = text.toLowerCase().split(/\s+/);
  const language = detectLanguage(text);
  
  const highlightedWords = words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    const isOffensive = offensivePatterns.some(pattern => 
      cleanWord.includes(pattern)
    );
    return {
      word: cleanWord,
      score: isOffensive ? 0.7 + Math.random() * 0.3 : Math.random() * 0.3,
      isOffensive
    };
  }).filter(w => w.word.length > 0);
  
  const offensiveCount = highlightedWords.filter(w => w.isOffensive).length;
  const isOffensive = offensiveCount > 0;
  const confidence = isOffensive 
    ? 0.75 + Math.random() * 0.2 
    : 0.85 + Math.random() * 0.1;
  
  let category: 'hate' | 'abuse' | 'neutral' = 'neutral';
  let target: 'individual' | 'group' | 'community' | 'none' = 'none';
  
  if (isOffensive) {
    category = offensiveCount > 2 ? 'hate' : 'abuse';
    target = text.includes('you') || text.includes('your') 
      ? 'individual' 
      : text.includes('they') || text.includes('them') || text.includes('all')
        ? 'group'
        : 'community';
  }
  
  const explanations = isOffensive
    ? [
        `Detected ${offensiveCount} potentially harmful word(s) using CNN-LSTM attention analysis`,
        `XLM-RoBERTa embedding similarity: ${(confidence * 100).toFixed(1)}% match with offensive patterns`,
        `SHAP value analysis indicates negative sentiment directed at ${target}`,
        `Attention mechanism highlighted key offensive tokens in the input`
      ]
    : [
        'No offensive patterns detected in the text',
        `Language model confidence: ${(confidence * 100).toFixed(1)}%`,
        'Sentiment analysis indicates neutral or positive content',
        'Text passes community guidelines standards'
      ];
  
  return {
    isOffensive,
    confidence,
    category,
    target,
    language,
    highlightedWords,
    explanations
  };
};

export interface BatchResult {
  id: number;
  text: string;
  result: AnalysisResult;
}

export const analyzeBatch = async (texts: string[]): Promise<BatchResult[]> => {
  const results: BatchResult[] = [];
  
  for (let i = 0; i < texts.length; i++) {
    const result = await analyzeText(texts[i]);
    results.push({
      id: i + 1,
      text: texts[i],
      result
    });
  }
  
  return results;
};

export interface DashboardStats {
  totalAnalyzed: number;
  offensiveCount: number;
  neutralCount: number;
  categoryBreakdown: { name: string; value: number; color: string }[];
  languageBreakdown: { name: string; value: number }[];
  timeSeriesData: { time: string; offensive: number; neutral: number }[];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export const getDashboardStats = (): DashboardStats => {
  return {
    totalAnalyzed: 15847,
    offensiveCount: 4231,
    neutralCount: 11616,
    categoryBreakdown: [
      { name: 'Neutral', value: 11616, color: 'hsl(142, 76%, 45%)' },
      { name: 'Abuse', value: 2854, color: 'hsl(38, 92%, 50%)' },
      { name: 'Hate Speech', value: 1377, color: 'hsl(0, 84%, 60%)' }
    ],
    languageBreakdown: [
      { name: 'English', value: 8523 },
      { name: 'Hindi', value: 3241 },
      { name: 'Code-Mixed', value: 2847 },
      { name: 'Tamil', value: 892 },
      { name: 'Spanish', value: 344 }
    ],
    timeSeriesData: [
      { time: '00:00', offensive: 45, neutral: 120 },
      { time: '04:00', offensive: 23, neutral: 89 },
      { time: '08:00', offensive: 67, neutral: 245 },
      { time: '12:00', offensive: 89, neutral: 312 },
      { time: '16:00', offensive: 112, neutral: 398 },
      { time: '20:00', offensive: 78, neutral: 267 },
    ],
    accuracy: 94.7,
    precision: 93.2,
    recall: 91.8,
    f1Score: 92.5
  };
};
