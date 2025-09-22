ALTER TABLE `generated_images` ADD `provider` text DEFAULT 'ideogram' NOT NULL;--> statement-breakpoint
ALTER TABLE `image_generation_history` ADD `provider` text DEFAULT 'ideogram' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD `preferred_provider` text DEFAULT 'ideogram';