'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@ai-sdk/react';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DefaultChatTransport } from 'ai';

interface AIChatProps {
  workflowId?: string;
  onWorkflowUpdate?: (blocks: any[], connections: any[]) => void;
}

export function AIChat({ workflowId, onWorkflowUpdate }: AIChatProps) {
  const [input, setInput] = useState('');

  const { messages, status, error, sendMessage, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: workflowId ? { workflowId } : undefined,
    }),
    onFinish: ({ message, messages, isAbort, isDisconnect, isError }) => {
      // Handle workflow updates from AI responses
      if (isError || isAbort || isDisconnect) {
        return;
      }

      try {
        // Get the text content from message parts
        const textParts = message.parts.filter(part => part.type === 'text');
        const content = textParts.map(part => (part as any).text).join('');

        // Look for JSON in the response that might contain workflow updates
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          const workflowData = JSON.parse(jsonMatch[1]);
          if (workflowData.blocks && workflowData.connections) {
            onWorkflowUpdate?.(workflowData.blocks, workflowData.connections);
          }
        }
      } catch (error) {
        // Ignore parsing errors
        console.error('Error parsing workflow update:', error);
      }
    },
    onError: (error) => {
      console.error('Chat error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || status === 'streaming') return;

    sendMessage({
      text: input,
    });
    setInput('');
  };

  const isLoading = status === 'streaming' || status === 'submitted';

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Chat with AI to create and modify workflows
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm">
                Start a conversation to create or modify workflows
              </p>
              <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
                <p className="text-xs font-medium text-gray-700">Try asking:</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>"Create a workflow that summarizes and translates text"</li>
                  <li>"Add a block to generate text"</li>
                  <li>"Connect the summarize block to translate"</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map((message) => {
            // Get text content from message parts
            const textParts = message.parts.filter(part => part.type === 'text');
            const content = textParts.map(part => (part as any).text).join('');

            // Debug logging
            if (message.role === 'assistant' && !content) {
              console.log('Empty assistant message:', {
                id: message.id,
                parts: message.parts,
                partsLength: message.parts.length,
                textPartsLength: textParts.length,
              });
            }

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <Card
                  className={cn(
                    'max-w-[80%] p-3',
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {content}
                  </div>
                </Card>

                {message.role === 'user' && (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="bg-gray-100 p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to create or modify workflows..."
            disabled={isLoading}
            className="flex-1"
          />
          {isLoading ? (
            <Button type="button" onClick={stop} variant="outline">
              Stop
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            Error: {error.message}
          </div>
        )}
      </div>
    </div>
  );
}

