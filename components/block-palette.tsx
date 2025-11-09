'use client';

import { BlockType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType, position: { x: number; y: number }) => void;
}

const blockDefinitions: Array<{ type: BlockType; label: string; icon: string; description: string }> = [
  {
    type: 'summarize',
    label: 'Summarize',
    icon: '📝',
    description: 'Summarize text content',
  },
  {
    type: 'translate',
    label: 'Translate',
    icon: '🌐',
    description: 'Translate text to another language',
  },
  {
    type: 'generate_text',
    label: 'Generate Text',
    icon: '✨',
    description: 'Generate text using AI',
  },
  {
    type: 'generate_image',
    label: 'Generate Image',
    icon: '🎨',
    description: 'Generate images using AI',
  },
  {
    type: 'extract',
    label: 'Extract',
    icon: '🔍',
    description: 'Extract information from text',
  },
  {
    type: 'format',
    label: 'Format',
    icon: '📋',
    description: 'Format and structure data',
  },
];

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
  const handleAddBlock = (type: BlockType) => {
    // Add block at a random position in the center of the canvas
    const x = Math.random() * 300 + 100;
    const y = Math.random() * 300 + 100;
    onAddBlock(type, { x, y });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Blocks</h2>
      <div className="space-y-2">
        {blockDefinitions.map((block) => (
          <Card
            key={block.type}
            className="p-3 cursor-move hover:shadow-md transition-shadow"
            draggable
            onDragEnd={(e) => {
              // Handle drag and drop to canvas
              // For now, just add on click
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{block.icon}</span>
              <div>
                <div className="font-medium text-sm">{block.label}</div>
                <div className="text-xs text-gray-500">{block.description}</div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={() => handleAddBlock(block.type)}
            >
              Add Block
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

