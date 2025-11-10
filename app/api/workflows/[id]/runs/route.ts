import { db } from '@/lib/db';
import { workflowRuns, blockExecutions } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/workflows/[id]/runs - Get execution history for a workflow
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const runs = await db
      .select()
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, id))
      .orderBy(desc(workflowRuns.createdAt))
      .limit(50);

    return NextResponse.json({ runs });
  } catch (error: any) {
    console.error('Error fetching workflow runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow runs' },
      { status: 500 }
    );
  }
}

