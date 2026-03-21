import { Sun, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useColorTheme } from '@/hooks/useColorTheme';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ThemeToggle = () => {
  const { colorTheme, toggleColorTheme } = useColorTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleColorTheme}
            className={cn(
              "relative overflow-hidden transition-colors",
              colorTheme === 'warm' 
                ? "hover:bg-primary/20" 
                : "hover:bg-primary/20"
            )}
          >
            <div className="relative w-5 h-5">
              <Sun 
                className={cn(
                  "absolute inset-0 w-5 h-5 transition-all duration-300",
                  colorTheme === 'warm' 
                    ? "rotate-0 scale-100 opacity-100 text-primary" 
                    : "rotate-90 scale-0 opacity-0"
                )}
              />
              <Snowflake 
                className={cn(
                  "absolute inset-0 w-5 h-5 transition-all duration-300",
                  colorTheme === 'cool' 
                    ? "rotate-0 scale-100 opacity-100 text-primary" 
                    : "-rotate-90 scale-0 opacity-0"
                )}
              />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {colorTheme === 'warm' ? 'cool' : 'warm'} theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;
