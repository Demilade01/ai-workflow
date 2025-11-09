export type BlockType =
  | 'summarize'
  | 'translate'
  | 'generate_text'
  | 'generate_image'
  | 'extract'
  | 'format';

export interface BlockConfig {
  prompt?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  language?: string;
  format?: string;
  [key: string]: any;
}

export interface WorkflowBlock {
  id: string;
  type: BlockType;
  label: string;
  position: { x: number; y: number };
  config: BlockConfig;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  blocks: WorkflowBlock[];
  connections: WorkflowConnection[];
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowRunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type BlockExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

