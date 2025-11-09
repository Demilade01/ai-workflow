import { db } from '@/lib/db';
import { workflows, blocks, connections } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/workflows/[id] - Get workflow with blocks and connections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflowBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.workflowId, id));

    const workflowConnections = await db
      .select()
      .from(connections)
      .where(eq(connections.workflowId, id));

    return NextResponse.json({
      ...workflow,
      blocks: workflowBlocks.map((block) => ({
        id: block.id,
        type: block.type,
        label: block.label,
        position: { x: block.positionX, y: block.positionY },
        config: block.config,
      })),
      connections: workflowConnections.map((conn) => ({
        id: conn.id,
        source: conn.sourceBlockId,
        target: conn.targetBlockId,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
      })),
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

// PUT /api/workflows/[id] - Update workflow
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, blocks: workflowBlocks, connections: workflowConnections } = body;

    // Update workflow
    if (name !== undefined || description !== undefined) {
      await db
        .update(workflows)
        .set({
          name: name || undefined,
          description: description !== undefined ? description : undefined,
        })
        .where(eq(workflows.id, id));
    }

    // Update blocks and connections if provided
    if (workflowBlocks || workflowConnections) {
      // Delete existing blocks and connections
      await db.delete(connections).where(eq(connections.workflowId, id));
      await db.delete(blocks).where(eq(blocks.workflowId, id));

      // Insert new blocks (preserving IDs from frontend)
      if (workflowBlocks && Array.isArray(workflowBlocks)) {
        for (const block of workflowBlocks) {
          await db.insert(blocks).values({
            id: block.id,
            workflowId: id,
            type: block.type,
            label: block.label,
            positionX: block.position.x,
            positionY: block.position.y,
            config: block.config || {},
          });
        }
      }

      // Insert new connections
      if (workflowConnections && Array.isArray(workflowConnections)) {
        for (const conn of workflowConnections) {
          await db.insert(connections).values({
            id: conn.id,
            workflowId: id,
            sourceBlockId: conn.source,
            targetBlockId: conn.target,
            sourceHandle: conn.sourceHandle || null,
            targetHandle: conn.targetHandle || null,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE /api/workflows/[id] - Delete workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(workflows).where(eq(workflows.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}

