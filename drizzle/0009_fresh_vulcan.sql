CREATE TABLE `pemf_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('document','script','email_template','video') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` varchar(512),
	`fileName` varchar(255),
	`content` text,
	`videoUrl` varchar(512),
	`category` varchar(100),
	`isPublished` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pemf_resources_id` PRIMARY KEY(`id`)
);
