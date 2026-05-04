ALTER TABLE `email_click_events` MODIFY COLUMN `dripSendLogId` int;--> statement-breakpoint
ALTER TABLE `email_click_events` MODIFY COLUMN `dripEmailId` int;--> statement-breakpoint
ALTER TABLE `email_open_events` MODIFY COLUMN `dripSendLogId` int;--> statement-breakpoint
ALTER TABLE `email_open_events` MODIFY COLUMN `dripEmailId` int;--> statement-breakpoint
ALTER TABLE `email_click_events` ADD `emailLogId` int;--> statement-breakpoint
ALTER TABLE `email_open_events` ADD `emailLogId` int;