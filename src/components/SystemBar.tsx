
import React, { useState, useEffect, useRef } from 'react';
import { Github, Save, Share, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { FilterValue } from '@/types/api';
import { cn } from '@/lib/utils';

interface SystemBarProps {
  searchResultId?: string;
  onSaveClick: () => void;
  filters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
  onViewUid: (uid: string) => void;
}

const SystemBar: React.FC<SystemBarProps> = ({
  searchResultId,
  onSaveClick,
  filters,
  onFiltersChange,
  onViewUid
}) => {
  const [command, setCommand] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [animateButtons, setAnimateButtons] = useState(false);
  const [username, setUsername] = useState(
    import.meta.env.VITE_DEVELOPMENT_ENV === 'local' ? 'whoami' : 'user'
  );

  useEffect(() => {
    if (import.meta.env.VITE_DEVELOPMENT_ENV === 'local') {
      // Try to get the real OS username if running locally
      // Only works if exposed via env or similar, since browser can't run whoami
      const osUser = import.meta.env.VITE_LOCAL_USERNAME;
      setUsername(osUser);
    }
  }, []);
  const [isFocused, setIsFocused] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isDarkTheme, setTheme } = useTheme();

  // Listen for new search results and animate buttons
  useEffect(() => {
    const handleNewResult = () => {
      setAnimateButtons(true);

      // Reset animation after 2 seconds
      const timer = setTimeout(() => {
        setAnimateButtons(false);
      }, 2000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('newSearchResult', handleNewResult);

    return () => {
      window.removeEventListener('newSearchResult', handleNewResult);
    };
  }, []);

  // Cursor blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Standard terminal cursor blink rate

    return () => clearInterval(interval);
  }, []);

  // Also watch for changes to searchResultId prop
  useEffect(() => {
    if (searchResultId) {
      setAnimateButtons(true);

      const timer = setTimeout(() => {
        setAnimateButtons(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [searchResultId]);

  const executeCommand = async () => {
    const cmd = command.trim().toLowerCase();

    if (cmd === 'clear') {
      setCommand('');
      return;
    }

    if (cmd.startsWith('view ')) {
      const uid = cmd.substring(5).trim();
      onViewUid(uid);
      toast({
        title: "Loading data",
        description: `Loading UID: ${uid}`,
      });
    } else if (cmd === 'share') {
      handleShare();
    } else if (cmd.startsWith('add ')) {
      const fieldsStr = cmd.substring(4).trim();
      const fieldNames = fieldsStr.split(',').map(f => f.trim());

      const newFilters = [...filters];
      fieldNames.forEach(fieldName => {
        if (!filters.find(f => f.field === fieldName)) {
          newFilters.push({ field: fieldName, values: [] });
        }
      });
      onFiltersChange(newFilters);

      toast({
        title: "Fields added",
        description: `Added: ${fieldNames.join(', ')}`,
      });
    } else if (cmd.startsWith('remove ')) {
      const fieldsStr = cmd.substring(7).trim();
      const fieldNames = fieldsStr.split(',').map(f => f.trim());

      const newFilters = filters.filter(f => !fieldNames.includes(f.field));
      onFiltersChange(newFilters);

      toast({
        title: "Fields removed",
        description: `Removed: ${fieldNames.join(', ')}`,
      });
    } else if (cmd.startsWith('help')) {
      toast({
        title: "Available commands",
        description: `
          - view <uid>: View data for a specific UID
          - share: Share current results via email
          - add <field1, field2, ...>: Add new fields to filters
          - remove <field1, field2, ...>: Remove fields from filters
          - save --json: Save results as JSON
          - save --csv: Save results as CSV
          - save --parquet: Save results as Parquet
        `,
      });
    } else if (cmd.startsWith('save --')) {
      const format = cmd.substring(7) as 'json' | 'csv' | 'parquet';
      if (['json', 'csv', 'parquet'].includes(format) && searchResultId) {
        try {
          await apiService.downloadData(searchResultId, format);
          toast({
            title: "Download started",
            description: `Downloading in ${format} format`,
          });
        } catch (error) {
          toast({
            title: "Download failed",
            description: "Unable to download file",
            variant: "destructive",
          });
        }
      }
    } else if (cmd) {
      toast({
        title: "Unknown command",
        description: `Command not recognized: ${cmd}`,
        variant: "destructive",
      });
    }

    setCommand('');
  };

  const handleCopyUid = () => {
    if (searchResultId) {
      navigator.clipboard.writeText(searchResultId);
      toast({
        description: searchResultId,
      });
    }
  };

  const handleShare = () => {
    const subject = encodeURIComponent('versionmionus-pro Query Results');
    const body = encodeURIComponent(`Query UID: ${searchResultId || 'No results yet'}\n\nGenerated by versionminus-pro`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value as 'pro' | 'noob');
  };

  const handleCliClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border px-4 py-2 flex items-center gap-4 z-50">
      <Select value={version} onValueChange={setVersion}>
        <SelectTrigger className="w-20 bg-background/50 border-border text-foreground text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="1.0.0" className="text-foreground hover:bg-accent">1.0.0</SelectItem>
          <SelectItem value="0.9.0" className="text-foreground hover:bg-accent">0.9.0</SelectItem>
          <SelectItem value="0.8.0" className="text-foreground hover:bg-accent">0.8.0</SelectItem>
        </SelectContent>
      </Select>

      <Select value={isDarkTheme ? 'pro' : 'noob'} onValueChange={handleThemeChange}>
        <SelectTrigger className="w-20 bg-background/50 border-border text-foreground text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="pro" className="text-foreground hover:bg-accent">pro</SelectItem>
          <SelectItem value="noob" className="text-foreground hover:bg-accent">noob</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        className="text-foreground hover:text-primary"
        onClick={() => window.open('https://github.com/versionminus/pro', '_blank')}
      >
        <Github className="w-4 h-4" />
      </Button>

      <Button
        variant={animateButtons && searchResultId ? "outline" : "ghost"}
        size="sm"
        className={cn(
          "text-foreground hover:text-primary transition-all duration-300 relative",
          animateButtons && searchResultId && "text-primary bg-primary/10 border-primary"
        )}
        onClick={onSaveClick}
        disabled={!searchResultId}
        title={searchResultId ? "Save results" : "No results to save"}
      >
        <Save className={cn(
          "w-4 h-4",
          animateButtons && searchResultId && "highlight-icon"
        )} />
        {animateButtons && searchResultId && <span className="absolute inset-0"></span>}
      </Button>

      <Button
        variant={animateButtons && searchResultId ? "outline" : "ghost"}
        size="sm"
        className={cn(
          "text-foreground hover:text-primary transition-all duration-300 relative",
          animateButtons && searchResultId && "text-primary bg-primary/10 border-primary"
        )}
        onClick={handleCopyUid}
        disabled={!searchResultId}
        title={searchResultId ? "Copy UID to clipboard" : "No UID available"}
      >
        <Clipboard className={cn(
          "w-4 h-4",
          animateButtons && searchResultId && "highlight-icon"
        )} />
        {animateButtons && searchResultId && <span className="absolute inset-0"></span>}
      </Button>

      <Button
        variant={animateButtons && searchResultId ? "outline" : "ghost"}
        size="sm"
        className={cn(
          "text-foreground hover:text-primary transition-all duration-300 relative",
          animateButtons && searchResultId && "text-primary bg-primary/10 border-primary"
        )}
        onClick={handleShare}
        disabled={!searchResultId}
        title={searchResultId ? "Share results" : "No results to share"}
      >
        <Share className={cn(
          "w-4 h-4",
          animateButtons && searchResultId && "highlight-icon"
        )} />
        {animateButtons && searchResultId && <span className="absolute inset-0"></span>}
      </Button>

      {/* Only show CLI component when in 'pro' theme */}
      {isDarkTheme && (
        <div className="flex-1 relative">
          <div
            className="relative bg-background/50 border border-border rounded-md px-3 py-2 cursor-text"
            onClick={handleCliClick}
          >
            {/* CLI Prompt Display */}
            <div className="flex items-center font-source-code text-sm">
              <span className={cn(
                "transition-colors duration-200",
                isFocused ? "text-green-500 font-source-code" : "text-muted-foreground font-source-code"
              )}>
                {username}@versionminus/pro $&nbsp;
              </span>
              <span className="text-foreground font-source-code">
                {command}
              </span>
              <span className={cn(
                "text-foreground transition-opacity duration-75",
                showCursor ? "opacity-100" : "opacity-0"
              )}>
                |
              </span>
            </div>

            {/* Invisible Input for capturing keystrokes */}
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute inset-0 opacity-0 cursor-text"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Add flexible space when in 'noob' theme to maintain layout */}
      {!isDarkTheme && <div className="flex-1"></div>}
    </div>
  );
};

export default SystemBar;
