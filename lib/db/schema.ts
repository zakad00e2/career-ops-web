import { pgTable, serial, text, real, timestamp, integer } from 'drizzle-orm/pg-core';

export const applications = pgTable('applications', {
  id: serial('id').primaryKey(),
  num: integer('num').notNull(),
  date: text('date').notNull(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  score: real('score'),
  status: text('status').notNull().default('Evaluated'),
  hasPdf: text('has_pdf').default('❌'),
  reportPath: text('report_path'),
  notes: text('notes'),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  applicationId: integer('application_id').references(() => applications.id),
  company: text('company').notNull(),
  role: text('role').notNull(),
  slug: text('slug').notNull(),
  date: text('date').notNull(),
  score: real('score'),
  legitimacy: text('legitimacy'),
  url: text('url'),
  content: text('content').notNull(),
  pdfPath: text('pdf_path'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const pipeline = pgTable('pipeline', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  status: text('status').notNull().default('pending'),
  addedAt: timestamp('added_at').defaultNow(),
  processedAt: timestamp('processed_at'),
  notes: text('notes'),
});

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const scanHistory = pgTable('scan_history', {
  id: serial('id').primaryKey(),
  url: text('url').notNull().unique(),
  company: text('company'),
  title: text('title'),
  scannedAt: timestamp('scanned_at').defaultNow(),
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type PipelineItem = typeof pipeline.$inferSelect;
export type ProfileEntry = typeof profile.$inferSelect;
