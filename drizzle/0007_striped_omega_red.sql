CREATE TABLE `pemf_affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pemf_affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `pemf_affiliates_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `pemf_enquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`visitorName` varchar(255) NOT NULL,
	`visitorEmail` varchar(320) NOT NULL,
	`visitorPhone` varchar(50),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pemf_enquiries_id` PRIMARY KEY(`id`)
);
