import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ColorTheme = 'warm' | 'cool';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  toggleColorTheme: () => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('color-theme') as ColorTheme;
      return stored || 'warm';
    }
    return 'warm';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('theme-warm', 'theme-cool');
    
    // Add the current theme class
    root.classList.add(`theme-${colorTheme}`);
    
    // Store preference
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  const toggleColorTheme = () => {
    setColorTheme((prev) => (prev === 'warm' ? 'cool' : 'warm'));
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme, toggleColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
};
