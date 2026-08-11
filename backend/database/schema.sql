-- ============================================================
-- LIBRARIO - Full Database Schema for MySQL (Aiven / Cloud)
-- Run this ONCE against your Aiven defaultdb database
-- ============================================================

-- 1. Roles
CREATE TABLE IF NOT EXISTS Roles (
    RoleId INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(20) NOT NULL UNIQUE
);
INSERT IGNORE INTO Roles (RoleName) VALUES ('ADMIN'), ('LIBRARIAN'), ('MEMBER');

-- 2. Users
CREATE TABLE IF NOT EXISTS Users (
    UserId     BIGINT AUTO_INCREMENT PRIMARY KEY,
    Username   VARCHAR(100),
    FullName   VARCHAR(255),
    Email      VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255),
    PhoneNumber  VARCHAR(20),
    Role         VARCHAR(50),
    RoleId       INT,
    IsActive     TINYINT(1) DEFAULT 1,
    CreatedAt    DATETIME,
    UpdatedAt    DATETIME,
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- 3. Authors
CREATE TABLE IF NOT EXISTS Authors (
    AuthorId    INT AUTO_INCREMENT PRIMARY KEY,
    AuthorName  VARCHAR(255) NOT NULL,
    Biography   TEXT
);

-- 4. Categories
CREATE TABLE IF NOT EXISTS Categories (
    CategoryId   INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(255) NOT NULL,
    Description  TEXT
);

-- 5. Publishers
CREATE TABLE IF NOT EXISTS Publishers (
    PublisherId   INT AUTO_INCREMENT PRIMARY KEY,
    PublisherName VARCHAR(255) NOT NULL,
    Address       VARCHAR(500)
);

-- 6. Books
CREATE TABLE IF NOT EXISTS Books (
    BookId            INT AUTO_INCREMENT PRIMARY KEY,
    Title             VARCHAR(500) NOT NULL,
    AuthorId          INT,
    CategoryId        INT,
    PublisherId       INT,
    PublishYear       INT,
    ISBN              VARCHAR(50),
    Quantity          INT DEFAULT 0,
    AvailableQuantity INT DEFAULT 0,
    Status            VARCHAR(50) DEFAULT 'Available',
    CONSTRAINT FK_Books_Authors    FOREIGN KEY (AuthorId)    REFERENCES Authors(AuthorId),
    CONSTRAINT FK_Books_Categories FOREIGN KEY (CategoryId)  REFERENCES Categories(CategoryId),
    CONSTRAINT FK_Books_Publishers FOREIGN KEY (PublisherId) REFERENCES Publishers(PublisherId)
);

-- 7. Membership Plans
CREATE TABLE IF NOT EXISTS membership_plans (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    type           VARCHAR(50),
    fees           DOUBLE,
    borrowingLimit INT,
    duration       INT
);
INSERT IGNORE INTO membership_plans (id, type, fees, borrowingLimit, duration)
VALUES (1, 'BASIC', 50000, 3, 30),
       (2, 'PREMIUM', 100000, 5, 60);

-- 8. Members
CREATE TABLE IF NOT EXISTS members (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT,
    membership_plan_id BIGINT,
    startDate         DATE,
    endDate           DATE,
    status            VARCHAR(20) DEFAULT 'ACTIVE',
    penaltyAmount     DOUBLE DEFAULT 0.0,
    CONSTRAINT FK_Members_Users FOREIGN KEY (user_id) REFERENCES Users(UserId),
    CONSTRAINT FK_Members_Plans FOREIGN KEY (membership_plan_id) REFERENCES membership_plans(id)
);

-- 9. Transactions (borrow/return)
CREATE TABLE IF NOT EXISTS transactions (
    id                     BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id              BIGINT NOT NULL,
    book_id                BIGINT NOT NULL,
    issue_date             DATE NOT NULL,
    due_date               DATE NOT NULL,
    return_date            DATE,
    fine                   INT DEFAULT 0,
    damage_penalty         INT DEFAULT 0,
    book_condition_on_return VARCHAR(50),
    status                 VARCHAR(20) NOT NULL,
    penalty_status         VARCHAR(20) DEFAULT 'PENDING',
    created_at             DATETIME,
    updated_at             DATETIME,
    CONSTRAINT FK_Trans_Members FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT FK_Trans_Books   FOREIGN KEY (book_id)   REFERENCES Books(BookId)
);

-- 10. Book Requests
CREATE TABLE IF NOT EXISTS book_requests (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id   BIGINT NOT NULL,
    book_id     BIGINT NOT NULL,
    requestDate DATE,
    status      VARCHAR(20),
    CONSTRAINT FK_BookReq_Members FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT FK_BookReq_Books   FOREIGN KEY (book_id)   REFERENCES Books(BookId)
);

-- 11. Token Blacklist (JWT logout)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    token          VARCHAR(1000) NOT NULL UNIQUE,
    blacklistedAt  DATETIME
);

-- 12. OTP (forgot password)
CREATE TABLE IF NOT EXISTS otp (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255),
    otp        VARCHAR(10),
    createdAt  DATETIME,
    expiresAt  DATETIME
);

-- ============================================================
-- Default ADMIN user (password: Admin@123 - BCrypt encoded)
-- IMPORTANT: Change this password after first login!
-- ============================================================
INSERT IGNORE INTO Users (Username, FullName, Email, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt)
VALUES ('admin', 'Administrator', 'admin@librario.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- password: "password"
        'ADMIN', 1, NOW(), NOW());
