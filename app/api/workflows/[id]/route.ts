import { db } from '@/lib/db';
import { workflows, blocks, connections } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

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
    if (workflowBlocks !== undefined || workflowConnections !== undefined) {
      // Delete existing blocks and connections
      // Delete connections first (they reference blocks)
      await db.delete(connections).where(eq(connections.workflowId, id));
      await db.delete(blocks).where(eq(blocks.workflowId, id));

      // Insert new blocks (preserving IDs from frontend if valid UUIDs, otherwise generate new ones)
      const blockIds = new Set<string>();
      const blockIdMap = new Map<string, string>(); // Map old IDs to new UUIDs if needed

      if (workflowBlocks && Array.isArray(workflowBlocks)) {
        for (const block of workflowBlocks) {
          // Validate block data
          if (!block.type || !block.label || !block.position) {
            console.error('Invalid block data:', block);
            throw new Error(`Invalid block data: missing required fields (type, label, or position)`);
          }

          // Validate UUID format or generate a new one
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          let blockId = block.id;

          if (!block.id || !uuidRegex.test(block.id)) {
            // Generate a new UUID for blocks with invalid IDs
            blockId = randomUUID();
            if (block.id) {
              blockIdMap.set(block.id, blockId); // Map old ID to new UUID
            }
            console.warn(`Invalid block ID "${block.id}" replaced with UUID: ${blockId}`);
          }

          // Check for duplicate block IDs
          if (blockIds.has(blockId)) {
            throw new Error(`Duplicate block ID found: ${blockId}`);
          }
          blockIds.add(blockId);

          await db.insert(blocks).values({
            id: blockId,
            workflowId: id,
            type: block.type,
            label: block.label,
            positionX: typeof block.position.x === 'number' ? block.position.x : parseFloat(String(block.position.x)) || 0,
            positionY: typeof block.position.y === 'number' ? block.position.y : parseFloat(String(block.position.y)) || 0,
            config: block.config || {},
          });
        }
      }

      // Insert new connections (only after blocks are inserted)
      if (workflowConnections && Array.isArray(workflowConnections)) {
        for (const conn of workflowConnections) {
          // Validate connection data
          if (!conn.source || !conn.target) {
            console.error('Invalid connection data:', conn);
            throw new Error(`Invalid connection data: missing required fields (source or target)`);
          }

          // Map source and target to new UUIDs if they were replaced
          const sourceBlockId = blockIdMap.get(conn.source) || conn.source;
          const targetBlockId = blockIdMap.get(conn.target) || conn.target;

          // Validate that source and target blocks exist
          if (workflowBlocks && !blockIds.has(sourceBlockId)) {
            throw new Error(`Connection references non-existent source block: ${conn.source} (mapped to: ${sourceBlockId})`);
          }
          if (workflowBlocks && !blockIds.has(targetBlockId)) {
            throw new Error(`Connection references non-existent target block: ${conn.target} (mapped to: ${targetBlockId})`);
          }

          // Validate UUID format or generate a new one for connection ID
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const connectionId = (conn.id && uuidRegex.test(conn.id)) ? conn.id : randomUUID();

          await db.insert(connections).values({
            id: connectionId,
            workflowId: id,
            sourceBlockId: sourceBlockId,
            targetBlockId: targetBlockId,
            sourceHandle: conn.sourceHandle || null,
            targetHandle: conn.targetHandle || null,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating workflow:', error);
    const errorMessage = error.message || 'Failed to update workflow';
    return NextResponse.json(
      { error: errorMessage, details: error.stack },
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

