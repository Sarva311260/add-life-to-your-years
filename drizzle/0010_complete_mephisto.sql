ALTER TABLE `pemf_resources` MODIFY COLUMN `type` enum('document','script','email_template','video','landing_page') NOT NULL;--> statement-breakpoint
ALTER TABLE `pemf_resources` ADD `subcategory` varchar(100);--> statement-breakpoint
ALTER TABLE `pemf_resources` ADD `pageUrl` varchar(512);