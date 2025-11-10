'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockExecution {
  id: string;
  blockId: string;
  blockType: string;
  blockLabel: string;
  status: 'running' | 'completed' | 'failed';
  inputData: any;
  outputData: any;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

interface WorkflowRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

interface ExecutionResultsViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  runId: string | null;
  onRunComplete?: () => void;
}

export function ExecutionResultsViewer({
  open,
  onOpenChange,
  workflowId,
  runId,
  onRunComplete,
}: ExecutionResultsViewerProps) {
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [executions, setExecutions] = useState<BlockExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchRunDetails = useCallback(async (runIdToFetch: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/runs/${runIdToFetch}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch run details');
      }

      const data = await response.json();
      console.log('Fetched run details:', {
        runId: runIdToFetch,
        runStatus: data.run?.status,
        executionsCount: data.executions?.length
      });

      setRun(data.run);
      setExecutions(data.executions || []);

      // If run is still running, continue polling
      if (data.run?.status === 'running') {
        setPolling(true);
      } else {
        setPolling(false);
        if (data.run?.status === 'completed' || data.run?.status === 'failed') {
          onRunComplete?.();
        }
      }
    } catch (error) {
      console.error('Error fetching run details:', error);
      setPolling(false);
    }
  }, [workflowId, onRunComplete]);

  useEffect(() => {
    if (!open || !runId) {
      setPolling(false);
      return;
    }

    setIsLoading(true);
    fetchRunDetails(runId).finally(() => setIsLoading(false));
  }, [open, runId, fetchRunDetails]);

  useEffect(() => {
    if (!open || !runId || !polling) return;

    // Poll for updates if run is running
    const pollInterval = setInterval(() => {
      fetchRunDetails(runId);
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [open, runId, polling, fetchRunDetails]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (!runId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            Execution Results
            {run && getStatusBadge(run.status)}
          </DialogTitle>
          <DialogDescription>
            {run?.status === 'running' && 'Workflow is executing...'}
            {run?.status === 'completed' && 'Workflow execution completed'}
            {run?.status === 'failed' && `Execution failed: ${run.errorMessage}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden px-6 pb-6">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
            {isLoading && executions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : executions.length === 0 && run ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2 font-medium">No execution data available</p>
                <p className="text-sm text-gray-400">
                  {run.status === 'completed'
                    ? 'The workflow completed, but no block executions were found. This may happen if the workflow has no blocks or blocks were not executed.'
                    : run.status === 'running'
                    ? 'Execution data will appear here as blocks are processed...'
                    : 'Waiting for execution to start.'}
                </p>
                {run.status === 'completed' && (
                  <p className="text-xs text-gray-400 mt-2">
                    Check the browser console and server logs for debugging information.
                  </p>
                )}
              </div>
            ) : (
              executions.map((execution, index) => (
                <Card key={execution.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <div>
                        <h3 className="font-semibold">{execution.blockLabel}</h3>
                        <p className="text-sm text-gray-500">{execution.blockType}</p>
                      </div>
                    </div>
                    {getStatusBadge(execution.status)}
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Input</h4>
                      <div className="bg-gray-50 p-3 rounded-md text-sm font-mono whitespace-pre-wrap wrap-break-word">
                        {execution.inputData?.input || 'N/A'}
                      </div>
                    </div>

                    {execution.status === 'completed' && execution.outputData && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Output</h4>
                        <div className="bg-green-50 p-3 rounded-md text-sm font-mono whitespace-pre-wrap wrap-break-word">
                          {execution.outputData.output || 'N/A'}
                        </div>
                      </div>
                    )}

                    {execution.status === 'failed' && execution.errorMessage && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-1">Error</h4>
                        <div className="bg-red-50 p-3 rounded-md text-sm font-mono whitespace-pre-wrap wrap-break-word text-red-700">
                          {execution.errorMessage}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 text-xs text-gray-500">
                      {execution.startedAt && (
                        <span>Started: {new Date(execution.startedAt).toLocaleString()}</span>
                      )}
                      {execution.completedAt && (
                        <span>Completed: {new Date(execution.completedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

