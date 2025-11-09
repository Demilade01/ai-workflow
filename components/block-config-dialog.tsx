'use client';

import { Node } from '@xyflow/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

interface BlockConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: Node | null;
  onUpdate: (blockId: string, config: any, label?: string) => void;
}

export function BlockConfigDialog({ open, onOpenChange, node, onUpdate }: BlockConfigDialogProps) {
  const [label, setLabel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    if (node) {
      const data = node.data;
      const config = (data.config || {}) as any;
      setLabel((data.label as string) || '');
      setPrompt(config.prompt || '');
      setSystemPrompt(config.systemPrompt || '');
      setModel(config.model || 'gpt-4o-mini');
      setTemperature(String(config.temperature || '0.7'));
      setMaxTokens(String(config.maxTokens || ''));
      setLanguage(config.language || '');
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;

    const config: any = {
      prompt,
      systemPrompt,
      model,
      temperature: parseFloat(temperature) || 0.7,
    };

    if (maxTokens) {
      config.maxTokens = parseInt(maxTokens);
    }

    if (language) {
      config.language = language;
    }

    onUpdate(node.id, config, label);
    onOpenChange(false);
  };

  if (!node) return null;

  const blockType = node.data.type;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Block</DialogTitle>
          <DialogDescription>Configure the settings for this {(blockType as string)} block</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="label">Block Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter block label"
            />
          </div>

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter the prompt for this block"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="systemPrompt">System Prompt (Optional)</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system instructions"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxTokens">Max Tokens (Optional)</Label>
            <Input
              id="maxTokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder="Leave empty for default"
            />
          </div>

          {blockType === 'translate' && (
            <div>
              <Label htmlFor="language">Target Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g., Spanish, French, German"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

