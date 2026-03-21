import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-lg">ToxiSense</h3>
                <p className="text-xs text-muted-foreground">AI Content Safety System</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              AI-powered system for detecting offensive language, emojis, slang, and sarcasm 
              in social media content. Promoting smarter, safer, and respectful conversations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">📝 Text Analyzer</span></li>
              <li><span className="text-sm text-muted-foreground">📊 Batch Analysis</span></li>
              <li><span className="text-sm text-muted-foreground">📡 Live Monitoring</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Capabilities</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground">😡 Emoji Detection</span></li>
              <li><span className="text-sm text-muted-foreground">💬 Slang Analysis</span></li>
              <li><span className="text-sm text-muted-foreground">🎭 Sarcasm Detection</span></li>
              <li><span className="text-sm text-muted-foreground">✨ Polite Alternatives</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 ToxiSense - AI Content Safety System
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
