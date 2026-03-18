-- MIGRATION SCRIPT FOR HOSTINGER (Nexus Gaming)
-- This script adds missing tables and updates the Order sequence to match the new code.
-- Run this in your phpMyAdmin SQL tab.

-- 1. FIX ORDER TABLE (Make orderNumber AUTO_INCREMENT)
-- We need to ensure orderNumber is an auto-incrementing integer for the new CDE- logic.
ALTER TABLE `Order` MODIFY `orderNumber` INT(11) NOT NULL AUTO_INCREMENT;

-- 2. ADD MISSING 'Section' TABLE (For Homepage Management)
CREATE TABLE IF NOT EXISTS `Section` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` ENUM('HERO', 'CATEGORIES', 'PRODUCT_CAROUSEL', 'PRODUCT_GRID', 'PROMO_GRID', 'BANNER', 'FEATURED_BUILDS', 'FEATURES', 'PROMO_BANNER') NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `config` JSON NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ADD MISSING 'SystemSetting' TABLE
CREATE TABLE IF NOT EXISTS `SystemSetting` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  `description` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `SystemSetting_key_key`(`key`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ENSURE CATEGORY HAS 'specSchema' (If missing from older versions)
-- ALTER TABLE `Category` ADD COLUMN IF NOT EXISTS `specSchema` VARCHAR(191) DEFAULT NULL;

-- 5. ENSURE BANNER STATUS DEFAULTS TO 'Active'
ALTER TABLE `Banner` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'Active';

-- 6. ADD INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS `Order_createdAt_idx` ON `Order`(`createdAt`);
CREATE INDEX IF NOT EXISTS `Product_status_idx` ON `Product`(`status`);
CREATE INDEX IF NOT EXISTS `Product_brand_idx` ON `Product`(`brand`);
