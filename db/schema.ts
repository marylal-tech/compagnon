import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { id: text('id').primaryKey(), owner: text('owner').notNull(), kind: text('kind').notNull(), content: text('content').notNull(), createdAt: text('created_at').notNull() });
