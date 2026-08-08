-- ============================================================
-- Database: LibraryManagementDB (MySQL Version - Fixed)
-- ============================================================

-- Xóa database nếu tồn tại
DROP DATABASE IF EXISTS `LibraryManagementDB`;
CREATE DATABASE `LibraryManagementDB`;
USE `LibraryManagementDB`;

-- ============================================================
-- Bảng: Authors
-- ============================================================
CREATE TABLE `Authors` (
    `AuthorId` INT NOT NULL AUTO_INCREMENT,
    `AuthorName` NVARCHAR(100) NOT NULL,
    `Biography` NVARCHAR(500) NULL,
    PRIMARY KEY (`AuthorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: Categories
-- ============================================================
CREATE TABLE `Categories` (
    `CategoryId` INT NOT NULL AUTO_INCREMENT,
    `CategoryName` NVARCHAR(100) NOT NULL,
    `Description` NVARCHAR(255) NULL,
    PRIMARY KEY (`CategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: Publishers
-- ============================================================
CREATE TABLE `Publishers` (
    `PublisherId` INT NOT NULL AUTO_INCREMENT,
    `PublisherName` NVARCHAR(150) NOT NULL,
    `Address` NVARCHAR(255) NULL,
    PRIMARY KEY (`PublisherId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: Books
-- ============================================================
CREATE TABLE `Books` (
    `BookId` INT NOT NULL AUTO_INCREMENT,
    `Title` NVARCHAR(200) NOT NULL,
    `AuthorId` INT NULL,
    `CategoryId` INT NULL,
    `PublisherId` INT NULL,
    `PublishYear` INT NULL,
    `ISBN` VARCHAR(255) NULL,
    `Quantity` INT NOT NULL DEFAULT 0,
    `AvailableQuantity` INT NOT NULL DEFAULT 0,
    `Status` VARCHAR(255) NOT NULL DEFAULT 'Available',
    PRIMARY KEY (`BookId`),
    UNIQUE INDEX `UQ_Books_ISBN` (`ISBN`(255)),
    INDEX `IX_Books_AuthorId` (`AuthorId`),
    INDEX `IX_Books_CategoryId` (`CategoryId`),
    INDEX `IX_Books_PublisherId` (`PublisherId`),
    INDEX `IX_Books_Status` (`Status`(255)),
    INDEX `IX_Books_Title` (`Title`(200)),
    CONSTRAINT `FK_Books_Authors` FOREIGN KEY (`AuthorId`) REFERENCES `Authors` (`AuthorId`),
    CONSTRAINT `FK_Books_Categories` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`CategoryId`),
    CONSTRAINT `FK_Books_Publishers` FOREIGN KEY (`PublisherId`) REFERENCES `Publishers` (`PublisherId`),
    CONSTRAINT `CK_Books_AvailableQuantity` CHECK (`AvailableQuantity` >= 0 AND `AvailableQuantity` <= `Quantity`),
    CONSTRAINT `CK_Books_PublishYear` CHECK (`PublishYear` IS NULL OR (`PublishYear` >= 1000 AND `PublishYear` <= 2100)),
    CONSTRAINT `CK_Books_Quantity` CHECK (`Quantity` >= 0),
    CONSTRAINT `CK_Books_Status` CHECK (`Status` IN ('Available', 'Out of stock'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- View: vw_BookCatalog
-- ============================================================
CREATE VIEW `vw_BookCatalog` AS
SELECT
    b.`BookId`,
    b.`Title`,
    a.`AuthorName`,
    c.`CategoryName`,
    p.`PublisherName`,
    b.`PublishYear`,
    b.`ISBN`,
    b.`Quantity`,
    b.`AvailableQuantity`,
    b.`Status`
FROM `Books` b
LEFT JOIN `Authors` a ON b.`AuthorId` = a.`AuthorId`
LEFT JOIN `Categories` c ON b.`CategoryId` = c.`CategoryId`
LEFT JOIN `Publishers` p ON b.`PublisherId` = p.`PublisherId`;

-- ============================================================
-- Bảng: Users
-- ============================================================
CREATE TABLE `Users` (
    `UserId` INT NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(255) NULL,
    `PasswordHash` VARCHAR(255) NOT NULL,
    `FullName` VARCHAR(255) NULL,
    `Email` VARCHAR(255) NULL,
    `PhoneNumber` VARCHAR(255) NULL,
    `Role` VARCHAR(255) NULL,
    `IsActive` BIT NOT NULL DEFAULT 1,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME NULL,
    PRIMARY KEY (`UserId`),
    UNIQUE INDEX `UQ_Users_Username` (`Username`(255)),
    UNIQUE INDEX `UQ_Users_Email` (`Email`(255)),
    INDEX `IX_Users_Role` (`Role`(255)),
    CONSTRAINT `CK_Users_Email` CHECK (`Email` IS NULL OR `Email` LIKE '%_@__%.__%'),
    CONSTRAINT `CK_Users_PhoneNumber` CHECK (`PhoneNumber` IS NULL OR `PhoneNumber` REGEXP '^0[0-9]{9}$'),
    CONSTRAINT `CK_Users_Role` CHECK (`Role` IN ('READER', 'LIBRARIAN', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: BorrowSlips
-- ============================================================
CREATE TABLE `BorrowSlips` (
    `BorrowSlipId` INT NOT NULL AUTO_INCREMENT,
    `ReaderId` INT NOT NULL,
    `LibrarianId` INT NOT NULL,
    `BorrowDate` DATETIME NOT NULL,
    `DueDate` DATETIME NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Borrowing',
    PRIMARY KEY (`BorrowSlipId`),
    INDEX `IX_BorrowSlips_DueDate` (`DueDate`),
    INDEX `IX_BorrowSlips_LibrarianId` (`LibrarianId`),
    INDEX `IX_BorrowSlips_ReaderId` (`ReaderId`),
    INDEX `IX_BorrowSlips_Status` (`Status`(20)),
    INDEX `IX_BorrowSlips_Reader_Status` (`ReaderId`, `Status`),
    CONSTRAINT `FK_BorrowSlips_Reader` FOREIGN KEY (`ReaderId`) REFERENCES `Users` (`UserId`),
    CONSTRAINT `FK_BorrowSlips_Librarian` FOREIGN KEY (`LibrarianId`) REFERENCES `Users` (`UserId`),
    CONSTRAINT `CK_BorrowSlips_DueDate` CHECK (`DueDate` > `BorrowDate`),
    CONSTRAINT `CK_BorrowSlips_ReaderLibrarianDiff` CHECK (`ReaderId` <> `LibrarianId`),
    CONSTRAINT `CK_BorrowSlips_Status` CHECK (`Status` IN ('Borrowing', 'Returned', 'Overdue'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: BorrowDetails
-- ============================================================
CREATE TABLE `BorrowDetails` (
    `BorrowDetailId` INT NOT NULL AUTO_INCREMENT,
    `BorrowSlipId` INT NOT NULL,
    `BookId` INT NOT NULL,
    `ReturnDate` DATETIME NULL,
    `FineAmount` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `BookCondition` VARCHAR(20) NULL,
    PRIMARY KEY (`BorrowDetailId`),
    INDEX `IX_BorrowDetails_BookId` (`BookId`),
    INDEX `IX_BorrowDetails_BorrowSlipId` (`BorrowSlipId`),
    INDEX `IX_BorrowDetails_ReturnDate` (`ReturnDate`),
    CONSTRAINT `FK_BorrowDetails_Books` FOREIGN KEY (`BookId`) REFERENCES `Books` (`BookId`),
    CONSTRAINT `FK_BorrowDetails_BorrowSlips` FOREIGN KEY (`BorrowSlipId`) REFERENCES `BorrowSlips` (`BorrowSlipId`),
    CONSTRAINT `CK_BorrowDetails_BookCondition` CHECK (`BookCondition` IS NULL OR `BookCondition` IN ('Good', 'Slightly damaged', 'Lost')),
    CONSTRAINT `CK_BorrowDetails_FineAmount` CHECK (`FineAmount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- View: vw_BorrowSlipDetails
-- ============================================================
CREATE VIEW `vw_BorrowSlipDetails` AS
SELECT
    bs.`BorrowSlipId`,
    bs.`BorrowDate`,
    bs.`DueDate`,
    bs.`Status` AS `SlipStatus`,
    r.`UserId` AS `ReaderId`,
    r.`FullName` AS `ReaderName`,
    r.`Email` AS `ReaderEmail`,
    l.`UserId` AS `LibrarianId`,
    l.`FullName` AS `LibrarianName`,
    bd.`BorrowDetailId`,
    bk.`BookId`,
    bk.`Title` AS `BookTitle`,
    bd.`ReturnDate`,
    bd.`FineAmount`,
    bd.`BookCondition`
FROM `BorrowSlips` bs
JOIN `Users` r ON bs.`ReaderId` = r.`UserId`
JOIN `Users` l ON bs.`LibrarianId` = l.`UserId`
JOIN `BorrowDetails` bd ON bd.`BorrowSlipId` = bs.`BorrowSlipId`
JOIN `Books` bk ON bd.`BookId` = bk.`BookId`;

-- ============================================================
-- View: vw_OverdueBorrowDetails
-- ============================================================
CREATE VIEW `vw_OverdueBorrowDetails` AS
SELECT
    bs.`BorrowSlipId`,
    bd.`BorrowDetailId`,
    r.`FullName` AS `ReaderName`,
    r.`PhoneNumber`,
    r.`Email`,
    bk.`Title` AS `BookTitle`,
    bs.`DueDate`,
    DATEDIFF(CURDATE(), bs.`DueDate`) AS `OverdueDays`,
    DATEDIFF(CURDATE(), bs.`DueDate`) * 5000 AS `EstimatedFine`
FROM `BorrowSlips` bs
JOIN `BorrowDetails` bd ON bd.`BorrowSlipId` = bs.`BorrowSlipId`
JOIN `Users` r ON bs.`ReaderId` = r.`UserId`
JOIN `Books` bk ON bd.`BookId` = bk.`BookId`
WHERE bd.`ReturnDate` IS NULL AND bs.`DueDate` < CURDATE();

-- ============================================================
-- View: vw_TopBorrowedBooks
-- ============================================================
CREATE VIEW `vw_TopBorrowedBooks` AS
SELECT
    bk.`BookId`,
    bk.`Title`,
    COUNT(bd.`BorrowDetailId`) AS `TimesBorrowed`
FROM `Books` bk
JOIN `BorrowDetails` bd ON bd.`BookId` = bk.`BookId`
GROUP BY bk.`BookId`, bk.`Title`;

-- ============================================================
-- View: vw_LibraryStatistics
-- ============================================================
CREATE VIEW `vw_LibraryStatistics` AS
SELECT
    (SELECT COUNT(*) FROM `Books`) AS `TotalBooks`,
    (SELECT COUNT(*) FROM `Users` WHERE `Role` = 'READER') AS `TotalReaders`,
    (SELECT COUNT(*) FROM `Users` WHERE `Role` = 'LIBRARIAN') AS `TotalLibrarians`,
    (SELECT COUNT(*) FROM `BorrowSlips`) AS `TotalBorrowSlips`,
    (SELECT COUNT(*) FROM `BorrowSlips` WHERE `Status` = 'Borrowing') AS `CurrentlyBorrowing`,
    (SELECT COUNT(*) FROM `BorrowSlips` WHERE `Status` = 'Overdue') AS `OverdueSlips`,
    (SELECT IFNULL(SUM(`FineAmount`), 0) FROM `BorrowDetails`) AS `TotalFineCollected`;

-- ============================================================
-- Bảng: membership_plans
-- ============================================================
CREATE TABLE `membership_plans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `borrowingLimit` INT NULL,
    `duration` INT NULL,
    `fees` DOUBLE NULL,
    `type` VARCHAR(255) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `CK_membership_plans_type` CHECK (`type` IN ('BASIC', 'PREMIUM'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: members
-- ============================================================
CREATE TABLE `members` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `endDate` DATE NULL,
    `penaltyAmount` DOUBLE NOT NULL,
    `startDate` DATE NULL,
    `status` VARCHAR(255) NULL,
    `membership_plan_id` BIGINT NULL,
    `user_id` BIGINT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UK_members_user_id` (`user_id`),
    CONSTRAINT `FK_members_membership_plans` FOREIGN KEY (`membership_plan_id`) REFERENCES `membership_plans` (`id`),
    CONSTRAINT `CK_members_status` CHECK (`status` IN ('ACTIVE', 'EXPIRED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: book_requests
-- ============================================================
CREATE TABLE `book_requests` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `requestDate` DATE NULL,
    `status` VARCHAR(255) NULL,
    `book_id` INT NOT NULL,
    `member_id` BIGINT NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `IX_book_requests_book_id` (`book_id`),
    INDEX `IX_book_requests_member_id` (`member_id`),
    CONSTRAINT `FK_book_requests_Books` FOREIGN KEY (`book_id`) REFERENCES `Books` (`BookId`),
    CONSTRAINT `FK_book_requests_members` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`),
    CONSTRAINT `CK_book_requests_status` CHECK (`status` IN ('PENDING', 'APPROVED', 'REJECTED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: transactions
-- ============================================================
CREATE TABLE `transactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `issue_date` DATE NOT NULL,
    `created_at` DATETIME NULL,
    `due_date` DATE NOT NULL,
    `fine` INT NULL,
    `penaltyAmount` DOUBLE NULL,
    `penalty_status` VARCHAR(255) NOT NULL,
    `return_date` DATE NULL,
    `status` VARCHAR(255) NULL,
    `updated_at` DATETIME NULL,
    `book_condition_on_return` VARCHAR(255) NULL,
    `damage_penalty` INT NOT NULL DEFAULT 0,
    `book_id` BIGINT NOT NULL,
    `member_id` BIGINT NOT NULL,
    `penalty_amount` DOUBLE NULL,
    PRIMARY KEY (`id`),
    INDEX `IX_transactions_member_id` (`member_id`),
    INDEX `IX_transactions_book_id` (`book_id`),
    CONSTRAINT `FK_transactions_members` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: otp
-- ============================================================
CREATE TABLE `otp` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME NULL,
    `email` VARCHAR(255) NOT NULL,
    `otp` VARCHAR(255) NOT NULL,
    `expiresAt` DATETIME NULL,
    PRIMARY KEY (`id`),
    INDEX `IX_otp_email` (`email`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: password_resets
-- ============================================================
CREATE TABLE `password_resets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `expiry_time` DATETIME NOT NULL,
    `otp` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `IX_password_resets_email` (`email`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: PasswordResetTokens
-- ============================================================
CREATE TABLE `PasswordResetTokens` (
    `TokenId` INT NOT NULL AUTO_INCREMENT,
    `UserId` INT NOT NULL,
    `OtpCode` VARCHAR(6) NOT NULL,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ExpiresAt` DATETIME NOT NULL,
    `IsUsed` BIT NOT NULL DEFAULT 0,
    PRIMARY KEY (`TokenId`),
    INDEX `IX_PasswordResetTokens_OtpCode` (`OtpCode`),
    INDEX `IX_PasswordResetTokens_UserId` (`UserId`),
    CONSTRAINT `FK_PasswordResetTokens_Users` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`),
    CONSTRAINT `CK_PasswordResetTokens_ExpiresAt` CHECK (`ExpiresAt` > `CreatedAt`),
    CONSTRAINT `CK_PasswordResetTokens_OtpFormat` CHECK (`OtpCode` REGEXP '^[0-9]{6}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: Roles
-- ============================================================
CREATE TABLE `Roles` (
    `RoleId` BIGINT NOT NULL AUTO_INCREMENT,
    `RoleName` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`RoleId`),
    UNIQUE INDEX `UK_Roles_RoleName` (`RoleName`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: sessions
-- ============================================================
CREATE TABLE `sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `loginTime` DATETIME NULL,
    `logoutTime` DATETIME NULL,
    `token` VARCHAR(255) NULL,
    `userId` BIGINT NULL,
    PRIMARY KEY (`id`),
    INDEX `IX_sessions_userId` (`userId`),
    INDEX `IX_sessions_token` (`token`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Bảng: TokenBlacklist (FIXED - index key too long error)
-- ============================================================
CREATE TABLE `TokenBlacklist` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `blacklistedAt` DATETIME NULL,
    `token` VARCHAR(255) NULL,  -- Giảm từ 1000 xuống 255 để tránh lỗi index key too long
    PRIMARY KEY (`id`),
    UNIQUE INDEX `UK_TokenBlacklist_token` (`token`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Stored Procedure: sp_BorrowBook (Helper - tạo bảng tạm)
-- ============================================================
DELIMITER //

CREATE PROCEDURE `sp_BorrowBook_Prepare`(
    IN `p_BookIds` VARCHAR(1000)
)
BEGIN
    DECLARE `v_pos` INT DEFAULT 1;
    DECLARE `v_item` VARCHAR(100);
    DECLARE `v_BookId` INT;
    DECLARE `v_delimiter` CHAR(1) DEFAULT ',';
    
    -- Tạo bảng tạm
    DROP TEMPORARY TABLE IF EXISTS `tmp_BookIds`;
    CREATE TEMPORARY TABLE `tmp_BookIds` (
        `BookId` INT NOT NULL,
        PRIMARY KEY (`BookId`)
    ) ENGINE=MEMORY;
    
    -- Parse chuỗi BookIds
    WHILE `v_pos` <= LENGTH(`p_BookIds`) DO
        SET `v_item` = SUBSTRING_INDEX(SUBSTRING_INDEX(`p_BookIds`, `v_delimiter`, `v_pos`), `v_delimiter`, -1);
        IF `v_item` <> '' THEN
            SET `v_BookId` = CAST(`v_item` AS UNSIGNED);
            INSERT IGNORE INTO `tmp_BookIds` (`BookId`) VALUES (`v_BookId`);
        END IF;
        SET `v_pos` = `v_pos` + 1;
    END WHILE;
END //

DELIMITER ;

-- ============================================================
-- Stored Procedure: sp_BorrowBook
-- ============================================================
DELIMITER //

CREATE PROCEDURE `sp_BorrowBook`(
    IN `p_ReaderId` INT,
    IN `p_LibrarianId` INT,
    IN `p_BorrowDays` INT,
    OUT `p_NewBorrowSlipId` INT
)
BEGIN
    DECLARE `v_BorrowDate` DATETIME;
    DECLARE `v_DueDate` DATETIME;
    DECLARE `v_done` INT DEFAULT FALSE;
    DECLARE `v_BookId` INT;
    DECLARE `v_book_cursor` CURSOR FOR SELECT `BookId` FROM `tmp_BookIds`;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET `v_done` = TRUE;
    
    -- Kiểm tra độc giả
    IF NOT EXISTS (SELECT 1 FROM `Users` WHERE `UserId` = `p_ReaderId` AND `Role` = 'READER' AND `IsActive` = 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Độc giả không hợp lệ hoặc tài khoản đã bị khóa.';
    END IF;
    
    -- Kiểm tra thủ thư
    IF NOT EXISTS (SELECT 1 FROM `Users` WHERE `UserId` = `p_LibrarianId` AND `Role` = 'LIBRARIAN' AND `IsActive` = 1) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Thủ thư không hợp lệ hoặc tài khoản đã bị khóa.';
    END IF;
    
    -- Kiểm tra sách quá hạn
    IF EXISTS (SELECT 1 FROM `BorrowSlips` WHERE `ReaderId` = `p_ReaderId` AND `Status` = 'Overdue') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Độc giả đang có sách quá hạn chưa trả, không thể mượn thêm.';
    END IF;
    
    -- Kiểm tra sách hết
    IF EXISTS (
        SELECT 1
        FROM `Books` b
        JOIN `tmp_BookIds` t ON t.`BookId` = b.`BookId`
        WHERE b.`AvailableQuantity` <= 0
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Một hoặc nhiều sách trong danh sách đã hết, không thể mượn.';
    END IF;
    
    START TRANSACTION;
    
    SET `v_BorrowDate` = NOW();
    SET `v_DueDate` = DATE_ADD(`v_BorrowDate`, INTERVAL `p_BorrowDays` DAY);
    
    INSERT INTO `BorrowSlips` (`ReaderId`, `LibrarianId`, `BorrowDate`, `DueDate`, `Status`)
    VALUES (`p_ReaderId`, `p_LibrarianId`, `v_BorrowDate`, `v_DueDate`, 'Borrowing');
    
    SET `p_NewBorrowSlipId` = LAST_INSERT_ID();
    
    -- Cập nhật từng sách
    OPEN `v_book_cursor`;
    `book_loop`: LOOP
        FETCH `v_book_cursor` INTO `v_BookId`;
        IF `v_done` THEN
            LEAVE `book_loop`;
        END IF;
        
        INSERT INTO `BorrowDetails` (`BorrowSlipId`, `BookId`, `ReturnDate`, `FineAmount`, `BookCondition`)
        VALUES (`p_NewBorrowSlipId`, `v_BookId`, NULL, 0, NULL);
        
        UPDATE `Books`
        SET
            `AvailableQuantity` = `AvailableQuantity` - 1,
            `Status` = CASE WHEN `AvailableQuantity` - 1 <= 0 THEN 'Out of stock' ELSE `Status` END
        WHERE `BookId` = `v_BookId`
        AND `AvailableQuantity` > 0;
    END LOOP;
    CLOSE `v_book_cursor`;
    
    COMMIT;
END //

DELIMITER ;

-- ============================================================
-- Stored Procedure: sp_BorrowBook_WithList (wrapper)
-- ============================================================
DELIMITER //

CREATE PROCEDURE `sp_BorrowBook_WithList`(
    IN `p_ReaderId` INT,
    IN `p_LibrarianId` INT,
    IN `p_BookIds` VARCHAR(1000),
    IN `p_BorrowDays` INT,
    OUT `p_NewBorrowSlipId` INT
)
BEGIN
    -- Tạo bảng tạm với danh sách BookId
    CALL `sp_BorrowBook_Prepare`(`p_BookIds`);
    
    -- Gọi procedure chính
    CALL `sp_BorrowBook`(`p_ReaderId`, `p_LibrarianId`, `p_BorrowDays`, `p_NewBorrowSlipId`);
    
    -- Xóa bảng tạm
    DROP TEMPORARY TABLE IF EXISTS `tmp_BookIds`;
END //

DELIMITER ;

-- ============================================================
-- Stored Procedure: sp_ReturnBook
-- ============================================================
DELIMITER //

CREATE PROCEDURE `sp_ReturnBook`(
    IN `p_BorrowDetailId` INT,
    IN `p_BookCondition` VARCHAR(20),
    IN `p_FinePerDay` DECIMAL(10,2)
)
BEGIN
    DECLARE `v_BorrowSlipId` INT;
    DECLARE `v_BookId` INT;
    DECLARE `v_DueDate` DATETIME;
    DECLARE `v_ReturnDate` DATETIME;
    DECLARE `v_OverdueDays` INT;
    DECLARE `v_Fine` DECIMAL(10,2);
    
    IF `p_BookCondition` IS NULL THEN
        SET `p_BookCondition` = 'Good';
    END IF;
    
    IF `p_FinePerDay` IS NULL THEN
        SET `p_FinePerDay` = 5000;
    END IF;
    
    SELECT
        bd.`BorrowSlipId`,
        bd.`BookId`,
        bs.`DueDate`
    INTO
        `v_BorrowSlipId`,
        `v_BookId`,
        `v_DueDate`
    FROM `BorrowDetails` bd
    JOIN `BorrowSlips` bs ON bs.`BorrowSlipId` = bd.`BorrowSlipId`
    WHERE bd.`BorrowDetailId` = `p_BorrowDetailId`;
    
    IF `v_BorrowSlipId` IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Không tìm thấy chi tiết phiếu mượn.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM `BorrowDetails` WHERE `BorrowDetailId` = `p_BorrowDetailId` AND `ReturnDate` IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sách này đã được ghi nhận trả trước đó.';
    END IF;
    
    SET `v_ReturnDate` = NOW();
    SET `v_OverdueDays` = DATEDIFF(`v_ReturnDate`, `v_DueDate`);
    SET `v_Fine` = CASE WHEN `v_OverdueDays` > 0 THEN `v_OverdueDays` * `p_FinePerDay` ELSE 0 END;
    
    START TRANSACTION;
    
    UPDATE `BorrowDetails`
    SET
        `ReturnDate` = `v_ReturnDate`,
        `FineAmount` = `v_Fine`,
        `BookCondition` = `p_BookCondition`
    WHERE `BorrowDetailId` = `p_BorrowDetailId`;
    
    UPDATE `Books`
    SET
        `AvailableQuantity` = `AvailableQuantity` + 1,
        `Status` = 'Available'
    WHERE `BookId` = `v_BookId`;
    
    IF NOT EXISTS (
        SELECT 1 FROM `BorrowDetails`
        WHERE `BorrowSlipId` = `v_BorrowSlipId` AND `ReturnDate` IS NULL
    ) THEN
        UPDATE `BorrowSlips` SET `Status` = 'Returned' WHERE `BorrowSlipId` = `v_BorrowSlipId`;
    END IF;
    
    COMMIT;
END //

DELIMITER ;

-- ============================================================
-- Stored Procedure: sp_UpdateOverdueStatus
-- ============================================================
DELIMITER //

CREATE PROCEDURE `sp_UpdateOverdueStatus`()
BEGIN
    UPDATE `BorrowSlips`
    SET `Status` = 'Overdue'
    WHERE `Status` = 'Borrowing' AND `DueDate` < NOW();
    
    SELECT ROW_COUNT() AS `SlipsMarkedOverdue`;
END //

DELIMITER ;

-- ============================================================
-- Chèn dữ liệu: Authors
-- ============================================================
INSERT INTO `Authors` (`AuthorId`, `AuthorName`, `Biography`) VALUES
(1, 'Nguyễn Nhật Ánh', 'Nhà văn Việt Nam nổi tiếng với các tác phẩm văn học thiếu nhi và tuổi mới lớn.'),
(2, 'Tô Hoài', 'Nhà văn hiện thực Việt Nam, tác giả nhiều tác phẩm văn học thiếu nhi kinh điển.'),
(3, 'Nam Cao', 'Nhà văn hiện thực phê phán tiêu biểu của văn học Việt Nam giai đoạn 1930-1945.'),
(4, 'Vũ Trọng Phụng', 'Nhà văn, nhà báo Việt Nam nổi tiếng với các tác phẩm trào phúng.'),
(5, 'Ngô Tất Tố', 'Nhà văn, nhà báo, học giả Việt Nam đầu thế kỷ 20.'),
(6, 'Nguyễn Du', 'Đại thi hào dân tộc, tác giả của nhiều áng thơ nổi tiếng.'),
(7, 'Xuân Diệu', 'Nhà thơ lớn của phong trào Thơ mới Việt Nam.'),
(8, 'Hàn Mặc Tử', 'Nhà thơ tiêu biểu của phong trào Thơ mới Việt Nam.'),
(9, 'Nguyễn Minh Châu', 'Nhà văn quân đội, cây bút tiên phong của văn học đổi mới.'),
(10, 'Bảo Ninh', 'Nhà văn Việt Nam, tác giả các tiểu thuyết viết về chiến tranh.'),
(11, 'Nguyễn Huy Thiệp', 'Nhà văn Việt Nam với phong cách viết truyện ngắn độc đáo.'),
(12, 'Dương Thu Hương', 'Nhà văn Việt Nam với nhiều tác phẩm được dịch ra nhiều thứ tiếng.'),
(13, 'Marc Levy', 'Nhà văn Pháp nổi tiếng với các tiểu thuyết lãng mạn.'),
(14, 'Paulo Coelho', 'Nhà văn người Brazil, tác giả nhiều tác phẩm bán chạy toàn cầu.'),
(15, 'J.K. Rowling', 'Nhà văn người Anh, tác giả bộ truyện giả tưởng nổi tiếng thế giới.'),
(16, 'George Orwell', 'Nhà văn, nhà báo người Anh, tác giả nhiều tiểu thuyết chính trị - xã hội.'),
(17, 'Dale Carnegie', 'Tác giả người Mỹ chuyên viết sách về kỹ năng sống và giao tiếp.'),
(18, 'Robert C. Martin', 'Kỹ sư phần mềm, tác giả nhiều sách kinh điển về lập trình.'),
(19, 'Martin Fowler', 'Chuyên gia phần mềm, tác giả nhiều sách về kiến trúc phần mềm.'),
(20, 'Eric Evans', 'Tác giả sách về thiết kế phần mềm hướng miền (Domain-Driven Design).'),
(21, 'Yuval Noah Harari', 'Nhà sử học, tác giả nhiều sách khoa học phổ thông nổi tiếng.'),
(22, 'Haruki Murakami', 'Nhà văn Nhật Bản nổi tiếng với phong cách viết siêu thực.'),
(23, 'Agatha Christie', 'Nhà văn người Anh, nữ hoàng truyện trinh thám thế giới.'),
(24, 'Antoine de Saint-Exupéry', 'Nhà văn, phi công người Pháp, tác giả tác phẩm kinh điển thiếu nhi.'),
(25, 'Napoleon Hill', 'Tác giả người Mỹ chuyên viết sách về thành công và làm giàu.');

-- ============================================================
-- Chèn dữ liệu: Categories
-- ============================================================
INSERT INTO `Categories` (`CategoryId`, `CategoryName`, `Description`) VALUES
(1, 'Văn học Việt Nam', 'Các tác phẩm văn học của tác giả trong nước.'),
(2, 'Văn học nước ngoài', 'Các tác phẩm văn học dịch từ tiếng nước ngoài.'),
(3, 'Tiểu thuyết', 'Thể loại văn xuôi hư cấu dài.'),
(4, 'Truyện ngắn', 'Thể loại văn xuôi hư cấu ngắn.'),
(5, 'Thơ ca', 'Các tác phẩm thơ, trường ca.'),
(6, 'Kỹ năng sống', 'Sách phát triển kỹ năng cá nhân.'),
(7, 'Kinh tế - Quản trị', 'Sách về kinh tế học và quản trị kinh doanh.'),
(8, 'Công nghệ thông tin', 'Sách chuyên ngành công nghệ thông tin, lập trình.'),
(9, 'Khoa học - Kỹ thuật', 'Sách phổ biến kiến thức khoa học kỹ thuật.'),
(10, 'Lịch sử', 'Sách nghiên cứu và phổ biến lịch sử.'),
(11, 'Tâm lý học', 'Sách về tâm lý học và hành vi con người.'),
(12, 'Triết học', 'Sách nghiên cứu triết học.'),
(13, 'Giáo trình - Tham khảo', 'Giáo trình và tài liệu tham khảo học tập.'),
(14, 'Ngoại ngữ', 'Sách học và luyện tập ngoại ngữ.'),
(15, 'Thiếu nhi', 'Sách dành cho lứa tuổi thiếu nhi.'),
(16, 'Trinh thám - Hình sự', 'Tiểu thuyết trinh thám, hình sự.'),
(17, 'Khoa học viễn tưởng', 'Tiểu thuyết khoa học viễn tưởng.'),
(18, 'Sách self-help', 'Sách hướng dẫn phát triển bản thân.'),
(19, 'Chính trị - Xã hội', 'Sách về các vấn đề chính trị, xã hội.'),
(20, 'Nghệ thuật - Hội họa', 'Sách về nghệ thuật, hội họa, âm nhạc.');

-- ============================================================
-- Chèn dữ liệu: Publishers
-- ============================================================
INSERT INTO `Publishers` (`PublisherId`, `PublisherName`, `Address`) VALUES
(1, 'NXB Trẻ', '161B Lý Chính Thắng, Quận 3, TP. Hồ Chí Minh'),
(2, 'NXB Kim Đồng', '55 Quang Trung, Hai Bà Trưng, Hà Nội'),
(3, 'NXB Giáo Dục Việt Nam', '81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội'),
(4, 'NXB Văn Học', '18 Nguyễn Trường Tộ, Ba Đình, Hà Nội'),
(5, 'NXB Hội Nhà Văn', '65 Nguyễn Du, Hai Bà Trưng, Hà Nội'),
(6, 'NXB Tổng Hợp TP. Hồ Chí Minh', '62 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh'),
(7, 'NXB Lao Động', '175 Giảng Võ, Đống Đa, Hà Nội'),
(8, 'NXB Thế Giới', '46 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội'),
(9, 'NXB Chính Trị Quốc Gia Sự Thật', '6/86 Duy Tân, Cầu Giấy, Hà Nội'),
(10, 'NXB Phụ Nữ Việt Nam', '39 Hàng Chuối, Hai Bà Trưng, Hà Nội'),
(11, 'NXB Đại Học Quốc Gia Hà Nội', '16 Hàng Chuối, Hai Bà Trưng, Hà Nội'),
(12, 'NXB Khoa Học Xã Hội', '26 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội'),
(13, 'NXB Thanh Niên', '64 Bà Triệu, Hoàn Kiếm, Hà Nội'),
(14, 'NXB Dân Trí', '347 Đội Cấn, Ba Đình, Hà Nội'),
(15, 'NXB Alpha Books', '225 Nguyễn Ngọc Nại, Thanh Xuân, Hà Nội'),
(16, 'NXB First News - Trí Việt', '11H Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh'),
(17, 'NXB Nhã Nam', '59 Đỗ Quang, Cầu Giấy, Hà Nội'),
(18, 'NXB Công Thương', '655 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội'),
(19, 'NXB Y Học', '352 Đội Cấn, Ba Đình, Hà Nội'),
(20, 'NXB Xây Dựng', '37 Lê Đại Hành, Hai Bà Trưng, Hà Nội');

-- ============================================================
-- Chèn dữ liệu: Books
-- ============================================================
INSERT INTO `Books` (`BookId`, `Title`, `AuthorId`, `CategoryId`, `PublisherId`, `PublishYear`, `ISBN`, `Quantity`, `AvailableQuantity`, `Status`) VALUES
(1, 'Mắt Biếc', 1, 1, 1, 1990, '9780061120084', 5, 5, 'Available'),
(2, 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', 1, 1, 1, 2008, '9780142412477', 6, 6, 'Available'),
(3, 'Dế Mèn Phiêu Lưu Ký', 2, 15, 2, 1941, '9780140444449', 8, 6, 'Available'),
(4, 'Số Đỏ', 4, 1, 4, 1936, '9780140445682', 4, 3, 'Available'),
(5, 'Tắt Đèn', 5, 1, 4, 1937, '9780141439628', 3, 3, 'Available'),
(6, 'Chí Phèo', 3, 4, 4, 1941, '9780140446450', 5, 4, 'Available'),
(7, 'Truyện Kiều', 6, 5, 4, 1820, '9780140449185', 4, 4, 'Available'),
(8, 'Nỗi Buồn Chiến Tranh', 10, 1, 5, 1990, '9780099448826', 3, 1, 'Available'),
(9, 'Tuổi Thơ Dữ Dội', 2, 15, 1, 1988, '9780142437777', 4, 4, 'Available'),
(10, 'Hoàng Tử Bé', 24, 15, 17, 1943, '9780156012195', 10, 7, 'Available'),
(11, 'Nhà Giả Kim', 14, 2, 16, 1988, '9780061122415', 9, 9, 'Available'),
(12, 'Đắc Nhân Tâm', 17, 6, 15, 1936, '9780671027036', 12, 12, 'Available'),
(13, 'Sapiens - Lược Sử Loài Người', 21, 9, 15, 2011, '9780062316097', 7, 7, 'Available'),
(14, 'Clean Code', 18, 8, 15, 2008, '9780132350884', 6, 5, 'Available'),
(15, 'Refactoring', 19, 8, 15, 1999, '9780134757599', 5, 4, 'Available'),
(16, 'Domain-Driven Design', 20, 8, 15, 2003, '9780321125217', 4, 4, 'Available'),
(17, 'Rừng Na Uy', 22, 2, 17, 1987, '9780099590082', 5, 4, 'Available'),
(18, 'Án Mạng Trên Sông Nile', 23, 16, 17, 1937, '9780007119318', 6, 3, 'Available'),
(19, 'Harry Potter và Hòn Đá Phù Thủy', 15, 17, 17, 1997, '9780747532699', 10, 9, 'Available'),
(20, '1984', 16, 19, 17, 1949, '9780451524935', 8, 5, 'Available'),
(21, 'Nghĩ Giàu Làm Giàu', 25, 6, 15, 1937, '9781585424331', 9, 8, 'Available'),
(22, 'Giáo Trình Lập Trình Java Căn Bản', NULL, 8, 3, 2022, '9780135166307', 15, 15, 'Available'),
(23, 'Cơ Sở Dữ Liệu - Nguyên Lý và Ứng Dụng', NULL, 8, 3, 2021, '9780133970777', 12, 11, 'Available'),
(24, 'Nhập Môn Công Nghệ Phần Mềm', NULL, 8, 11, 2020, '9780134685991', 10, 7, 'Available'),
(25, 'Kỹ Năng Giao Tiếp Hiệu Quả', NULL, 6, 15, 2019, '9780071771320', 8, 6, 'Available'),
(26, 'Tâm Lý Học Đám Đông', NULL, 11, 6, 1895, '9781847941835', 6, 3, 'Available'),
(27, 'Lịch Sử Việt Nam Bằng Tranh', NULL, 10, 1, 2015, '9780195142567', 10, 8, 'Available'),
(28, 'Bí Mật Của May Mắn', 13, 2, 17, 2004, '9780091816975', 5, 3, 'Available'),
(29, 'Người Giàu Có Nhất Thành Babylon', 25, 6, 15, 1926, '9780451205360', 8, 6, 'Available'),
(30, 'Tư Duy Nhanh Và Chậm', NULL, 11, 15, 2011, '9780374533551', 6, 6, 'Available');

-- ============================================================
-- Chèn dữ liệu: Users
-- ============================================================
INSERT INTO `Users` (`UserId`, `Username`, `PasswordHash`, `FullName`, `Email`, `PhoneNumber`, `Role`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'admin01', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Trần Đức Toàn', 'admin01@gmail.com', '0974303911', 'ADMIN', 1, NOW(), NULL),
(2, 'admin02', '$2a$10$MGBLeV0.9bzHVwAxh6k2.TYlbHHoHG9UHKXIIezPfFK1ohaoehyQm', 'Hoàng Văn Bảo', 'admin02@gmail.com', '0943872624', 'ADMIN', 1, NOW(), NULL),
(3, 'admin03', '$2a$10$hQsIfvkU4mBmNRhONTikarah.gGL2jFAqQhU42BOJTEvS3QFnuFta', 'Trần Xuân Hùng', 'admin03@gmail.com', '0325107991', 'ADMIN', 1, NOW(), NULL),
(4, 'librarian01', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Ngô Kim Thảo', 'librarian01@gmail.com', '0703158692', 'LIBRARIAN', 1, NOW(), NULL),
(5, 'librarian02', '$2a$10$QY1wWmzAmka3p744b8VKkqLencZSDFf8J61Yx/zfSAN2cW7GfP6R7', 'Trần Văn Kiên', 'librarian02@gmail.com', '0355148465', 'LIBRARIAN', 1, NOW(), NULL),
(6, 'librarian03', '$2a$10$U85hfj.ej4JkeiqoKRTdxTbI10q71Ha1xCw9Atmx1c.ci3.DxrzV7', 'Hoàng Hữu Toàn', 'librarian03@gmail.com', '0708895798', 'LIBRARIAN', 1, NOW(), NULL),
(7, 'librarian04', '$2a$10$7XGhwpb6prwj1gK8CGscIFDfZCTeQ8Ob7gvVOUnNDnwyZJfNmPFs2', 'Trần Xuân Tuấn', 'librarian04@gmail.com', '0939806990', 'LIBRARIAN', 1, NOW(), NULL),
(8, 'librarian05', '$2a$10$6T3Wi973ipfLj5f7wrD/pX.bthrjjBYKe0.e8.5CLlczfnv8s2qt6', 'Ngô Đức Dũng', 'librarian05@gmail.com', '0705185067', 'LIBRARIAN', 1, NOW(), NULL),
(9, 'reader01', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Phạm Thành Bảo', 'reader01@gmail.com', '0964431351', 'READER', 1, NOW(), NULL),
(10, 'reader02', '$2a$10$58lEdkk6JdhZ2OcTiSJHVnk4P7mzi/4KF3pgDLdCiFW84jX3.L8s0', 'Bùi Ngọc Thảo', 'reader02@gmail.com', '0943412328', 'READER', 1, NOW(), NULL),
(11, 'reader03', '$2a$10$E6LogpOzA70GYu/4GaiQk4.PDeUnB0LcO7PT/li198f6SxYRIj1ri', 'Võ Minh Trang', 'reader03@gmail.com', '0975125674', 'READER', 1, NOW(), NULL),
(12, 'reader04', '$2a$10$w6pYexd0Fo8wxT/EQqM4M6BS0TJ8hryKqwo.EIekdL3MM4VmDFpHl', 'Hoàng Quốc Kiên', 'reader04@gmail.com', '0904499727', 'READER', 1, NOW(), NULL),
(13, 'reader05', '$2a$10$WKwe/Sd7g6gB7kUJ4sm2g6mZx9NewtllCyjBG/kdtcYgRMFn4EuQL', 'Hà Văn Long', 'reader05@gmail.com', '0975623869', 'READER', 1, NOW(), NULL),
(14, 'reader06', '$2a$10$g9lrO7JScyuLyBhP6vhwvNd8DpcI7m0ORFEm/OMeRx6v1T1M.0jEv', 'Hà Kim Nga', 'reader06@gmail.com', '0965623285', 'READER', 1, NOW(), NULL),
(15, 'reader07', '$2a$10$HyjYP6LbCGqfQaIabdqSAjSQgWODQBtepCWhGQ1OI85uN5cFm6DH9', 'Phạm Đức Long', 'reader07@gmail.com', '0947735158', 'READER', 1, NOW(), NULL),
(16, 'reader08', '$2a$10$jpwl63MOb35d0r6z1Mo2ogvT8ILKL3MvQHqP0t2GkntNbT9cNsvOj', 'Phan Hồng Trang', 'reader08@gmail.com', '0986177115', 'READER', 1, NOW(), NULL),
(17, 'reader09', '$2a$10$DXinrsAXSzISDLbw16rUvnpKGTUGKi42.41ibOs3Ok.nFcyHAambR', 'Phạm Thành Bảo', 'reader09@gmail.com', '0353689980', 'READER', 1, NOW(), NULL),
(18, 'reader10', '$2a$10$tJyF3C6Jo2z1lOzCpV6uL3Nf3zKynrcqVJOYssSeNSgZWTJW/75po', 'Dương Bích Hương', 'reader10@gmail.com', '0964510762', 'READER', 1, NOW(), NULL),
(19, 'reader11', '$2a$10$n75EHvkJLx7F5Yp8TH5NrKWFf44Uuvkx0rGqIqMxkgTqKSsnyQKnw', 'Lê Công Hùng', 'reader11@gmail.com', '0937177449', 'READER', 0, NOW(), NULL),
(20, 'reader12', '$2a$10$br.YcRTJlMErQwTUXV4F0ue4k5den8Yv47kw1UZRgG9vNPkKUi5S3', 'Ngô Ngọc Trang', 'reader12@gmail.com', '0705281685', 'READER', 0, NOW(), NULL),
(21, 'reader13', '$2a$10$KvcDoMqSREk8R85AKCgbT2OkemPGe16IO/CeSl2Ate1XKuICx8Fxv', 'Hà Bích Thảo', 'reader13@gmail.com', '0913750606', 'READER', 1, NOW(), NULL),
(22, 'reader14', '$2a$10$FtrW79XRI6ElZFZFony8gEYktGqiPv3z4xrX//viK2K3XlpNKpln5', 'Phan Công Đạt', 'reader14@gmail.com', '0960515319', 'READER', 1, NOW(), NULL),
(23, 'reader15', '$2a$10$HJzuUDS4EQIeuuxET5vv4JRuyojfODX/xPhh5bk.ZPRJ5W4LosIlm', 'Võ Văn Kiên', 'reader15@gmail.com', '0356275705', 'READER', 1, NOW(), NULL),
(24, 'reader16', '$2a$10$uv7QLIny900JQoJ57sQXQ3HPTmVUpcskKgZjQmLVTVrFDKFha1D/l', 'Bùi Thanh My', 'reader16@gmail.com', '0932583132', 'READER', 1, NOW(), NULL),
(25, 'reader17', '$2a$10$197arSooszQvNoe7Pi5fSMGlx1fUpoYU/7/n/CLy6ebtGGk/8kBN3', 'Trần Thanh Nga', 'reader17@gmail.com', '0704736471', 'READER', 1, NOW(), NULL),
(26, 'reader18', '$2a$10$kJx5jPQMyvruSZzFFERq86TRpoUymr.m8CvqO1nD8hdG9VwSfEOYC', 'Nguyễn Thành Đạt', 'reader18@gmail.com', '0934565060', 'READER', 1, NOW(), NULL),
(27, 'reader19', '$2a$10$Rap9woW6rth9Yfjmcmka.o9sjkPwysSlFkKs4g9bZiiRNefGcdGM0', 'Võ Ngọc Uyên', 'reader19@gmail.com', '0325626368', 'READER', 1, NOW(), NULL),
(28, 'reader20', '$2a$10$ZkpkHLdEW1WEy/XlEBmNqk6/R7iYOqU6gXBrlYWz2pLzMXR9pfAhx', 'Ngô Minh Trang', 'reader20@gmail.com', '0977120826', 'READER', 1, NOW(), NULL),
(29, 'reader21', '$2a$10$HP7nUznPlvccR9T6v18bfK5uJOHZTVp4Oa.L5H6Q16H7nCygAbJF2', 'Lê Văn Trung', 'reader21@gmail.com', '0947454990', 'READER', 1, NOW(), NULL),
(30, 'reader22', '$2a$10$1vw5wwKRsPWyQcACm72wdf6sTjYOE1CeaIME5GfFz4dbHRldopemS', 'Nguyễn Hữu Vinh', 'reader22@gmail.com', '0971801704', 'READER', 1, NOW(), NULL),
(31, 'demoadmin', '$2a$10$5ka8w7DkwELaB.r5P6Vi1uDW53Jpp3SL.qVnW7v0uZy0XJxK2xmDq', 'Demo Admin', 'demoadmin@gmail.com', NULL, 'ADMIN', 1, NOW(), NULL),
(32, 'reader111', '$2a$10$Jed.2d0QJHl3LRYZBQziw.sn5Utf6XeI791pl3kKq/8r63vjCSzZy', 'reader111', 'reader111@gmail.com', NULL, 'READER', 1, NOW(), NULL),
(34, 'demolibrarian', '$2a$10$sq4HP3bZz9Nj6nl5BqsnRuQEh4gM8jZPzM9QQVDNZl5NBMc4MBaH6', 'Thị Thu Demo', 'demolibrarian@gmail.com', NULL, 'LIBRARIAN', 1, NOW(), NULL);

-- ============================================================
-- Chèn dữ liệu: BorrowSlips
-- ============================================================
INSERT INTO `BorrowSlips` (`BorrowSlipId`, `ReaderId`, `LibrarianId`, `BorrowDate`, `DueDate`, `Status`) VALUES
(1, 30, 8, '2025-09-22 15:03:26', '2025-10-06 15:03:26', 'Returned'),
(2, 10, 8, '2026-03-30 06:22:35', '2026-04-13 06:22:35', 'Overdue'),
(3, 22, 8, '2026-02-09 01:42:25', '2026-02-23 01:42:25', 'Overdue'),
(4, 29, 7, '2026-02-24 11:36:17', '2026-03-10 11:36:17', 'Overdue'),
(5, 22, 5, '2025-11-01 13:42:23', '2025-11-15 13:42:23', 'Returned'),
(6, 26, 7, '2025-10-02 08:12:16', '2025-10-16 08:12:16', 'Returned'),
(7, 13, 7, '2025-06-30 20:28:33', '2025-07-14 20:28:33', 'Returned'),
(8, 22, 8, '2026-02-27 04:52:55', '2026-03-13 04:52:55', 'Returned'),
(9, 17, 5, '2025-11-17 23:32:45', '2025-12-01 23:32:45', 'Returned'),
(10, 23, 6, '2025-07-18 19:30:06', '2025-08-01 19:30:06', 'Overdue'),
(11, 15, 4, '2025-10-16 13:43:56', '2025-10-30 13:43:56', 'Overdue'),
(12, 28, 4, '2025-07-08 06:51:02', '2025-07-22 06:51:02', 'Overdue'),
(13, 27, 8, '2025-09-20 17:27:15', '2025-10-04 17:27:15', 'Returned'),
(14, 19, 6, '2025-06-08 07:42:42', '2025-06-22 07:42:42', 'Returned'),
(15, 12, 7, '2025-10-03 22:00:20', '2025-10-17 22:00:20', 'Overdue'),
(16, 21, 5, '2026-03-10 11:42:34', '2026-03-24 11:42:34', 'Overdue'),
(17, 21, 7, '2026-03-01 23:37:09', '2026-03-15 23:37:09', 'Returned'),
(18, 17, 6, '2026-02-18 18:06:19', '2026-03-04 18:06:19', 'Returned'),
(19, 24, 6, '2025-09-13 13:29:49', '2025-09-27 13:29:49', 'Returned'),
(20, 10, 8, '2025-09-22 05:18:46', '2025-10-06 05:18:46', 'Returned'),
(21, 26, 8, '2026-03-24 15:12:12', '2026-04-07 15:12:12', 'Returned'),
(22, 15, 6, '2025-09-26 13:49:46', '2025-10-10 13:49:46', 'Overdue'),
(23, 16, 7, '2026-03-09 23:50:00', '2026-03-23 23:50:00', 'Overdue'),
(24, 19, 6, '2026-02-06 23:21:48', '2026-02-20 23:21:48', 'Overdue'),
(25, 23, 5, '2025-11-28 06:09:45', '2025-12-12 06:09:45', 'Returned');

-- ============================================================
-- Chèn dữ liệu: BorrowDetails
-- ============================================================
INSERT INTO `BorrowDetails` (`BorrowDetailId`, `BorrowSlipId`, `BookId`, `ReturnDate`, `FineAmount`, `BookCondition`) VALUES
(1, 1, 18, '2025-10-10 15:03:26', 20000.00, 'Good'),
(2, 2, 30, NULL, 0.00, NULL),
(3, 3, 29, NULL, 0.00, NULL),
(4, 4, 18, NULL, 0.00, NULL),
(5, 5, 21, '2025-11-05 13:42:23', 0.00, 'Lost'),
(6, 6, 2, '2025-10-07 08:12:16', 0.00, 'Good'),
(7, 7, 25, '2025-07-03 20:28:33', 0.00, 'Slightly damaged'),
(8, 8, 5, '2026-03-09 04:52:55', 0.00, 'Good'),
(9, 9, 23, '2025-11-24 23:32:45', 0.00, 'Good'),
(10, 10, 7, NULL, 0.00, NULL),
(11, 11, 17, NULL, 0.00, NULL),
(12, 12, 15, NULL, 0.00, NULL),
(13, 13, 12, '2025-09-24 17:27:15', 0.00, 'Lost'),
(14, 14, 21, '2026-08-05 15:25:38', 2045000.00, 'Good'),
(15, 15, 22, NULL, 0.00, NULL),
(16, 16, 30, NULL, 0.00, NULL),
(17, 17, 20, '2026-03-19 23:37:09', 20000.00, 'Slightly damaged'),
(18, 18, 1, '2026-02-21 18:06:19', 0.00, 'Lost'),
(19, 19, 18, '2025-09-29 13:29:49', 10000.00, 'Good'),
(20, 20, 1, '2025-10-11 05:18:46', 25000.00, 'Good'),
(21, 21, 18, '2026-04-05 15:12:12', 0.00, 'Good'),
(22, 22, 17, NULL, 0.00, NULL),
(23, 23, 27, NULL, 0.00, NULL),
(24, 24, 23, NULL, 0.00, NULL),
(25, 25, 22, '2025-12-14 06:09:45', 10000.00, 'Good'),
(26, 4, 30, NULL, 0.00, NULL),
(27, 4, 17, NULL, 0.00, NULL),
(28, 5, 8, '2025-11-10 13:42:23', 0.00, 'Lost'),
(29, 17, 9, '2026-03-15 23:37:09', 0.00, 'Good'),
(30, 13, 3, '2025-10-04 17:27:15', 0.00, 'Slightly damaged');

-- ============================================================
-- Chèn dữ liệu: members
-- ============================================================
INSERT INTO `members` (`id`, `endDate`, `penaltyAmount`, `startDate`, `status`, `membership_plan_id`, `user_id`) VALUES
(1, NULL, 0, '2026-08-05', 'ACTIVE', NULL, 32);

-- ============================================================
-- Chèn dữ liệu: book_requests
-- ============================================================
INSERT INTO `book_requests` (`id`, `requestDate`, `status`, `book_id`, `member_id`) VALUES
(4, '2026-08-05', 'APPROVED', 30, 1),
(5, '2026-08-05', 'REJECTED', 29, 1),
(6, '2026-08-05', 'REJECTED', 29, 1),
(7, '2026-08-05', 'REJECTED', 25, 1);

-- ============================================================
-- Chèn dữ liệu: PasswordResetTokens
-- ============================================================
INSERT INTO `PasswordResetTokens` (`TokenId`, `UserId`, `OtpCode`, `CreatedAt`, `ExpiresAt`, `IsUsed`) VALUES
(1, 15, '933410', '2025-10-18 14:45:20', '2025-10-18 15:00:20', 1),
(2, 18, '700217', '2026-04-11 23:28:49', '2026-04-11 23:43:49', 0),
(3, 19, '180339', '2026-05-02 09:52:12', '2026-05-02 10:07:12', 1),
(4, 3, '489025', '2025-09-09 07:32:32', '2025-09-09 07:47:32', 1),
(5, 25, '614293', '2026-06-18 14:10:07', '2026-06-18 14:25:07', 0),
(6, 18, '562185', '2025-09-28 03:33:23', '2025-09-28 03:48:23', 1),
(7, 27, '159996', '2026-02-15 01:04:43', '2026-02-15 01:19:43', 0),
(8, 26, '773586', '2026-04-10 06:45:45', '2026-04-10 07:00:45', 0),
(9, 22, '619431', '2025-10-13 09:45:23', '2025-10-13 10:00:23', 1),
(10, 23, '265511', '2025-09-03 11:13:25', '2025-09-03 11:28:25', 1),
(11, 25, '412126', '2026-04-18 20:16:45', '2026-04-18 20:31:45', 1),
(12, 14, '101581', '2026-02-14 14:01:33', '2026-02-14 14:16:33', 1),
(13, 14, '618398', '2025-11-26 13:51:43', '2025-11-26 14:06:43', 1),
(14, 9, '447212', '2026-04-11 10:02:50', '2026-04-11 10:17:50', 1),
(15, 16, '154379', '2025-12-10 16:40:12', '2025-12-10 16:55:12', 1),
(16, 10, '065965', '2026-04-14 12:11:14', '2026-04-14 12:26:14', 1),
(17, 27, '924593', '2026-05-04 11:26:20', '2026-05-04 11:41:20', 1),
(18, 13, '547935', '2026-03-12 10:12:19', '2026-03-12 10:27:19', 0),
(19, 13, '519398', '2025-12-02 20:01:42', '2025-12-02 20:16:42', 1),
(20, 24, '737416', '2026-05-14 05:04:02', '2026-05-14 05:19:02', 0);

-- ============================================================
-- Chèn dữ liệu: transactions
-- ============================================================
INSERT INTO `transactions` (`id`, `issue_date`, `created_at`, `due_date`, `fine`, `penaltyAmount`, `penalty_status`, `return_date`, `status`, `updated_at`, `book_condition_on_return`, `damage_penalty`, `book_id`, `member_id`, `penalty_amount`) VALUES
(1, '2026-08-05', '2026-08-05 16:17:59.967718', '2026-08-19', 0, NULL, 'PENDING', '2026-08-05', 'RETURNED', '2026-08-05 16:30:07.446946', 'GOOD', 0, 30, 1, NULL),
(2, '2026-08-05', '2026-08-05 16:21:50.580624', '2026-08-19', 0, NULL, 'PENDING', '2026-08-05', 'RETURNED', '2026-08-05 16:35:51.820685', 'GOOD', 0, 29, 1, NULL),
(3, '2026-08-05', '2026-08-05 16:21:50.895261', '2026-08-19', 0, NULL, 'PENDING', NULL, 'BORROWED', '2026-08-05 16:21:50.895261', NULL, 0, 28, 1, NULL),
(4, '2026-08-05', '2026-08-05 16:21:51.193974', '2026-08-19', 0, NULL, 'PENDING', NULL, 'BORROWED', '2026-08-05 16:21:51.193974', NULL, 0, 27, 1, NULL),
(5, '2026-08-05', '2026-08-05 16:21:51.520027', '2026-08-19', 0, NULL, 'PENDING', NULL, 'BORROWED', '2026-08-05 16:21:51.520027', NULL, 0, 26, 1, NULL);