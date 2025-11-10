'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ExecutionInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecute: (input: string) => void;
  isLoading?: boolean;
}

export function ExecutionInputDialog({
  open,
  onOpenChange,
  onExecute,
  isLoading = false,
}: ExecutionInputDialogProps) {
  const [input, setInput] = useState('');

  const handleExecute = () => {
    if (input.trim()) {
      onExecute(input);
      setInput('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Execute Workflow</DialogTitle>
          <DialogDescription>
            Enter the input text to process through the workflow
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="input">Input Text</Label>
            <Textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to process through the workflow..."
              rows={6}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleExecute} disabled={isLoading || !input.trim()}>
            {isLoading ? 'Executing...' : 'Execute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

