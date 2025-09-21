import { sql } from 'drizzle-orm';
import { integer, text, sqliteTable, real } from 'drizzle-orm/sqlite-core';

// Users table for authentication and basic info
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Enhanced teammates table to include generated images
export const teammates = sqliteTable('teammates', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  age: integer('age'),
  location: text('location'),
  bio: text('bio'),
  skills: text('skills'), // JSON string
  interests: text('interests'), // JSON string
  category: text('category').notNull(),
  imageUrl: text('image_url'), // URL to generated image
  imagePrompt: text('image_prompt'), // The prompt used to generate the image
  compatibilityScore: real('compatibility_score'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Table to store generated images with metadata
export const generatedImages = sqliteTable('generated_images', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  teammateId: text('teammate_id').references(() => teammates.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  imageUrl: text('image_url').notNull(),
  replicateId: text('replicate_id'), // Replicate prediction ID
  model: text('model').default('ideogram-ai/ideogram-v3-turbo').notNull(),
  parameters: text('parameters'), // JSON string of generation parameters
  status: text('status').default('pending').notNull(), // pending, completed, failed
  errorMessage: text('error_message'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Table to store user preferences and settings
export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
  preferredImageStyle: text('preferred_image_style').default('realistic'),
  defaultCategory: text('default_category'),
  autoGenerateImages: integer('auto_generate_images', { mode: 'boolean' }).default(true),
  imageQuality: text('image_quality').default('standard'), // standard, high
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Table to track image generation history and analytics
export const imageGenerationHistory = sqliteTable('image_generation_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  category: text('category'),
  style: text('style'),
  generationTime: integer('generation_time'), // Time taken in seconds
  success: integer('success', { mode: 'boolean' }).notNull(),
  errorType: text('error_type'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Teammate = typeof teammates.$inferSelect;
export type NewTeammate = typeof teammates.$inferInsert;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type NewGeneratedImage = typeof generatedImages.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
export type ImageGenerationHistory = typeof imageGenerationHistory.$inferSelect;
export type NewImageGenerationHistory = typeof imageGenerationHistory.$inferInsert;