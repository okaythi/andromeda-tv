CREATE TABLE `channel_programmes` (
	`id` text PRIMARY KEY NOT NULL,
	`channel_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`poster_url` text,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_channel_programmes_window` ON `channel_programmes` (`channel_id`,`starts_at`,`ends_at`);--> statement-breakpoint
CREATE TABLE `tmdb_metadata_cache` (
	`cache_key` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`expires_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tmdb_metadata_cache_expiry` ON `tmdb_metadata_cache` (`expires_at`);