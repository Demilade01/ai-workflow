import { pgTable, uuid, varchar, text, timestamp, real, jsonb, index, unique } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('idx_workflows_name').on(table.name),
}));

export const blocks = pgTable('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 100 }).notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  positionX: real('position_x').notNull(),
  positionY: real('position_y').notNull(),
  config: jsonb('config').default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workflowIdIdx: index('idx_blocks_workflow_id').on(table.workflowId),
}));

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  sourceBlockId: uuid('source_block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
  targetBlockId: uuid('target_block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
  sourceHandle: varchar('source_handle', { length: 100 }),
  targetHandle: varchar('target_handle', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workflowIdIdx: index('idx_connections_workflow_id').on(table.workflowId),
  sourceBlockIdx: index('idx_connections_source_block').on(table.sourceBlockId),
  targetBlockIdx: index('idx_connections_target_block').on(table.targetBlockId),
  uniqueConnection: unique('unique_connection').on(
    table.workflowId,
    table.sourceBlockId,
    table.targetBlockId,
    table.sourceHandle,
    table.targetHandle
  ),
}));

export const workflowRuns = pgTable('workflow_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  workflowIdIdx: index('idx_workflow_runs_workflow_id').on(table.workflowId),
  statusIdx: index('idx_workflow_runs_status').on(table.status),
}));

export const blockExecutions = pgTable('block_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowRunId: uuid('workflow_run_id').notNull().references(() => workflowRuns.id, { onDelete: 'cascade' }),
  blockId: uuid('block_id').notNull().references(() => blocks.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull(),
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  runIdIdx: index('idx_block_executions_run_id').on(table.workflowRunId),
  blockIdIdx: index('idx_block_executions_block_id').on(table.blockId),
}));

// Relations
export const workflowsRelations = relations(workflows, ({ many }) => ({
  blocks: many(blocks),
  connections: many(connections),
  runs: many(workflowRuns),
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [blocks.workflowId],
    references: [workflows.id],
  }),
  sourceConnections: many(connections, { relationName: 'sourceBlock' }),
  targetConnections: many(connections, { relationName: 'targetBlock' }),
  executions: many(blockExecutions),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  workflow: one(workflows, {
    fields: [connections.workflowId],
    references: [workflows.id],
  }),
  sourceBlock: one(blocks, {
    fields: [connections.sourceBlockId],
    references: [blocks.id],
    relationName: 'sourceBlock',
  }),
  targetBlock: one(blocks, {
    fields: [connections.targetBlockId],
    references: [blocks.id],
    relationName: 'targetBlock',
  }),
}));

export const workflowRunsRelations = relations(workflowRuns, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [workflowRuns.workflowId],
    references: [workflows.id],
  }),
  blockExecutions: many(blockExecutions),
}));

export const blockExecutionsRelations = relations(blockExecutions, ({ one }) => ({
  workflowRun: one(workflowRuns, {
    fields: [blockExecutions.workflowRunId],
    references: [workflowRuns.id],
  }),
  block: one(blocks, {
    fields: [blockExecutions.blockId],
    references: [blocks.id],
  }),
}));

