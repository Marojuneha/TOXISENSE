import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Play, Pause, MessageSquare, AlertTriangle, CheckCircle2, Zap, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analyzeTextEnhanced, generateLiveFeedMessage, type EnhancedAnalysisResult } from '@/lib/enhancedAnalysis';
import { cn } from '@/lib/utils';
import PlatformSelector from './PlatformSelector';

interface FeedMessage {
  id: string;
  text: string;
  user: string;
  timestamp: Date;
  result?: EnhancedAnalysisResult;
  analyzing?: boolean;
  
}

const FeedMessageItem = memo(({ message }: { message: FeedMessage }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (message.result?.politeAlternative?.text) {
      await navigator.clipboard.writeText(message.result.politeAlternative.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 border transition-all duration-300 fade-in",
        message.analyzing
          ? "bg-secondary/20 border-white/10"
          : message.result?.isOffensive
            ? "bg-destructive/10 border-destructive/30"
            : "bg-success/5 border-success/20"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-primary">@{message.user}</span>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString()}
            </span>
            {false && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                Live
              </span>
            )}
          </div>
          <p className="text-sm break-words">{message.text}</p>

          {message.result?.politeAlternative && (
            <div className="mt-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-xs text-muted-foreground">💡 Suggested rewrite:</p>
                <button
                  onClick={handleCopy}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-primary">{message.result.politeAlternative.text}</p>
            </div>
          )}

          {message.result && !message.analyzing && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                message.result.isOffensive ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
              )}>
                {message.result.isOffensive ? 'Offensive' : 'Non-Offensive'}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Confidence: {(message.result.confidence * 100).toFixed(1)}%
              </span>
              {message.result.category !== 'neutral' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 capitalize">
                  {message.result.category}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          {message.analyzing ? (
            <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          ) : message.result?.isOffensive ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              {message.result.category}
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              safe
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

FeedMessageItem.displayName = 'FeedMessageItem';

const LiveFeed = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<FeedMessage[]>([]);
  const [platform, setPlatform] = useState<'twitter' | 'instagram' | 'youtube' | 'general'>('twitter');
  const [stats, setStats] = useState({ total: 0, offensive: 0, safe: 0 });
  const feedRef = useRef<HTMLDivElement>(null);
  const pendingAnalysisRef = useRef<Set<string>>(new Set());

  const analyzeAndAddMessage = useCallback(async (id: string, text: string, user: string) => {
    if (pendingAnalysisRef.current.has(id)) return;
    pendingAnalysisRef.current.add(id);

    setMessages(prev => [{ id, text, user, timestamp: new Date(), analyzing: true }, ...prev].slice(0, 30));

    try {
      const result = await analyzeTextEnhanced(text, platform);
      pendingAnalysisRef.current.delete(id);
      setMessages(prev =>
        prev.map(msg => msg.id === id ? { ...msg, result, analyzing: false } : msg)
      );
      setStats(prev => ({
        total: prev.total + 1,
        offensive: prev.offensive + (result.isOffensive ? 1 : 0),
        safe: prev.safe + (result.isOffensive ? 0 : 1),
      }));
    } catch {
      pendingAnalysisRef.current.delete(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }
  }, [platform]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const msg = generateLiveFeedMessage();
      analyzeAndAddMessage(msg.id, msg.text, msg.user);
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning, analyzeAndAddMessage]);

  const toggleFeed = useCallback(() => {
    setIsRunning(prev => {
      if (!prev) {
        setMessages([]);
        setStats({ total: 0, offensive: 0, safe: 0 });
        pendingAnalysisRef.current.clear();
      }
      return !prev;
    });
  }, []);

  const handlePlatformSelect = useCallback((p: 'twitter' | 'instagram' | 'youtube' | 'general') => {
    setPlatform(p);
  }, []);

  return (
    <section id="livefeed" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Real-Time</span> Content Monitoring
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Monitor social media content in real-time with AI-powered analysis.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant={isRunning ? "destructive" : "hero"}
                  onClick={toggleFeed}
                  className="gap-2"
                >
                  {isRunning ? (
                    <><Pause className="w-4 h-4" /> Stop Feed</>
                  ) : (
                    <><Play className="w-4 h-4" /> Start Simulation</>
                  )}
                </Button>
                {isRunning && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-muted-foreground">Simulating</span>
                  </div>
                )}
              </div>
              <PlatformSelector selected={platform} onSelect={handlePlatformSelect} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-secondary/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total Analyzed</p>
              </div>
              <div className="bg-success/10 rounded-lg p-4 text-center border border-success/20">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-2xl font-bold text-success">{stats.safe}</span>
                </div>
                <p className="text-xs text-muted-foreground">Non-Offensive</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-4 text-center border border-destructive/20">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-2xl font-bold text-destructive">{stats.offensive}</span>
                </div>
                <p className="text-xs text-muted-foreground">Offensive</p>
              </div>
            </div>

            {/* Feed */}
            <div ref={feedRef} className="h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {messages.length === 0 && !isRunning && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Zap className="w-12 h-12 mb-4 opacity-50" />
                  <p>Click "Start Simulation" to begin live monitoring</p>
                </div>
              )}
              {messages.map((message) => (
                <FeedMessageItem key={message.id} message={message} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveFeed;
