CREATE TABLE `affiliate_product_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`productId` int NOT NULL,
	`affiliateUrl` varchar(1024) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_product_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommended_products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`shortDescription` varchar(500),
	`imageUrl` varchar(512),
	`category` varchar(64),
	`isAffiliate` int NOT NULL DEFAULT 0,
	`defaultAffiliateUrl` varchar(1024),
	`isPublished` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommended_products_id` PRIMARY KEY(`id`)
);
