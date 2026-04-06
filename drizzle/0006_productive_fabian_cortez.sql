CREATE TABLE `consult_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`consultationId` int NOT NULL,
	`reportId` int NOT NULL,
	`rating` int NOT NULL,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `consult_ratings_id` PRIMARY KEY(`id`)
);
