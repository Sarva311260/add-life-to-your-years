CREATE TABLE `consult_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consultationId` int NOT NULL,
	`role` varchar(16) NOT NULL,
	`content` text NOT NULL,
	`phase` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consult_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consult_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consultationId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`recommendations` json NOT NULL,
	`productRecommendations` json,
	`pdfUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consult_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consultType` varchar(32) NOT NULL,
	`selectedConditions` json,
	`currentPhase` int NOT NULL DEFAULT 1,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`evaluationId` int,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shop_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`shortDescription` varchar(500),
	`priceInCents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'AUD',
	`imageUrl` varchar(512),
	`category` varchar(64),
	`relatedRecommendations` json,
	`purchaseUrl` varchar(512),
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shop_products_id` PRIMARY KEY(`id`)
);
