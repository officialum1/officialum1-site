CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` varchar(191) NOT NULL,
	`description` text NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`original_price` decimal(10,2),
	`category` varchar(191) NOT NULL,
	`platform` varchar(191),
	`image_url` text,
	`stock` int NOT NULL DEFAULT 0,
	`in_stock` boolean NOT NULL DEFAULT true,
	`featured` boolean NOT NULL DEFAULT false,
	`rating` decimal(3,2),
	`review_count` int NOT NULL DEFAULT 0,
	`badge` varchar(191),
	`tags` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` varchar(191) NOT NULL,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`email` varchar(191) NOT NULL,
	`name` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`total` decimal(10,2) NOT NULL,
	`items` json NOT NULL,
	`payment_method` varchar(50) NOT NULL,
	`coupon_code` varchar(50),
	`delivery_token` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(191) NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'buyer',
	`wallet_balance` decimal(10,2) NOT NULL DEFAULT '0',
	`referral_code` varchar(191) NOT NULL,
	`referred_by` varchar(191),
	`membership_tier` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `blogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` varchar(191) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`image_url` text,
	`category` varchar(100) NOT NULL,
	`author` varchar(100) NOT NULL DEFAULT 'OfficialUM1 Team',
	`read_time` int NOT NULL DEFAULT 5,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogs_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogs_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int,
	`product_name` text,
	`author_name` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(255) NOT NULL,
	`price` decimal(10,2),
	`price_label` varchar(100) NOT NULL,
	`features` json NOT NULL,
	`popular` boolean NOT NULL DEFAULT false,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`user_email` varchar(191),
	`subject` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'open',
	`priority` varchar(50) NOT NULL DEFAULT 'normal',
	`message` text NOT NULL,
	`order_id` int,
	`replies` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(191) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`service` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(191) NOT NULL,
	`name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_email_unique` UNIQUE(`email`)
);
