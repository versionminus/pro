
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkTheme: boolean;
  setTheme: (theme: 'pro' | 'noob') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const setTheme = (theme: 'pro' | 'noob') => {
    const newIsDarkTheme = theme === 'pro';
    setIsDarkTheme(newIsDarkTheme);

    // Remove both theme classes first
    document.documentElement.classList.remove('pro', 'noob');
    
    // Add the selected theme class
    document.documentElement.classList.add(theme);
    
    // Force a repaint by touching the body style
    document.body.style.visibility = 'hidden';
    document.body.offsetHeight; // trigger reflow
    document.body.style.visibility = 'visible';
    
    console.log(`Theme switched to: ${theme}, isDarkTheme: ${newIsDarkTheme}`);
  };

  useEffect(() => {
    // Initialize theme on mount
    const theme = isDarkTheme ? 'pro' : 'noob';
    document.documentElement.classList.remove('pro', 'noob');
    document.documentElement.classList.add(theme);
    
    // Apply theme styles immediately
    document.body.style.visibility = 'hidden';
    document.body.offsetHeight; // trigger reflow
    document.body.style.visibility = 'visible';
    
    console.log(`Theme initialized: ${theme}`);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
