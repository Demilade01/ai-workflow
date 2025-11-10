'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface ExecutionHistoryProps {
  workflowId: string;
  onViewRun: (runId: string) => void;
}

export function ExecutionHistory({ workflowId, onViewRun }: ExecutionHistoryProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    if (!workflowId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/runs`);
      if (!response.ok) throw new Error('Failed to fetch execution history');

      const data = await response.json();
      setRuns(data.runs || []);
    } catch (error) {
      console.error('Error fetching execution history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workflowId) {
      fetchHistory();
    }
  }, [workflowId]);

  useEffect(() => {
    // Refresh every 2 seconds if there are running workflows
    if (!workflowId) return;

    const hasRunning = runs.some(run => run.status === 'running');
    if (!hasRunning) return;

    const interval = setInterval(() => {
      fetchHistory();
    }, 2000);

    return () => clearInterval(interval);
  }, [runs, workflowId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <h3 className="font-semibold">Execution History</h3>
        <p className="text-sm text-gray-500">View past workflow executions</p>
      </div>

      <ScrollArea className="flex-1 min-h-0 p-4">
        {isLoading && runs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No execution history</p>
            <p className="text-sm mt-2">Execute the workflow to see results here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run) => (
              <Card key={run.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    <div>
                      <p className="text-sm font-medium">
                        Run {run.id.slice(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(run.startedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(run.status)}
                </div>

                {run.errorMessage && (
                  <p className="text-xs text-red-600 mt-2 line-clamp-2">
                    {run.errorMessage}
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewRun(run.id)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

