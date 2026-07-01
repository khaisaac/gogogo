-- ==========================================================
-- SQL Migration: SEO Management Module (MySQL / Hostinger)
-- ==========================================================

-- 1. Create table `seo_pages` for static page SEO metadata
CREATE TABLE IF NOT EXISTS `seo_pages` (
  `id` VARCHAR(191) NOT NULL,
  `page_slug` VARCHAR(191) NOT NULL,
  `seo_title` TEXT NULL,
  `meta_description` TEXT NULL,
  `meta_keywords` TEXT NULL,
  `canonical_url` TEXT NULL,
  `robots` VARCHAR(191) NOT NULL DEFAULT 'index, follow',
  `og_title` TEXT NULL,
  `og_description` TEXT NULL,
  `og_image` TEXT NULL,
  `twitter_title` TEXT NULL,
  `twitter_description` TEXT NULL,
  `twitter_image` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `seo_pages_page_slug_key` (`page_slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Add SEO columns to `posts` (Articles) table
ALTER TABLE `posts`
ADD COLUMN `seo_title` TEXT NULL,
ADD COLUMN `meta_description` TEXT NULL,
ADD COLUMN `meta_keywords` TEXT NULL,
ADD COLUMN `canonical_url` TEXT NULL,
ADD COLUMN `robots` VARCHAR(191) NULL DEFAULT 'index, follow',
ADD COLUMN `og_title` TEXT NULL,
ADD COLUMN `og_description` TEXT NULL,
ADD COLUMN `og_image` TEXT NULL,
ADD COLUMN `twitter_title` TEXT NULL,
ADD COLUMN `twitter_description` TEXT NULL,
ADD COLUMN `twitter_image` TEXT NULL;
