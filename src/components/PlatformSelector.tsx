import { Twitter, Instagram, Youtube, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformSelectorProps {
  selected: 'twitter' | 'instagram' | 'youtube' | 'general';
  onSelect: (platform: 'twitter' | 'instagram' | 'youtube' | 'general') => void;
}

const platforms = [
  { id: 'general' as const, label: 'General', icon: Globe, color: 'text-primary' },
  { id: 'twitter' as const, label: 'Twitter/X', icon: Twitter, color: 'text-[hsl(203,89%,53%)]' },
  { id: 'instagram' as const, label: 'Instagram', icon: Instagram, color: 'text-[hsl(340,75%,54%)]' },
  { id: 'youtube' as const, label: 'YouTube', icon: Youtube, color: 'text-[hsl(0,100%,50%)]' },
];

const PlatformSelector = ({ selected, onSelect }: PlatformSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <button
          key={platform.id}
          onClick={() => onSelect(platform.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
            selected === platform.id
              ? "bg-primary/20 border-primary/50 text-foreground"
              : "bg-secondary/30 border-white/10 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
        >
          <platform.icon className={cn("w-4 h-4", selected === platform.id && platform.color)} />
          <span className="hidden sm:inline">{platform.label}</span>
        </button>
      ))}
    </div>
  );
};

export default PlatformSelector;
