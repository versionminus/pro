import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import FileFormatDialog from '@/components/FileFormatDialog';
import SystemBar from '@/components/SystemBar';
import TopBar from '@/components/TopBar';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const DataExplorer: React.FC = () => {
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const { toast } = useToast();
  const { isDarkTheme } = useTheme();

  const { data: contract, isLoading: contractLoading } = useQuery({
    queryKey: ['contract'],
    queryFn: apiService.getContract,
  });

  const handleSave = async (format: 'json' | 'csv' | 'parquet') => {
    try {
      // For demo purposes, just show a toast
      toast({
        title: "Download started",
        description: `Would download data in ${format} format`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "Unable to download file",
        variant: "destructive",
      });
    }
  };

  const handleViewUid = async (uid: string) => {
    try {
      console.log(`Loading UID: ${uid}`);
      toast({
        title: "UID loaded",
        description: `Loaded data for UID: ${uid}`,
      });
    } catch (error) {
      toast({
        title: "Failed to load UID",
        description: `Could not load data for UID: ${uid}`,
        variant: "destructive",
      });
    }
  };

  if (contractLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-source-code">
        <TopBar />
        <div className="pt-20 pb-16 p-8 flex items-center justify-center">
          <div>Loading contract...</div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background text-destructive font-source-code">
        <TopBar />
        <div className="pt-20 pb-16 p-8 flex items-center justify-center">
          <div>Failed to load API contract</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-source-code">
      <TopBar />
      
      <div className="pt-20 pb-16 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-lg bg-card border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Data Explorer</h2>
            <p className="text-muted-foreground">
              FilterPanel and DataTable components have been removed.
            </p>
          </div>
        </div>
      </div>

      <FileFormatDialog
        open={showFormatDialog}
        onClose={() => setShowFormatDialog(false)}
        onSave={handleSave}
        resultId=""
      />

      <SystemBar
        searchResultId=""
        onSaveClick={() => setShowFormatDialog(true)}
        filters={[]}
        onFiltersChange={() => {}}
        onViewUid={handleViewUid}
      />
    </div>
  );
};

export default DataExplorer;
