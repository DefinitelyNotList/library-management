/*
  Run once against LibraryManagementDB after loading LibraryManagementDB.sql.
  It adapts the existing Users table to the JPA authentication model without
  discarding the original library data.
*/
USE LibraryManagementDB;
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        RoleName VARCHAR(20) NOT NULL UNIQUE
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'ADMIN') INSERT INTO dbo.Roles (RoleName) VALUES ('ADMIN');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'LIBRARIAN') INSERT INTO dbo.Roles (RoleName) VALUES ('LIBRARIAN');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'MEMBER') INSERT INTO dbo.Roles (RoleName) VALUES ('MEMBER');
GO

IF COL_LENGTH('dbo.Users', 'RoleId') IS NULL ALTER TABLE dbo.Users ADD RoleId INT NULL;
IF COL_LENGTH('dbo.Users', 'UpdatedAt') IS NULL ALTER TABLE dbo.Users ADD UpdatedAt DATETIME NULL;
GO

UPDATE u
SET RoleId = r.RoleId
FROM dbo.Users u
JOIN dbo.Roles r ON r.RoleName = CASE WHEN u.Role = 'READER' THEN 'MEMBER' ELSE u.Role END
WHERE u.RoleId IS NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Users_Roles')
    ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId);
GO
