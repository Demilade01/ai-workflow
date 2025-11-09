'use client';

import { WorkflowEditor } from '@/components/workflow-editor';
import { useEffect, useState } from 'react';
import { WorkflowBlock, WorkflowConnection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

export default function Home() {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [blocks, setBlocks] = useState<WorkflowBlock[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      const workflow = await response.json();
      setWorkflowId(workflow.id);
      setCreateDialogOpen(false);
      toast.success('Workflow created successfully');
    } catch (error) {
      toast.error('Failed to create workflow');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkflow = async (updatedBlocks: WorkflowBlock[], updatedConnections: WorkflowConnection[]) => {
    if (!workflowId) {
      toast.error('No workflow selected');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: updatedBlocks,
          connections: updatedConnections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save workflow');
      }

      setBlocks(updatedBlocks);
      setConnections(updatedConnections);
      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteWorkflow = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: 'Hello, this is a test input for the workflow.',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to execute workflow';

        // Check if it's an API key error
        if (errorMessage.includes('OPENAI_API_KEY')) {
          toast.error('OpenAI API key is missing. Please add OPENAI_API_KEY to your .env.local file.');
        } else {
          toast.error(errorMessage);
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      toast.success(`Workflow executed successfully! Run ID: ${result.runId}`);
      console.log('Execution results:', result);
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute workflow');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workflowId) {
      // Load workflow data
      fetch(`/api/workflows/${workflowId}`)
        .then((res) => res.json())
        .then((data) => {
          setBlocks(data.blocks || []);
          setConnections(data.connections || []);
        })
        .catch(console.error);
    }
  }, [workflowId]);

  return (
    <div className="w-full h-screen">
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Workflow</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>Create a new AI workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="My AI Workflow"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkflow} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {workflowId ? (
        <WorkflowEditor
          workflowId={workflowId}
          initialBlocks={blocks}
          initialConnections={connections}
          onSave={handleSaveWorkflow}
          onExecute={handleExecuteWorkflow}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">AI Workflow Builder</h1>
            <p className="text-gray-600 mb-4">Create a new workflow to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>Create Workflow</Button>
          </div>
        </div>
      )}

    </div>
  );
}
