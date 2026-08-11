/*
  MySQL migration script - Run once against the MySQL database after initial schema setup.
  Compatible with MySQL 5.7+ / MySQL 8+
  Adds Roles table, RoleId column to Users, and migrates existing role values.
*/

-- Use the correct database
USE defaultdb;

-- Create Roles table if not exists
CREATE TABLE IF NOT EXISTS Roles (
    RoleId INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(20) NOT NULL UNIQUE
);

-- Insert default roles (ignore duplicates)
INSERT IGNORE INTO Roles (RoleName) VALUES ('ADMIN');
INSERT IGNORE INTO Roles (RoleName) VALUES ('LIBRARIAN');
INSERT IGNORE INTO Roles (RoleName) VALUES ('MEMBER');

-- Add RoleId column to Users if it doesn't exist
ALTER TABLE Users
    ADD COLUMN IF NOT EXISTS RoleId INT NULL;

-- Add UpdatedAt column to Users if it doesn't exist
ALTER TABLE Users
    ADD COLUMN IF NOT EXISTS UpdatedAt DATETIME NULL;

-- Populate RoleId based on existing Role column values
UPDATE Users u
JOIN Roles r ON r.RoleName = CASE
    WHEN UPPER(u.Role) = 'READER' THEN 'MEMBER'
    ELSE UPPER(u.Role)
END
SET u.RoleId = r.RoleId
WHERE u.RoleId IS NULL;

-- Add foreign key constraint if it does not exist
-- (MySQL does not support IF NOT EXISTS for constraints, so we check via information_schema)
SET @fk_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Users'
      AND CONSTRAINT_NAME = 'FK_Users_Roles'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE Users ADD CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)',
    'SELECT ''FK_Users_Roles already exists, skipping.'''
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
