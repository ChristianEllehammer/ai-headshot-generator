
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const backgroundStyleEnum = pgEnum('background_style', ['plain', 'office', 'outdoor', 'studio', 'gradient']);
export const attireEnum = pgEnum('attire', ['business_casual', 'formal', 'casual', 'smart_casual']);
export const expressionEnum = pgEnum('expression', ['smiling', 'serious', 'confident', 'friendly', 'professional']);
export const headshotStatusEnum = pgEnum('headshot_status', ['pending', 'processing', 'completed', 'failed']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Headshot requests table
export const headshotRequestsTable = pgTable('headshot_requests', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  original_image_url: text('original_image_url').notNull(),
  background_style: backgroundStyleEnum('background_style').notNull(),
  attire: attireEnum('attire').notNull(),
  expression: expressionEnum('expression').notNull(),
  status: headshotStatusEnum('status').notNull().default('pending'),
  generated_image_url: text('generated_image_url'),
  error_message: text('error_message'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  headshotRequests: many(headshotRequestsTable)
}));

export const headshotRequestsRelations = relations(headshotRequestsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [headshotRequestsTable.user_id],
    references: [usersTable.id]
  })
}));

// TypeScript types
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type HeadshotRequest = typeof headshotRequestsTable.$inferSelect;
export type NewHeadshotRequest = typeof headshotRequestsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  headshotRequests: headshotRequestsTable
};
