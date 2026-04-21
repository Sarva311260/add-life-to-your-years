ALTER TABLE `affiliate_contacts` ADD `addressStreet` varchar(255);--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `addressCity` varchar(100);--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `addressState` varchar(100);--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `addressPostcode` varchar(20);--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `addressCountry` varchar(100);--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `birthday` varchar(10);--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `reminderAt` bigint;--> statement-breakpoint
ALTER TABLE `affiliate_contacts` ADD `reminderNote` text;