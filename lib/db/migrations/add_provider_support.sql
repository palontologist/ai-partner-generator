-- Migration to add provider support to existing tables
-- Run this after updating the schema

-- Add provider column to generated_images table
ALTER TABLE generated_images ADD COLUMN provider TEXT DEFAULT 'ideogram' NOT NULL;

-- Add provider column to image_generation_history table  
ALTER TABLE image_generation_history ADD COLUMN provider TEXT DEFAULT 'ideogram' NOT NULL;

-- Add preferred_provider column to user_preferences table
ALTER TABLE user_preferences ADD COLUMN preferred_provider TEXT DEFAULT 'ideogram';

-- Update existing records to set provider as 'ideogram' (they were using ideogram by default)
UPDATE generated_images SET provider = 'ideogram' WHERE provider IS NULL;
UPDATE image_generation_history SET provider = 'ideogram' WHERE provider IS NULL;