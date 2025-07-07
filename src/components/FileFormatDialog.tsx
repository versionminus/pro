
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileJson, File, Save } from 'lucide-react';

interface FileFormatDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (format: 'json' | 'csv' | 'parquet') => void;
  resultId: string;
}

const FileFormatDialog: React.FC<FileFormatDialogProps> = ({
  open,
  onClose,
  onSave,
  resultId
}) => {
  const handleFormatSelect = (format: 'json' | 'csv' | 'parquet') => {
    onSave(format);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-green-400">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">

          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/20"
              onClick={() => handleFormatSelect('json')}
            >
              json
            </Button>
            <Button
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/20"
              onClick={() => handleFormatSelect('csv')}
            >
              csv
            </Button>
            <Button
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/20"
              onClick={() => handleFormatSelect('parquet')}
            >
              parquet
            </Button>
          </div>
        </div>

        <p className="text-yellow-400 text-sm text-center">

        </p>
      </DialogContent>
    </Dialog>
  );
};

export default FileFormatDialog;
