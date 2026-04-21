CREATE TABLE `affiliate_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(50),
	`notes` text,
	`source` varchar(20) NOT NULL DEFAULT 'manual',
	`enrolledSequenceId` int,
	`enrolledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_contacts_id` PRIMARY KEY(`id`)
);
