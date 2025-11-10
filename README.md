# AI Workflow Builder

A modern visual AI workflow builder built with Next.js, Vercel AI SDK, React Flow, and Neon Database.

## Features

- 🎨 Visual workflow editor with drag-and-drop blocks
- 🤖 AI-powered blocks (Summarize, Translate, Generate Text, etc.)
- 🔗 Connect blocks to create complex workflows
- 💾 Save and load workflows from Neon database
- ⚡ Execute workflows with Vercel AI SDK
- 🗨️ AI chat assistant to create/modify workflows (Lovable/Base44 style)
- 📥 Execution input dialog before running
- 📊 Live execution progress with polling
- 🧾 Execution results viewer with per-block input/output
- 🕓 Execution history with status and details
- 🗑️ Delete workflows with confirmation dialog

## Tech Stack

- **Next.js 16** - App Router
- **Vercel AI SDK v5** - AI streaming and orchestration
- **React Flow** - Visual workflow editor
- **ShadCN UI** - Modern UI components
- **Neon Database** - PostgreSQL database
- **Drizzle ORM** - Type-safe database queries
- **TypeScript** - Type safety
- **uuid** - Stable IDs for blocks and connections

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Neon Database Connection
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-xxx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Database Setup

The database schema is already set up in Neon. The migration includes:
- `workflows` - Workflow definitions
- `blocks` - Workflow blocks
- `connections` - Connections between blocks
- `workflow_runs` - Execution history
- `block_executions` - Individual block execution results

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Workflow

1. Click "New Workflow" to create a new workflow
2. Enter a name and optional description
3. Click "Create" to start building

### Adding Blocks

1. Use the block palette on the left to add blocks
2. Click "Add Block" on any block type
3. Blocks will appear on the canvas

### Configuring Blocks

1. Click on a block to open the configuration dialog
2. Set the prompt, model, temperature, and other parameters
3. Click "Save" to apply changes

### Connecting Blocks

1. Drag from the output handle (bottom) of a block
2. Connect to the input handle (top) of another block
3. Blocks will execute in sequence based on connections

### Executing Workflows

1. Click "Save Workflow" to save your changes
2. Click "Execute" to open the input dialog
3. Provide input text and start the run
4. Watch progress in real time
5. View the results in the Results viewer (per block input/output)
6. Review past runs in the History tab

### AI Chat Assistant

- Use the Chat tab to ask the AI to create or modify workflows.
- The AI can add blocks, rewire connections, and configure prompts/models.
- Changes are reflected live in the editor and can be saved.

## Block Types

- **Summarize** - Summarize text content
- **Translate** - Translate text to another language
- **Generate Text** - Generate text using AI
- **Generate Image** - Generate images (coming soon)
- **Extract** - Extract information from text
- **Format** - Format and structure data

## API Routes

- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create a new workflow
- `GET /api/workflows/[id]` - Get workflow details (with blocks and connections)
- `PUT /api/workflows/[id]` - Update workflow, blocks, and connections
- `DELETE /api/workflows/[id]` - Delete workflow
- `POST /api/workflows/[id]/execute` - Execute workflow
- `GET /api/workflows/[id]/runs` - List runs for a workflow
- `GET /api/workflows/[id]/runs/[runId]` - Run details with block executions
- `POST /api/chat` - AI chat assistant for workflow edits

## Database Schema

See `lib/schema.ts` for the complete database schema definition.

## Development

### Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── page.tsx      # Main page
│   └── layout.tsx    # Root layout
├── components/       # React components
│   ├── ui/          # ShadCN UI components
│   ├── workflow-editor.tsx
│   ├── block-palette.tsx
│   ├── block-config-dialog.tsx
│   ├── ai-chat.tsx
│   ├── execution-input-dialog.tsx
│   ├── execution-results-viewer.tsx
│   └── execution-history.tsx
├── lib/
│   ├── db.ts        # Database connection
│   ├── schema.ts    # Database schema
│   └── types.ts     # TypeScript types
└── public/          # Static assets
```

## Next Steps

- [ ] Add image generation support
- [ ] Real-time server-sent events for block streaming
- [ ] Add user authentication
- [ ] Add workflow templates
- [ ] Add conditional logic blocks
- [ ] Integrate with Modal.com for backend processing

## License

MIT
