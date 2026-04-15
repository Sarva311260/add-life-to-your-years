CREATE TABLE `affiliate_drip_overrides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`dripEmailId` int NOT NULL,
	`subject` varchar(255),
	`body` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_drip_overrides_id` PRIMARY KEY(`id`)
);
