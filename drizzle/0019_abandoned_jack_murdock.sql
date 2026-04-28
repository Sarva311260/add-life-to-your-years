CREATE TABLE `affiliate_custom_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`tagKey` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`category` varchar(20) NOT NULL DEFAULT 'link',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_custom_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tagKey` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`assetType` varchar(20) NOT NULL DEFAULT 'video',
	`url` varchar(1024) NOT NULL,
	`thumbnailUrl` varchar(1024),
	`description` varchar(512),
	`embedHtml` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `crm_assets_tagKey_unique` UNIQUE(`tagKey`)
);
--> statement-breakpoint
CREATE TABLE `crm_merge_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tagKey` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	`defaultValue` text,
	`category` varchar(20) NOT NULL DEFAULT 'text',
	`description` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_merge_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `crm_merge_tags_tagKey_unique` UNIQUE(`tagKey`)
);
