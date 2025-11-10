import { db } from '@/lib/db';
import { workflowRuns, blockExecutions, blocks } from '@/lib/schema';
import { eq, asc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/workflows/[id]/runs/[runId] - Get execution details for a specific run
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; runId: string }> }
) {
  try {
    const { id, runId } = await params;

    // Get workflow run
    const [run] = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.id, runId))
      .limit(1);

    if (!run) {
      return NextResponse.json(
        { error: 'Workflow run not found' },
        { status: 404 }
      );
    }

    // Verify it belongs to the workflow
    if (run.workflowId !== id) {
      return NextResponse.json(
        { error: 'Workflow run does not belong to this workflow' },
        { status: 400 }
      );
    }

    // Get block executions with block details
    const executions = await db
      .select({
        execution: blockExecutions,
        block: blocks,
      })
      .from(blockExecutions)
      .innerJoin(blocks, eq(blockExecutions.blockId, blocks.id))
      .where(eq(blockExecutions.workflowRunId, runId))
      .orderBy(asc(blockExecutions.createdAt));

    console.log(`[Run Details] Found ${executions.length} executions for run ${runId}`);

    return NextResponse.json({
      run,
      executions: executions.map((e) => ({
        id: e.execution.id,
        blockId: e.execution.blockId,
        blockType: e.block.type,
        blockLabel: e.block.label,
        status: e.execution.status,
        inputData: e.execution.inputData,
        outputData: e.execution.outputData,
        errorMessage: e.execution.errorMessage,
        startedAt: e.execution.startedAt,
        completedAt: e.execution.completedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching workflow run:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow run' },
      { status: 500 }
    );
  }
}

