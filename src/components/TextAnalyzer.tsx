import { useState } from 'react';
import { Send, Loader2, AlertTriangle, CheckCircle2, Info, Trash2, Lightbulb, Sparkles, MessageSquare, Copy, Check, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeTextEnhanced, type EnhancedAnalysisResult } from '@/lib/enhancedAnalysis';
import { cn } from '@/lib/utils';
import { useAnalysisHistory } from '@/hooks/useAnalysisHistory';
import { toast } from 'sonner';
import PlatformSelector from './PlatformSelector';

const TextAnalyzer = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EnhancedAnalysisResult | null>(null);
  const [platform, setPlatform] = useState<'twitter' | 'instagram' | 'youtube' | 'general'>('general');
  const [copied, setCopied] = useState(false);
  const { saveAnalysis } = useAnalysisHistory();

  const maxChars = 500;

  const handleAnalyze = async () => {
    if (!inputText.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeTextEnhanced(inputText, platform);
      setResult(analysisResult);
      
      // Auto-save to history
      await saveAnalysis(inputText, analysisResult);
      toast.success('Analysis saved to history');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setCopied(false);
  };

  const handleCopyPoliteAlternative = async () => {
    if (result?.politeAlternative?.text) {
      await navigator.clipboard.writeText(result.politeAlternative.text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exampleTexts = [
    { text: "Love this! You're amazing 😊🔥", label: "English" },
    { text: "stfu you're so dumb 🤬💀", label: "Offensive" },
    { text: "oh wow what a GENIUS idea 🙄", label: "Sarcasm" },
    { text: "నువ్వు చాలా బాగా చేశావ్ 👏", label: "Telugu" },
    { text: "तू बेवकूफ है 🤡🤡", label: "Hindi" },
    { text: "素晴らしい仕事ですね 😊", label: "Japanese" },
    { text: "أنت غبي جداً 😡", label: "Arabic" },
    { text: "Eres increíble amigo 🔥", label: "Spanish" },
    { text: "nee valla em avvadhu ra 😒", label: "Code-Mixed" },
    { text: "C'est magnifique! ❤️", label: "French" },
    { text: "நீ ஒரு முட்டாள் 💩", label: "Tamil" },
    { text: "yeh bakwas hai bhai 🗑️", label: "Hinglish" },
  ];

  return (
    <section id="analyzer" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Smart</span> Content Analyzer
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Analyze text with emojis 😡🤬💀, internet slang (lol, stfu, bruh), and detect sarcasm. 
            Get polite alternatives for offensive content.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Platform Selector */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">📱 Platform Mode</h3>
              <PlatformSelector selected={platform} onSelect={setPlatform} />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Input Text
                </h3>
                <span className={cn(
                  "text-sm transition-colors",
                  inputText.length > maxChars ? "text-destructive" : "text-muted-foreground"
                )}>
                  {inputText.length}/{maxChars}
                </span>
              </div>

              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text with emojis 😡🤬, slang (stfu, bruh), or regular text..."
                className="min-h-[180px] bg-background/50 border-white/10 resize-none mb-4"
                maxLength={maxChars}
              />

              <div className="flex gap-2 mb-4">
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handleAnalyze}
                  disabled={!inputText.trim() || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Analyze
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClear}
                  disabled={!inputText && !result}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Example Texts */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Try examples:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {exampleTexts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(example.text)}
                      className="text-left text-xs px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors"
                    >
                      <span className="text-primary font-medium">{example.label}:</span>
                      <span className="ml-1 text-muted-foreground">{example.text.substring(0, 25)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Analysis Results
              </h3>

              {!result && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                  <Info className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-center">Enter text and click analyze to see results</p>
                  <p className="text-xs text-center mt-2 text-muted-foreground/70">
                    Supports emojis, slang, and sarcasm detection
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-[350px]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground animate-pulse">Analyzing emojis, slang & content...</p>
                </div>
              )}

              {result && !isAnalyzing && (
                <div className="space-y-4 fade-in max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Main Result */}
                  <div className={cn(
                    "rounded-xl p-4 border-2",
                    result.isOffensive 
                      ? "bg-destructive/10 border-destructive/50" 
                      : "bg-success/10 border-success/50"
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      {result.isOffensive ? (
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      )}
                      <span className={cn(
                        "text-lg font-bold",
                        result.isOffensive ? "text-destructive" : "text-success"
                      )}>
                        {result.isOffensive ? 'OFFENSIVE CONTENT DETECTED' : 'CONTENT IS SAFE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            result.isOffensive ? "bg-destructive" : "bg-success"
                          )}
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Classification Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className={cn(
                        "font-semibold text-sm capitalize",
                        result.category === 'hate' && "text-destructive",
                        result.category === 'abuse' && "text-warning",
                        result.category === 'sarcasm' && "text-[hsl(280,70%,60%)]",
                        result.category === 'neutral' && "text-success"
                      )}>
                        {result.category}
                      </p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Target</p>
                      <p className="font-semibold text-sm capitalize">{result.target}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Language</p>
                      <p className="font-semibold text-sm">{result.language}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Platform</p>
                      <p className="font-semibold text-sm capitalize">{result.platform}</p>
                    </div>
                  </div>

                  {/* Emoji Analysis */}
                  {result.emojiAnalysis.length > 0 && (
                    <div className="rounded-xl border border-primary/20 overflow-hidden">
                      <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">Emoji Analysis</span>
                        <span className="text-xs text-muted-foreground ml-auto">{result.emojiAnalysis.length} detected</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {result.emojiAnalysis.map((emoji, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all",
                              emoji.sentiment === 'negative' 
                                ? "bg-destructive/10 border-destructive/30" 
                                : emoji.sentiment === 'positive' 
                                  ? "bg-success/10 border-success/30" 
                                  : "bg-secondary/20 border-border"
                            )}
                          >
                            <span className="text-2xl">{emoji.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{emoji.meaning}</p>
                              <span className={cn(
                                "text-xs font-semibold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5",
                                emoji.sentiment === 'negative' ? "bg-destructive/20 text-destructive" :
                                emoji.sentiment === 'positive' ? "bg-success/20 text-success" :
                                "bg-muted/40 text-muted-foreground"
                              )}>
                                {emoji.sentiment}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Slang Detection */}
                  {result.slangDetected.length > 0 && (
                    <div className="bg-secondary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Slang Detected:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.slangDetected.map((slang, i) => (
                          <div
                            key={i}
                            className={cn(
                              "px-2 py-1 rounded-lg text-xs",
                              slang.isOffensive ? "bg-destructive/20 text-destructive" : "bg-muted/30"
                            )}
                          >
                            <span className="font-mono font-bold">{slang.slang}</span>
                            <span className="ml-1 text-muted-foreground">= {slang.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sarcasm Indicator */}
                  {result.sarcasmIndicator.detected && (
                    <div className="bg-[hsl(280,70%,50%)]/10 rounded-lg p-3 border border-[hsl(280,70%,50%)]/30">
                      <p className="text-xs font-medium text-[hsl(280,70%,60%)] mb-1">⚡ Sarcasm Detected</p>
                      <p className="text-xs text-muted-foreground">{result.sarcasmIndicator.explanation}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[hsl(280,70%,50%)]"
                            style={{ width: `${result.sarcasmIndicator.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{(result.sarcasmIndicator.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Polite Alternative with Severity */}
                  {result.politeAlternative && (
                    <div className={cn(
                      "rounded-lg p-3 border",
                      result.politeAlternative.severity === 'high' && "bg-destructive/10 border-destructive/30",
                      result.politeAlternative.severity === 'medium' && "bg-warning/10 border-warning/30",
                      result.politeAlternative.severity === 'low' && "bg-primary/10 border-primary/30"
                    )}>
                      <p className={cn(
                        "text-xs font-medium mb-2 flex items-center gap-1",
                        result.politeAlternative.severity === 'high' && "text-destructive",
                        result.politeAlternative.severity === 'medium' && "text-warning",
                        result.politeAlternative.severity === 'low' && "text-primary"
                      )}>
                        <Lightbulb className="w-3 h-3" /> {result.politeAlternative.message}
                      </p>
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-foreground italic bg-background/50 rounded px-2 py-1 flex-1">
                          "{result.politeAlternative.text}"
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={handleCopyPoliteAlternative}
                          title="Copy to clipboard"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Severity:</span>
                        <span className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full uppercase",
                          result.politeAlternative.severity === 'high' && "bg-destructive/20 text-destructive",
                          result.politeAlternative.severity === 'medium' && "bg-warning/20 text-warning",
                          result.politeAlternative.severity === 'low' && "bg-primary/20 text-primary"
                        )}>
                          {result.politeAlternative.severity}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Highlighted Words */}
                  {result.highlightedWords.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Attention Heatmap:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.highlightedWords.map((item, i) => (
                          <span
                            key={i}
                            className={cn(
                              "px-2 py-1 rounded text-sm",
                              item.isOffensive ? "highlight-offensive" : "bg-muted/30",
                              item.type === 'emoji' && "text-lg",
                              item.type === 'slang' && "font-mono"
                            )}
                            title={`Score: ${(item.score * 100).toFixed(1)}% | Type: ${item.type}`}
                          >
                            {item.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanations */}
                  <div className="bg-secondary/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">Analysis Summary:</p>
                    <ul className="space-y-1">
                      {result.explanations.map((exp, i) => (
                        <li key={i} className="text-xs text-secondary-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {exp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Report / Feedback Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
                    onClick={() => {
                      toast.success('Thank you for your feedback! We\'ll review this analysis.');
                    }}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Report Incorrect Result
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextAnalyzer;
