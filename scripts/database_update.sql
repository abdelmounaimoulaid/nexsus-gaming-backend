-- Database update for Orders and OrderNumber support
-- Run this in your Hostinger SQL console (phpMyAdmin or similar)

-- 8. Update ProductStatus enum to include OUT_OF_STOCK
ALTER TABLE `Product` MODIFY `status` ENUM('DRAFT', 'ACTIVE', 'HIDDEN', 'OUT_OF_STOCK') NOT NULL DEFAULT 'DRAFT';

-- 1. If the Order table doesn't have orderNumber, add it:
ALTER TABLE `Order` ADD COLUMN `orderNumber` INTEGER NOT NULL AUTO_INCREMENT UNIQUE AFTER `id`;

-- 2. Ensure OrderStatus enum is updated if needed:
-- Existing: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REFUNDED

-- 3. If you need to recreate the Order table from scratch (CAUTION: backup data first!):
/*
CREATE TABLE `Order` (
  `id` VARCHAR(191) NOT NULL,
  `orderNumber` INTEGER NOT NULL AUTO_INCREMENT,
  `customerName` VARCHAR(191) NOT NULL,
  `customerEmail` VARCHAR(191) NOT NULL,
  `customerPhone` VARCHAR(191) NOT NULL,
  `address` VARCHAR(191) NULL,
  `city` VARCHAR(191) NULL,
  `notes` TEXT NULL,
  `totalAmount` DOUBLE NOT NULL,
  `discountAmount` DOUBLE NOT NULL DEFAULT 0,
  `finalAmount` DOUBLE NOT NULL,
  `status` ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paymentMethod` ENUM('PAYMENT_ON_DELIVERY', 'BANK_TRANSFER', 'STORE_PICKUP') NOT NULL DEFAULT 'PAYMENT_ON_DELIVERY',
  `userId` VARCHAR(191) NULL,
  `couponId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
  INDEX `Order_userId_fkey`(`userId`),
  INDEX `Order_couponId_fkey`(`couponId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
*/

-- 5. Section Table (for Homepage Layouts)
/*
CREATE TABLE `Section` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` ENUM('HERO', 'CATEGORIES', 'PRODUCT_CAROUSEL', 'PRODUCT_GRID', 'PROMO_GRID', 'BANNER', 'FEATURED_BUILDS', 'FEATURES', 'PROMO_BANNER') NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `config` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
*/

-- 6. Banner Table
/*
CREATE TABLE `Banner` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `imagePath` VARCHAR(191) NOT NULL,
  `targetUrl` VARCHAR(191) NOT NULL,
  `sectionId` VARCHAR(191) NULL,
  `startDate` DATETIME(3) NULL,
  `endDate` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
*/

-- 7. OrderItem table (Foreign Key to Order)
/*
CREATE TABLE `OrderItem` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `quantity` INTEGER NOT NULL,
  `price` DOUBLE NOT NULL,
  `variations` JSON NOT NULL,

  INDEX `OrderItem_orderId_fkey`(`orderId`),
  INDEX `OrderItem_productId_fkey`(`productId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
*/
