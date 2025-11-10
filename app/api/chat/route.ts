import { openai } from '@ai-sdk/openai';
import { streamText, createUIMessageStreamResponse, convertToModelMessages } from 'ai';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { workflows, blocks, connections } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY environment variable is not set. Chat functionality will not work.');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, workflowId } = body;

    console.log('Chat API called with:', { messagesCount: messages?.length, workflowId });

    // Get current workflow state if workflowId is provided
    let workflowContext = '';
    if (workflowId) {
      const [workflow] = await db.select().from(workflows).where(eq(workflows.id, workflowId));
      if (workflow) {
        const workflowBlocks = await db
          .select()
          .from(blocks)
          .where(eq(blocks.workflowId, workflowId));
        const workflowConnections = await db
          .select()
          .from(connections)
          .where(eq(connections.workflowId, workflowId));

        workflowContext = `Current workflow: ${workflow.name}
Blocks: ${JSON.stringify(workflowBlocks.map(b => ({ id: b.id, type: b.type, label: b.label, position: { x: b.positionX, y: b.positionY }, config: b.config })))}
Connections: ${JSON.stringify(workflowConnections.map(c => ({ id: c.id, source: c.sourceBlockId, target: c.targetBlockId })))}
`;
      }
    }

    const systemPrompt = `You are an AI assistant that helps users create and modify AI workflows. You can:

1. Create new workflows with blocks and connections
2. Modify existing workflows by adding, removing, or updating blocks
3. Connect blocks together to create workflows
4. Answer questions about workflows

Available block types:
- summarize: Summarize text content
- translate: Translate text to another language
- generate_text: Generate text using AI
- generate_image: Generate images (coming soon)
- extract: Extract information from text
- format: Format and structure data

When the user asks you to create or modify a workflow, respond with:
1. A natural language explanation of what you're doing
2. If creating/modifying workflows, include a JSON code block with the workflow structure:

\`\`\`json
{
  "blocks": [
    {
      "id": "block-1",
      "type": "summarize",
      "label": "Summarize",
      "position": { "x": 100, "y": 100 },
      "config": {
        "prompt": "Summarize the following text",
        "model": "gpt-4o-mini"
      }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "source": "block-1",
      "target": "block-2"
    }
  ]
}
\`\`\`

${workflowContext}

Be helpful, concise, and focus on creating functional workflows.`;

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY environment variable is not set' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Convert UI messages to model messages
    const uiMessages = messages || [];
    const modelMessages = convertToModelMessages(uiMessages);

    console.log('Received UI messages:', uiMessages.length);
    console.log('Converted model messages:', modelMessages.length);

    // Stream text and convert to UI message stream
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages: modelMessages,
      temperature: 0.7,
    });

    // Convert the streamText result to a UI message stream
    const uiMessageStream = result.toUIMessageStream({
      originalMessages: uiMessages,
    });

    // Convert the UI message stream to a response
    return createUIMessageStreamResponse({ stream: uiMessageStream });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process chat message' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

