import { db } from '@/lib/db';
import { workflows, blocks, connections, workflowRuns, blockExecutions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// POST /api/workflows/[id]/execute - Execute a workflow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY environment variable is not set. Please add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { input } = body;

    // Get workflow with blocks and connections
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

    // Create workflow run
    const [run] = await db
      .insert(workflowRuns)
      .values({
        workflowId: id,
        status: 'running',
      })
      .returning();

    // Build execution graph
    const blockMap = new Map(workflowBlocks.map((b) => [b.id, b]));
    const connectionsByTarget = new Map<string, typeof workflowConnections>();

    for (const conn of workflowConnections) {
      if (!connectionsByTarget.has(conn.targetBlockId)) {
        connectionsByTarget.set(conn.targetBlockId, []);
      }
      connectionsByTarget.get(conn.targetBlockId)!.push(conn);
    }

    // Find starting blocks (blocks with no incoming connections)
    const startingBlocks = workflowBlocks.filter(
      (block) => !workflowConnections.some((conn) => conn.targetBlockId === block.id)
    );

    // Execute workflow (simple sequential execution for now)
    const results = new Map<string, any>();
    let currentInput = input || '';

    // Simple topological sort execution
    const executed = new Set<string>();
    const executeBlock = async (blockId: string) => {
      if (executed.has(blockId)) return;

      const block = blockMap.get(blockId);
      if (!block) return;

      // Get input from source blocks
      const incomingConnections = workflowConnections.filter(
        (conn) => conn.targetBlockId === blockId
      );

      if (incomingConnections.length > 0) {
        // Wait for source blocks to execute
        for (const conn of incomingConnections) {
          await executeBlock(conn.sourceBlockId);
          currentInput = results.get(conn.sourceBlockId) || currentInput;
        }
      }

      // Create block execution record
      const [blockExecution] = await db
        .insert(blockExecutions)
        .values({
          workflowRunId: run.id,
          blockId: block.id,
          status: 'running',
          inputData: { input: currentInput },
          startedAt: new Date(),
        })
        .returning();

      try {
        // Execute block based on type
        let output = '';
        const config = block.config as any;

        switch (block.type) {
          case 'summarize': {
            const summarizeResult = await generateText({
              model: openai(config.model || 'gpt-4o-mini'),
              prompt: `${config.prompt || 'Summarize the following text:'}\n\n${currentInput}`,
              system: config.systemPrompt,
            });
            output = summarizeResult.text || '';
            break;
          }

          case 'translate': {
            const translateResult = await generateText({
              model: openai(config.model || 'gpt-4o-mini'),
              prompt: `Translate the following text to ${config.language || 'Spanish'}:\n\n${currentInput}`,
              system: config.systemPrompt,
            });
            output = translateResult.text || '';
            break;
          }

          case 'generate_text': {
            const generateOptions: any = {
              model: openai(config.model || 'gpt-4o-mini'),
              prompt: `${config.prompt || ''}\n\n${currentInput}`,
              system: config.systemPrompt,
              temperature: config.temperature || 0.7,
            };
            if (config.maxTokens) {
              generateOptions.maxTokens = config.maxTokens;
            }
            const generateResult = await generateText(generateOptions);
            output = generateResult.text || '';
            break;
          }

          default:
            output = currentInput;
        }

        results.set(blockId, output);

        // Update block execution
        await db
          .update(blockExecutions)
          .set({
            status: 'completed',
            outputData: { output },
            completedAt: new Date(),
          })
          .where(eq(blockExecutions.id, blockExecution.id));

        executed.add(blockId);
      } catch (error: any) {
        await db
          .update(blockExecutions)
          .set({
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          })
          .where(eq(blockExecutions.id, blockExecution.id));

        throw error;
      }
    };

    // Execute all blocks
    try {
      for (const block of workflowBlocks) {
        await executeBlock(block.id);
      }

      // Update workflow run
      await db
        .update(workflowRuns)
        .set({
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(workflowRuns.id, run.id));

      return NextResponse.json({
        runId: run.id,
        status: 'completed',
        results: Object.fromEntries(results),
      });
    } catch (error: any) {
      await db
        .update(workflowRuns)
        .set({
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(workflowRuns.id, run.id));

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}

