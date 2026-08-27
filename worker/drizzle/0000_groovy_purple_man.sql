CREATE TABLE `channels` (
	`id` text PRIMARY KEY NOT NULL,
	`internal_id` text NOT NULL,
	`name` text NOT NULL,
	`logo_url` text,
	`category` text NOT NULL,
	`source` text NOT NULL,
	`links` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`poster_url` text,
	`category` text NOT NULL,
	`start_time` text NOT NULL,
	`status` text NOT NULL,
	`embeds` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movies` (
	`id` text PRIMARY KEY NOT NULL,
	`internal_id` text NOT NULL,
	`title` text NOT NULL,
	`overview` text,
	`poster_url` text,
	`backdrop_url` text,
	`rating` text,
	`tmdb_id` integer,
	`category` text DEFAULT 'Movies' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `series` (
	`id` text PRIMARY KEY NOT NULL,
	`internal_id` text NOT NULL,
	`title` text NOT NULL,
	`overview` text,
	`poster_url` text,
	`backdrop_url` text,
	`rating` text,
	`tmdb_id` integer,
	`category` text DEFAULT 'Series' NOT NULL
);
