CREATE TABLE `drip_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sequenceId` int NOT NULL,
	`dayOffset` int NOT NULL DEFAULT 0,
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drip_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drip_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sequenceId` int NOT NULL,
	`enquiryId` int NOT NULL,
	`affiliateId` int NOT NULL,
	`leadEmail` varchar(320) NOT NULL,
	`leadName` varchar(255) NOT NULL,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`unsubscribeToken` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drip_enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `drip_enrollments_unsubscribeToken_unique` UNIQUE(`unsubscribeToken`)
);
--> statement-breakpoint
CREATE TABLE `drip_send_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`dripEmailId` int NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`status` varchar(20) NOT NULL DEFAULT 'sent',
	CONSTRAINT `drip_send_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drip_sequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drip_sequences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(32) NOT NULL,
	`affiliateId` int,
	`toEmail` varchar(320) NOT NULL,
	`toName` varchar(255),
	`subject` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`resendId` varchar(128),
	`status` varchar(20) NOT NULL DEFAULT 'sent',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `pemf_affiliates` ADD `facebook` varchar(512);--> statement-breakpoint
ALTER TABLE `pemf_affiliates` ADD `instagram` varchar(512);--> statement-breakpoint
ALTER TABLE `pemf_affiliates` ADD `linkedin` varchar(512);--> statement-breakpoint
ALTER TABLE `pemf_affiliates` ADD `tiktok` varchar(512);--> statement-breakpoint
ALTER TABLE `pemf_affiliates` ADD `youtube` varchar(512);--> statement-breakpoint
ALTER TABLE `pemf_affiliates` ADD `twitter` varchar(512);--> statement-breakpoint
ALTER TABLE `pemf_enquiries` ADD `sourcePage` varchar(512);