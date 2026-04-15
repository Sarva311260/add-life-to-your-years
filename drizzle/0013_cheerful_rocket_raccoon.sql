CREATE TABLE `email_click_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dripSendLogId` int NOT NULL,
	`affiliateId` int NOT NULL,
	`dripEmailId` int NOT NULL,
	`prospectEmail` varchar(320),
	`targetUrl` text NOT NULL,
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	`userAgent` text,
	CONSTRAINT `email_click_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_open_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dripSendLogId` int NOT NULL,
	`affiliateId` int NOT NULL,
	`dripEmailId` int NOT NULL,
	`prospectEmail` varchar(320),
	`openedAt` timestamp NOT NULL DEFAULT (now()),
	`userAgent` text,
	CONSTRAINT `email_open_events_id` PRIMARY KEY(`id`)
);
