import { Zap, Shield, Brain, Smile, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onNavigate: (section: string) => void;
}

const HeroSection = ({ onNavigate }: HeroSectionProps) => {
  const features = [
    { icon: Smile, label: 'Emoji Detection', desc: '😡 🤬 💀 Analysis' },
    { icon: Brain, label: 'Slang & Sarcasm', desc: 'Internet Language' },
    { icon: AlertCircle, label: 'Auto Rewrite', desc: 'Polite Alternatives' },
    { icon: Zap, label: 'Multilingual', desc: '15+ Languages' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-[hsl(var(--theme-bg-accent))] to-background" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[hsl(var(--theme-accent-1))]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--theme-accent-2))]/5 rounded-full blur-[150px]" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40 float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Pre-title Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-6 fade-in">
            <span className="text-sm font-medium text-primary">AI-Powered Content Safety</span>
          </div>


          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="block gradient-text">🛡️ ToxiSense</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-foreground/90 max-w-2xl mx-auto mb-4 fade-in font-medium" style={{ animationDelay: '0.2s' }}>
            AI System for Detecting Offensive Language in Social Media Content
          </p>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 fade-in" style={{ animationDelay: '0.25s' }}>
            <span className="text-primary">Smarter</span> • <span className="text-accent">Safer</span> • <span className="text-[hsl(var(--theme-accent-2))]">Respectful Conversations</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 fade-in" style={{ animationDelay: '0.3s' }}>
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => onNavigate('analyzer')}
              className="group"
            >
              Start Analyzing
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
            </Button>
            <Button 
              variant="glass" 
              size="xl"
              onClick={() => onNavigate('batch')}
            >
              Batch Analysis
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto fade-in" style={{ animationDelay: '0.4s' }}>
            {features.map((feature, index) => (
              <div
                key={feature.label}
                className="glass-card rounded-xl p-4 hover:scale-105 transition-transform duration-300 group border-primary/10"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.label}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
