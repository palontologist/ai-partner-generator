CREATE TABLE `generated_images` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`teammate_id` text,
	`prompt` text NOT NULL,
	`image_url` text NOT NULL,
	`replicate_id` text,
	`model` text DEFAULT 'ideogram-ai/ideogram-v3-turbo' NOT NULL,
	`parameters` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`teammate_id`) REFERENCES `teammates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `image_generation_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`prompt` text NOT NULL,
	`category` text,
	`style` text,
	`generation_time` integer,
	`success` integer NOT NULL,
	`error_type` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teammates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`age` integer,
	`location` text,
	`bio` text,
	`skills` text,
	`interests` text,
	`category` text NOT NULL,
	`image_url` text,
	`image_prompt` text,
	`compatibility_score` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`preferred_image_style` text DEFAULT 'realistic',
	`default_category` text,
	`auto_generate_images` integer DEFAULT true,
	`image_quality` text DEFAULT 'standard',
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`visitor_id` text NOT NULL,
	`start_time` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_activity` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_sessions_session_id_unique` ON `user_sessions` (`session_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `visitor_tracking` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor_id` text NOT NULL,
	`session_id` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`referrer` text,
	`page` text NOT NULL,
	`visit_time` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
