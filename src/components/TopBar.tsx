import React from 'react';

const TopBar: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-0 py-4 flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold text-foreground pl-2">
          versionminus/pro
        </h1>
      </div>
    </div>
  );
};

export default TopBar;
