-- Exam Portal MySQL schema for Railway import
-- Generated from Sequelize models in this repository
-- Usage (from your machine):
--   mysql -h <host> -P <port> -u <user> -p <database> < deployDB.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- Optional: create database (uncomment and change name if desired)
-- CREATE DATABASE IF NOT EXISTS `exam_portal` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `exam_portal`;

-- Table: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','student') NOT NULL DEFAULT 'student',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: exams
CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `duration` INT NULL DEFAULT 60,
  `total_questions` INT NULL DEFAULT 0,
  `passing_score` INT NULL DEFAULT 70,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `start_date` DATETIME NULL,
  `end_date` DATETIME NULL,
  `instructions` TEXT NULL,
  `date` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: questions (FK -> exams)
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `exam_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` TEXT NOT NULL,
  `option_b` TEXT NOT NULL,
  `option_c` TEXT NOT NULL,
  `option_d` TEXT NOT NULL,
  `correct_option` ENUM('A','B','C','D') NOT NULL,
  `points` INT NOT NULL DEFAULT 1,
  `explanation` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `questions_exam_id_idx` (`exam_id`),
  CONSTRAINT `questions_exam_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_exam_assignments (FK -> users, exams)
CREATE TABLE IF NOT EXISTS `user_exam_assignments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `exam_id` INT NOT NULL,
  `assigned_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by` INT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_exam_assignments_user_exam_unique` (`user_id`,`exam_id`),
  KEY `user_exam_assignments_user_id_idx` (`user_id`),
  KEY `user_exam_assignments_exam_id_idx` (`exam_id`),
  KEY `user_exam_assignments_assigned_by_idx` (`assigned_by`),
  CONSTRAINT `user_exam_assignments_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_exam_assignments_assigned_by_fk` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `user_exam_assignments_exam_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: exam_results (FK -> users, exams)
CREATE TABLE IF NOT EXISTS `exam_results` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `exam_id` INT NOT NULL,
  `score` DECIMAL(5,2) NOT NULL,
  `total_questions` INT NOT NULL,
  `correct_answers` INT NOT NULL,
  `total_points` INT NOT NULL,
  `earned_points` INT NOT NULL,
  `time_taken` INT NOT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('passed','failed','incomplete') NOT NULL,
  `is_passed` TINYINT(1) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_results_user_exam_unique` (`user_id`,`exam_id`),
  KEY `exam_results_user_id_idx` (`user_id`),
  KEY `exam_results_exam_id_idx` (`exam_id`),
  CONSTRAINT `exam_results_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exam_results_exam_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: exam_responses (FK -> users, exams, questions)
CREATE TABLE IF NOT EXISTS `exam_responses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `exam_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `selected_option` ENUM('A','B','C','D') NULL,
  `is_correct` TINYINT(1) NULL,
  `points_earned` INT NOT NULL DEFAULT 0,
  `time_spent` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_responses_user_exam_question_unique` (`user_id`,`exam_id`,`question_id`),
  KEY `exam_responses_user_id_idx` (`user_id`),
  KEY `exam_responses_exam_id_idx` (`exam_id`),
  KEY `exam_responses_question_id_idx` (`question_id`),
  CONSTRAINT `exam_responses_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exam_responses_exam_id_fk` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exam_responses_question_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- Notes:
-- 1) Application will seed an admin user and a sample exam/questions on first run.
--    Credentials: admin@examportal.com / admin123 (password is created and hashed by the app).
-- 2) If you already have data locally, prefer using mysqldump from your local DB instead.


