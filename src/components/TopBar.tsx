import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const TopBar: React.FC = () => {
  const { isDarkTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-0 py-4 flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-foreground pl-2">
          versionminus/pro
        </h1>

        <img
          src={isDarkTheme ? "/gh_logo_pro.png" : "/gh_logo_noob.png"}
          alt="NN Logo"
          className="h-16 w-auto logo-trim pr-2"
        />
      </div>
    </div>
  );
};

export default TopBar;
