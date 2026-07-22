/*
  Database: LibraryManagementDB
  He thong Quan ly Thu vien - Script tao cau truc bang va du lieu mau
  Target: Microsoft SQL Server 2022
  Moi bang nghiep vu duoc sinh khoang 20-30 dong du lieu mau de phuc vu
  demo/kiem thu chuc nang.
*/

IF DB_ID('LibraryManagementDB') IS NULL
BEGIN
    CREATE DATABASE LibraryManagementDB;
END
GO

USE LibraryManagementDB;
GO

-- Xoa cac doi tuong cu (neu co) theo dung thu tu phu thuoc
-- Buoc 1: Stored Procedures
IF OBJECT_ID('dbo.sp_BorrowBook', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_BorrowBook;
IF OBJECT_ID('dbo.sp_ReturnBook', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_ReturnBook;
IF OBJECT_ID('dbo.sp_UpdateOverdueStatus', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateOverdueStatus;
GO
-- Buoc 2: Views
IF OBJECT_ID('dbo.vw_BookCatalog', 'V') IS NOT NULL DROP VIEW dbo.vw_BookCatalog;
IF OBJECT_ID('dbo.vw_BorrowSlipDetails', 'V') IS NOT NULL DROP VIEW dbo.vw_BorrowSlipDetails;
IF OBJECT_ID('dbo.vw_OverdueBorrowDetails', 'V') IS NOT NULL DROP VIEW dbo.vw_OverdueBorrowDetails;
IF OBJECT_ID('dbo.vw_TopBorrowedBooks', 'V') IS NOT NULL DROP VIEW dbo.vw_TopBorrowedBooks;
IF OBJECT_ID('dbo.vw_LibraryStatistics', 'V') IS NOT NULL DROP VIEW dbo.vw_LibraryStatistics;
GO
-- Buoc 3: Tables (theo thu tu phu thuoc khoa ngoai)
IF OBJECT_ID('dbo.PasswordResetTokens', 'U') IS NOT NULL DROP TABLE dbo.PasswordResetTokens;
IF OBJECT_ID('dbo.BorrowDetails', 'U') IS NOT NULL DROP TABLE dbo.BorrowDetails;
IF OBJECT_ID('dbo.BorrowSlips', 'U') IS NOT NULL DROP TABLE dbo.BorrowSlips;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID('dbo.Authors', 'U') IS NOT NULL DROP TABLE dbo.Authors;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Publishers', 'U') IS NOT NULL DROP TABLE dbo.Publishers;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO
-- Buoc 4: User-Defined Table Type (dung lam tham so cho sp_BorrowBook)
IF TYPE_ID('dbo.BookIdListType') IS NOT NULL DROP TYPE dbo.BookIdListType;
GO

-- ======================================================================
-- TABLE: Users
-- ======================================================================
CREATE TABLE Users (
    UserId         INT IDENTITY(1,1) PRIMARY KEY,
    Username       VARCHAR(50)     NOT NULL UNIQUE,
    PasswordHash   VARCHAR(255)    NOT NULL,
    FullName       NVARCHAR(100)   NOT NULL,
    Email          VARCHAR(100)    UNIQUE,
    PhoneNumber    VARCHAR(15),
    Role           VARCHAR(20)     NOT NULL,
    IsActive       BIT             NOT NULL DEFAULT 1,
    CreatedAt      DATETIME        NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_Users_Role CHECK (Role IN ('ADMIN','LIBRARIAN','READER')),
    CONSTRAINT CK_Users_Email CHECK (Email IS NULL OR Email LIKE '%_@__%.__%'),
    CONSTRAINT CK_Users_PhoneNumber CHECK (PhoneNumber IS NULL OR PhoneNumber LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
);
GO

-- ======================================================================
-- TABLE: Authors
-- ======================================================================
CREATE TABLE Authors (
    AuthorId    INT IDENTITY(1,1) PRIMARY KEY,
    AuthorName  NVARCHAR(100)  NOT NULL,
    Biography   NVARCHAR(500)  NULL
);
GO

-- ======================================================================
-- TABLE: Categories
-- ======================================================================
CREATE TABLE Categories (
    CategoryId    INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName  NVARCHAR(100)  NOT NULL,
    Description   NVARCHAR(255)  NULL
);
GO

-- ======================================================================
-- TABLE: Publishers
-- ======================================================================
CREATE TABLE Publishers (
    PublisherId    INT IDENTITY(1,1) PRIMARY KEY,
    PublisherName  NVARCHAR(150)  NOT NULL,
    Address        NVARCHAR(255)  NULL
);
GO

-- ======================================================================
-- TABLE: Books
-- ======================================================================
CREATE TABLE Books (
    BookId             INT IDENTITY(1,1) PRIMARY KEY,
    Title              NVARCHAR(200)   NOT NULL,
    AuthorId           INT             NULL FOREIGN KEY REFERENCES Authors(AuthorId),
    CategoryId         INT             NULL FOREIGN KEY REFERENCES Categories(CategoryId),
    PublisherId        INT             NULL FOREIGN KEY REFERENCES Publishers(PublisherId),
    PublishYear        INT             NULL,
    ISBN               VARCHAR(20)     UNIQUE,
    Quantity           INT             NOT NULL DEFAULT 0,
    AvailableQuantity  INT             NOT NULL DEFAULT 0,
    Status             VARCHAR(20)     NOT NULL DEFAULT 'Available',
    CONSTRAINT CK_Books_Quantity CHECK (Quantity >= 0),
    CONSTRAINT CK_Books_AvailableQuantity CHECK (AvailableQuantity >= 0 AND AvailableQuantity <= Quantity),
    CONSTRAINT CK_Books_PublishYear CHECK (PublishYear IS NULL OR PublishYear BETWEEN 1000 AND 2100),
    CONSTRAINT CK_Books_Status CHECK (Status IN ('Available','Out of stock'))
);
GO

-- ======================================================================
-- TABLE: BorrowSlips
-- ======================================================================
CREATE TABLE BorrowSlips (
    BorrowSlipId   INT IDENTITY(1,1) PRIMARY KEY,
    ReaderId       INT       NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    LibrarianId    INT       NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    BorrowDate     DATETIME  NOT NULL,
    DueDate        DATETIME  NOT NULL,
    Status         VARCHAR(20) NOT NULL DEFAULT 'Borrowing',
    CONSTRAINT CK_BorrowSlips_DueDate CHECK (DueDate > BorrowDate),
    CONSTRAINT CK_BorrowSlips_Status CHECK (Status IN ('Borrowing','Returned','Overdue')),
    CONSTRAINT CK_BorrowSlips_ReaderLibrarianDiff CHECK (ReaderId <> LibrarianId)
);
GO

-- ======================================================================
-- TABLE: BorrowDetails
-- ======================================================================
CREATE TABLE BorrowDetails (
    BorrowDetailId   INT IDENTITY(1,1) PRIMARY KEY,
    BorrowSlipId     INT             NOT NULL FOREIGN KEY REFERENCES BorrowSlips(BorrowSlipId),
    BookId           INT             NOT NULL FOREIGN KEY REFERENCES Books(BookId),
    ReturnDate       DATETIME        NULL,
    FineAmount       DECIMAL(10,2)   NOT NULL DEFAULT 0,
    BookCondition    VARCHAR(20)     NULL,
    CONSTRAINT CK_BorrowDetails_FineAmount CHECK (FineAmount >= 0),
    CONSTRAINT CK_BorrowDetails_BookCondition CHECK (BookCondition IS NULL OR BookCondition IN ('Good','Slightly damaged','Lost'))
);
GO

-- ======================================================================
-- TABLE: PasswordResetTokens (phuc vu chuc nang Quen mat khau)
-- ======================================================================
CREATE TABLE PasswordResetTokens (
    TokenId      INT IDENTITY(1,1) PRIMARY KEY,
    UserId       INT           NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    OtpCode      VARCHAR(6)    NOT NULL,
    CreatedAt    DATETIME      NOT NULL DEFAULT GETDATE(),
    ExpiresAt    DATETIME      NOT NULL,
    IsUsed       BIT           NOT NULL DEFAULT 0,
    CONSTRAINT CK_PasswordResetTokens_ExpiresAt CHECK (ExpiresAt > CreatedAt),
    CONSTRAINT CK_PasswordResetTokens_OtpFormat CHECK (OtpCode LIKE '[0-9][0-9][0-9][0-9][0-9][0-9]')
);
GO

-- ======================================================================
-- INDEXES: toi uu hieu nang cho cac truy van tim kiem / kiem tra thuong xuyen
-- ======================================================================
-- Tim kiem sach theo ten, va loc theo tac gia/the loai/NXB/trang thai
CREATE NONCLUSTERED INDEX IX_Books_Title       ON Books(Title);
CREATE NONCLUSTERED INDEX IX_Books_AuthorId    ON Books(AuthorId);
CREATE NONCLUSTERED INDEX IX_Books_CategoryId  ON Books(CategoryId);
CREATE NONCLUSTERED INDEX IX_Books_PublisherId ON Books(PublisherId);
CREATE NONCLUSTERED INDEX IX_Books_Status      ON Books(Status);
GO

-- Kiem tra phieu muon: theo doc gia, trang thai, han tra (phuc vu canh bao qua han)
CREATE NONCLUSTERED INDEX IX_BorrowSlips_ReaderId       ON BorrowSlips(ReaderId);
CREATE NONCLUSTERED INDEX IX_BorrowSlips_LibrarianId    ON BorrowSlips(LibrarianId);
CREATE NONCLUSTERED INDEX IX_BorrowSlips_Status         ON BorrowSlips(Status);
CREATE NONCLUSTERED INDEX IX_BorrowSlips_DueDate        ON BorrowSlips(DueDate);
-- Chi so gop: tang toc truy van "doc gia X con dang muon/qua han sach nao?"
CREATE NONCLUSTERED INDEX IX_BorrowSlips_Reader_Status  ON BorrowSlips(ReaderId, Status);
GO

-- Chi tiet phieu muon: tra cuu theo phieu muon, theo sach, va sach chua tra
CREATE NONCLUSTERED INDEX IX_BorrowDetails_BorrowSlipId ON BorrowDetails(BorrowSlipId);
CREATE NONCLUSTERED INDEX IX_BorrowDetails_BookId       ON BorrowDetails(BookId);
CREATE NONCLUSTERED INDEX IX_BorrowDetails_ReturnDate   ON BorrowDetails(ReturnDate);
GO

-- Tra cuu ma OTP khi xac thuc quen mat khau
CREATE NONCLUSTERED INDEX IX_PasswordResetTokens_UserId  ON PasswordResetTokens(UserId);
CREATE NONCLUSTERED INDEX IX_PasswordResetTokens_OtpCode ON PasswordResetTokens(OtpCode);
GO

-- Loc nguoi dung theo vai tro (ADMIN / LIBRARIAN / READER)
CREATE NONCLUSTERED INDEX IX_Users_Role ON Users(Role);
GO

-- ======================================================================
-- SAMPLE DATA: Authors (25 rows)
-- ======================================================================
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Nguyễn Nhật Ánh', N'Nhà văn Việt Nam nổi tiếng với các tác phẩm văn học thiếu nhi và tuổi mới lớn.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Tô Hoài', N'Nhà văn hiện thực Việt Nam, tác giả nhiều tác phẩm văn học thiếu nhi kinh điển.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Nam Cao', N'Nhà văn hiện thực phê phán tiêu biểu của văn học Việt Nam giai đoạn 1930-1945.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Vũ Trọng Phụng', N'Nhà văn, nhà báo Việt Nam nổi tiếng với các tác phẩm trào phúng.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Ngô Tất Tố', N'Nhà văn, nhà báo, học giả Việt Nam đầu thế kỷ 20.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Nguyễn Du', N'Đại thi hào dân tộc, tác giả của nhiều áng thơ nổi tiếng.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Xuân Diệu', N'Nhà thơ lớn của phong trào Thơ mới Việt Nam.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Hàn Mặc Tử', N'Nhà thơ tiêu biểu của phong trào Thơ mới Việt Nam.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Nguyễn Minh Châu', N'Nhà văn quân đội, cây bút tiên phong của văn học đổi mới.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Bảo Ninh', N'Nhà văn Việt Nam, tác giả các tiểu thuyết viết về chiến tranh.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Nguyễn Huy Thiệp', N'Nhà văn Việt Nam với phong cách viết truyện ngắn độc đáo.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Dương Thu Hương', N'Nhà văn Việt Nam với nhiều tác phẩm được dịch ra nhiều thứ tiếng.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Marc Levy', N'Nhà văn Pháp nổi tiếng với các tiểu thuyết lãng mạn.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Paulo Coelho', N'Nhà văn người Brazil, tác giả nhiều tác phẩm bán chạy toàn cầu.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'J.K. Rowling', N'Nhà văn người Anh, tác giả bộ truyện giả tưởng nổi tiếng thế giới.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'George Orwell', N'Nhà văn, nhà báo người Anh, tác giả nhiều tiểu thuyết chính trị - xã hội.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Dale Carnegie', N'Tác giả người Mỹ chuyên viết sách về kỹ năng sống và giao tiếp.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Robert C. Martin', N'Kỹ sư phần mềm, tác giả nhiều sách kinh điển về lập trình.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Martin Fowler', N'Chuyên gia phần mềm, tác giả nhiều sách về kiến trúc phần mềm.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Eric Evans', N'Tác giả sách về thiết kế phần mềm hướng miền (Domain-Driven Design).');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Yuval Noah Harari', N'Nhà sử học, tác giả nhiều sách khoa học phổ thông nổi tiếng.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Haruki Murakami', N'Nhà văn Nhật Bản nổi tiếng với phong cách viết siêu thực.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Agatha Christie', N'Nhà văn người Anh, nữ hoàng truyện trinh thám thế giới.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Antoine de Saint-Exupéry', N'Nhà văn, phi công người Pháp, tác giả tác phẩm kinh điển thiếu nhi.');
INSERT INTO Authors (AuthorName, Biography) VALUES (N'Napoleon Hill', N'Tác giả người Mỹ chuyên viết sách về thành công và làm giàu.');
GO

-- ======================================================================
-- SAMPLE DATA: Categories (20 rows)
-- ======================================================================
INSERT INTO Categories (CategoryName, Description) VALUES (N'Văn học Việt Nam', N'Các tác phẩm văn học của tác giả trong nước.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Văn học nước ngoài', N'Các tác phẩm văn học dịch từ tiếng nước ngoài.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Tiểu thuyết', N'Thể loại văn xuôi hư cấu dài.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Truyện ngắn', N'Thể loại văn xuôi hư cấu ngắn.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Thơ ca', N'Các tác phẩm thơ, trường ca.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Kỹ năng sống', N'Sách phát triển kỹ năng cá nhân.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Kinh tế - Quản trị', N'Sách về kinh tế học và quản trị kinh doanh.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Công nghệ thông tin', N'Sách chuyên ngành công nghệ thông tin, lập trình.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Khoa học - Kỹ thuật', N'Sách phổ biến kiến thức khoa học kỹ thuật.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Lịch sử', N'Sách nghiên cứu và phổ biến lịch sử.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Tâm lý học', N'Sách về tâm lý học và hành vi con người.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Triết học', N'Sách nghiên cứu triết học.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Giáo trình - Tham khảo', N'Giáo trình và tài liệu tham khảo học tập.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Ngoại ngữ', N'Sách học và luyện tập ngoại ngữ.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Thiếu nhi', N'Sách dành cho lứa tuổi thiếu nhi.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Trinh thám - Hình sự', N'Tiểu thuyết trinh thám, hình sự.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Khoa học viễn tưởng', N'Tiểu thuyết khoa học viễn tưởng.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Sách self-help', N'Sách hướng dẫn phát triển bản thân.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Chính trị - Xã hội', N'Sách về các vấn đề chính trị, xã hội.');
INSERT INTO Categories (CategoryName, Description) VALUES (N'Nghệ thuật - Hội họa', N'Sách về nghệ thuật, hội họa, âm nhạc.');
GO

-- ======================================================================
-- SAMPLE DATA: Publishers (20 rows)
-- ======================================================================
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Trẻ', N'161B Lý Chính Thắng, Quận 3, TP. Hồ Chí Minh');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Kim Đồng', N'55 Quang Trung, Hai Bà Trưng, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Giáo Dục Việt Nam', N'81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Văn Học', N'18 Nguyễn Trường Tộ, Ba Đình, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Hội Nhà Văn', N'65 Nguyễn Du, Hai Bà Trưng, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Tổng Hợp TP. Hồ Chí Minh', N'62 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Lao Động', N'175 Giảng Võ, Đống Đa, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Thế Giới', N'46 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Chính Trị Quốc Gia Sự Thật', N'6/86 Duy Tân, Cầu Giấy, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Phụ Nữ Việt Nam', N'39 Hàng Chuối, Hai Bà Trưng, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Đại Học Quốc Gia Hà Nội', N'16 Hàng Chuối, Hai Bà Trưng, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Khoa Học Xã Hội', N'26 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Thanh Niên', N'64 Bà Triệu, Hoàn Kiếm, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Dân Trí', N'347 Đội Cấn, Ba Đình, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Alpha Books', N'225 Nguyễn Ngọc Nại, Thanh Xuân, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB First News - Trí Việt', N'11H Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Nhã Nam', N'59 Đỗ Quang, Cầu Giấy, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Công Thương', N'655 Phạm Văn Đồng, Bắc Từ Liêm, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Y Học', N'352 Đội Cấn, Ba Đình, Hà Nội');
INSERT INTO Publishers (PublisherName, Address) VALUES (N'NXB Xây Dựng', N'37 Lê Đại Hành, Hai Bà Trưng, Hà Nội');
GO

-- ======================================================================
-- SAMPLE DATA: Books (30 rows)
-- ======================================================================
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Mắt Biếc', 1, 1, 1, 1990, '978-604-101-001-1', 5, 5, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Cho Tôi Xin Một Vé Đi Tuổi Thơ', 1, 1, 1, 2008, '978-604-102-002-2', 6, 6, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Dế Mèn Phiêu Lưu Ký', 2, 15, 2, 1941, '978-604-103-003-3', 8, 6, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Số Đỏ', 4, 1, 4, 1936, '978-604-104-004-4', 4, 3, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Tắt Đèn', 5, 1, 4, 1937, '978-604-105-005-5', 3, 3, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Chí Phèo', 3, 4, 4, 1941, '978-604-106-006-6', 5, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Truyện Kiều', 6, 5, 4, 1820, '978-604-107-007-7', 4, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Nỗi Buồn Chiến Tranh', 10, 1, 5, 1990, '978-604-108-008-8', 3, 1, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Tuổi Thơ Dữ Dội', 2, 15, 1, 1988, '978-604-109-009-9', 4, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Hoàng Tử Bé', 24, 15, 17, 1943, '978-604-110-010-0', 10, 7, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Nhà Giả Kim', 14, 2, 16, 1988, '978-604-111-011-1', 9, 9, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Đắc Nhân Tâm', 17, 6, 15, 1936, '978-604-112-012-2', 12, 12, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Sapiens - Lược Sử Loài Người', 21, 9, 15, 2011, '978-604-113-013-3', 7, 7, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Clean Code', 18, 8, 15, 2008, '978-604-114-014-4', 6, 5, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Refactoring', 19, 8, 15, 1999, '978-604-115-015-5', 5, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Domain-Driven Design', 20, 8, 15, 2003, '978-604-116-016-6', 4, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Rừng Na Uy', 22, 2, 17, 1987, '978-604-117-017-7', 5, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Án Mạng Trên Sông Nile', 23, 16, 17, 1937, '978-604-118-018-8', 6, 3, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Harry Potter và Hòn Đá Phù Thủy', 15, 17, 17, 1997, '978-604-119-019-9', 10, 9, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'1984', 16, 19, 17, 1949, '978-604-120-020-0', 8, 5, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Nghĩ Giàu Làm Giàu', 25, 6, 15, 1937, '978-604-121-021-1', 9, 7, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Giáo Trình Lập Trình Java Căn Bản', NULL, 8, 3, 2022, '978-604-122-022-2', 15, 15, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Cơ Sở Dữ Liệu - Nguyên Lý và Ứng Dụng', NULL, 8, 3, 2021, '978-604-123-023-3', 12, 11, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Nhập Môn Công Nghệ Phần Mềm', NULL, 8, 11, 2020, '978-604-124-024-4', 10, 7, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Kỹ Năng Giao Tiếp Hiệu Quả', NULL, 6, 15, 2019, '978-604-125-025-5', 8, 6, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Tâm Lý Học Đám Đông', NULL, 11, 6, 1895, '978-604-126-026-6', 6, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Lịch Sử Việt Nam Bằng Tranh', NULL, 10, 1, 2015, '978-604-127-027-7', 10, 9, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Bí Mật Của May Mắn', 13, 2, 17, 2004, '978-604-128-028-8', 5, 4, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Người Giàu Có Nhất Thành Babylon', 25, 6, 15, 1926, '978-604-129-029-9', 8, 6, 'Available');
INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) VALUES (N'Tư Duy Nhanh Và Chậm', NULL, 11, 15, 2011, '978-604-130-030-0', 6, 6, 'Available');
GO

-- ======================================================================
-- SAMPLE DATA: Users (30 rows: 3 ADMIN, 5 LIBRARIAN, 22 READER)
-- ======================================================================
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('admin01', '$2a$10$QQ8Vh2bZnzv45PfcIrCdcAJHdIEqJej.bQ8f80YMM3t207GMHzrNf', N'Trần Đức Toàn', 'admin01@gmail.com', '0974303911', 'ADMIN', 1, '2026-04-15 02:31:11');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('admin02', '$2a$10$MGBLeV0.9bzHVwAxh6k2.TYlbHHoHG9UHKXIIezPfFK1ohaoehyQm', N'Hoàng Văn Bảo', 'admin02@gmail.com', '0943872624', 'ADMIN', 1, '2024-03-18 16:08:02');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('admin03', '$2a$10$hQsIfvkU4mBmNRhONTikarah.gGL2jFAqQhU42BOJTEvS3QFnuFta', N'Trần Xuân Hùng', 'admin03@gmail.com', '0325107991', 'ADMIN', 1, '2024-08-06 18:25:07');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('librarian01', '$2a$10$W0DWq0fiUNwE8cZ6sndcDYzqjIjszqDOhWhEN3so3OxYgF3AZu3Iq', N'Ngô Kim Thảo', 'librarian01@gmail.com', '0703158692', 'LIBRARIAN', 1, '2024-08-30 05:54:59');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('librarian02', '$2a$10$QY1wWmzAmka3p744b8VKkqLencZSDFf8J61Yx/zfSAN2cW7GfP6R7', N'Trần Văn Kiên', 'librarian02@gmail.com', '0355148465', 'LIBRARIAN', 1, '2024-10-29 20:11:07');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('librarian03', '$2a$10$U85hfj.ej4JkeiqoKRTdxTbI10q71Ha1xCw9Atmx1c.ci3.DxrzV7', N'Hoàng Hữu Toàn', 'librarian03@gmail.com', '0708895798', 'LIBRARIAN', 1, '2025-07-15 16:14:06');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('librarian04', '$2a$10$7XGhwpb6prwj1gK8CGscIFDfZCTeQ8Ob7gvVOUnNDnwyZJfNmPFs2', N'Trần Xuân Tuấn', 'librarian04@gmail.com', '0939806990', 'LIBRARIAN', 1, '2025-03-14 04:56:26');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('librarian05', '$2a$10$6T3Wi973ipfLj5f7wrD/pX.bthrjjBYKe0.e8.5CLlczfnv8s2qt6', N'Ngô Đức Dũng', 'librarian05@gmail.com', '0705185067', 'LIBRARIAN', 1, '2025-01-05 23:08:27');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader01', '$2a$10$Yb9jkMYlduWmBQjFGlQ.NBk894rXGg9OIz.JGTTmKfP1cw54m2nHM', N'Phạm Thành Bảo', 'reader01@gmail.com', '0964431351', 'READER', 1, '2026-02-19 06:44:27');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader02', '$2a$10$58lEdkk6JdhZ2OcTiSJHVnk4P7mzi/4KF3pgDLdCiFW84jX3.L8s0', N'Bùi Ngọc Thảo', 'reader02@gmail.com', '0943412328', 'READER', 1, '2024-01-03 14:52:25');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader03', '$2a$10$E6LogpOzA70GYu/4GaiQk4.PDeUnB0LcO7PT/li198f6SxYRIj1ri', N'Võ Minh Trang', 'reader03@gmail.com', '0975125674', 'READER', 1, '2025-02-14 20:01:42');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader04', '$2a$10$w6pYexd0Fo8wxT/EQqM4M6BS0TJ8hryKqwo.EIekdL3MM4VmDFpHl', N'Hoàng Quốc Kiên', 'reader04@gmail.com', '0904499727', 'READER', 1, '2024-12-19 12:06:13');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader05', '$2a$10$WKwe/Sd7g6gB7kUJ4sm2g6mZx9NewtllCyjBG/kdtcYgRMFn4EuQL', N'Hồ Văn Long', 'reader05@gmail.com', '0975623869', 'READER', 1, '2024-07-03 06:11:20');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader06', '$2a$10$g9lrO7JScyuLyBhP6vhwvNd8DpcI7m0ORFEm/OMeRx6v1T1M.0jEv', N'Hồ Kim Nga', 'reader06@gmail.com', '0965623285', 'READER', 1, '2024-10-06 05:59:27');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader07', '$2a$10$HyjYP6LbCGqfQaIabdqSAjSQgWODQBtepCWhGQ1OI85uN5cFm6DH9', N'Phạm Đức Long', 'reader07@gmail.com', '0947735158', 'READER', 1, '2025-10-22 13:03:32');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader08', '$2a$10$jpwl63MOb35d0r6z1Mo2ogvT8ILKL3MvQHqP0t2GkntNbT9cNsvOj', N'Phan Hồng Trang', 'reader08@gmail.com', '0986177115', 'READER', 1, '2024-03-08 04:35:40');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader09', '$2a$10$DXinrsAXSzISDLbw16rUvnpKGTUGKi42.41ibOs3Ok.nFcyHAambR', N'Phạm Thành Bảo', 'reader09@gmail.com', '0353689980', 'READER', 1, '2025-11-04 09:44:14');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader10', '$2a$10$tJyF3C6Jo2z1lOzCpV6uL3Nf3zKynrcqVJOYssSeNSgZWTJW/75po', N'Dương Bích Hương', 'reader10@gmail.com', '0964510762', 'READER', 1, '2025-06-29 08:22:41');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader11', '$2a$10$n75EHvkJLx7F5Yp8TH5NrKWFf44Uuvkx0rGqIqMxkgTqKSsnyQKnw', N'Lê Công Hùng', 'reader11@gmail.com', '0937177449', 'READER', 0, '2025-06-03 02:42:04');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader12', '$2a$10$br.YcRTJlMErQwTUXV4F0ue4k5den8Yv47kw1UZRgG9vNPkKUi5S3', N'Ngô Ngọc Trang', 'reader12@gmail.com', '0705281685', 'READER', 0, '2024-11-12 06:33:47');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader13', '$2a$10$KvcDoMqSREk8R85AKCgbT2OkemPGe16IO/CeSl2Ate1XKuICx8Fxv', N'Hồ Bích Thảo', 'reader13@gmail.com', '0913750606', 'READER', 1, '2024-08-29 14:03:35');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader14', '$2a$10$FtrW79XRI6ElZFZFony8gEYktGqiPv3z4xrX//viK2K3XlpNKpln5', N'Phan Công Đạt', 'reader14@gmail.com', '0960515319', 'READER', 1, '2024-12-06 04:51:26');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader15', '$2a$10$HJzuUDS4EQIeuuxET5vv4JRuyojfODX/xPhh5bk.ZPRJ5W4LosIlm', N'Võ Văn Kiên', 'reader15@gmail.com', '0356275705', 'READER', 1, '2025-03-21 09:59:46');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader16', '$2a$10$uv7QLIny900JQoJ57sQXQ3HPTmVUpcskKgZjQmLVTVrFDKFha1D/l', N'Bùi Thanh My', 'reader16@gmail.com', '0932583132', 'READER', 1, '2025-05-20 00:57:25');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader17', '$2a$10$197arSooszQvNoe7Pi5fSMGlx1fUpoYU/7/n/CLy6ebtGGk/8kBN3', N'Trần Thanh Nga', 'reader17@gmail.com', '0704736471', 'READER', 1, '2024-06-10 16:00:19');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader18', '$2a$10$kJx5jPQMyvruSZzFFERq86TRpoUymr.m8CvqO1nD8hdG9VwSfEOYC', N'Nguyễn Thành Đạt', 'reader18@gmail.com', '0934565060', 'READER', 1, '2024-07-18 13:11:56');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader19', '$2a$10$Rap9woW6rth9Yfjmcmka.o9sjkPwysSlFkKs4g9bZiiRNefGcdGM0', N'Võ Ngọc Uyên', 'reader19@gmail.com', '0325626368', 'READER', 1, '2025-04-27 02:16:03');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader20', '$2a$10$ZkpkHLdEW1WEy/XlEBmNqk6/R7iYOqU6gXBrlYWz2pLzMXR9pfAhx', N'Ngô Minh Trang', 'reader20@gmail.com', '0977120826', 'READER', 1, '2025-05-02 17:23:00');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader21', '$2a$10$HP7nUznPlvccR9T6v18bfK5uJOHZTVp4Oa.L5H6Q16H7nCygAbJF2', N'Lê Văn Trung', 'reader21@gmail.com', '0947454990', 'READER', 1, '2025-01-03 08:36:12');
INSERT INTO Users (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive, CreatedAt) VALUES ('reader22', '$2a$10$1vw5wwKRsPWyQcACm72wdf6sTjYOE1CeaIME5GfFz4dbHRldopemS', N'Nguyễn Hữu Vinh', 'reader22@gmail.com', '0971801704', 'READER', 1, '2026-02-26 04:55:50');
GO

-- ======================================================================
-- SAMPLE DATA: BorrowSlips (25 rows)
-- ======================================================================
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (30, 8, '2025-09-22 15:03:26', '2025-10-06 15:03:26', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (10, 8, '2026-03-30 06:22:35', '2026-04-13 06:22:35', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (22, 8, '2026-02-09 01:42:25', '2026-02-23 01:42:25', 'Overdue');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (29, 7, '2026-02-24 11:36:17', '2026-03-10 11:36:17', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (22, 5, '2025-11-01 13:42:23', '2025-11-15 13:42:23', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (26, 7, '2025-10-02 08:12:16', '2025-10-16 08:12:16', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (13, 7, '2025-06-30 20:28:33', '2025-07-14 20:28:33', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (22, 8, '2026-02-27 04:52:55', '2026-03-13 04:52:55', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (17, 5, '2025-11-17 23:32:45', '2025-12-01 23:32:45', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (23, 6, '2025-07-18 19:30:06', '2025-08-01 19:30:06', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (15, 4, '2025-10-16 13:43:56', '2025-10-30 13:43:56', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (28, 4, '2025-07-08 06:51:02', '2025-07-22 06:51:02', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (27, 8, '2025-09-20 17:27:15', '2025-10-04 17:27:15', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (19, 6, '2025-06-08 07:42:42', '2025-06-22 07:42:42', 'Overdue');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (12, 7, '2025-10-03 22:00:20', '2025-10-17 22:00:20', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (21, 5, '2026-03-10 11:42:34', '2026-03-24 11:42:34', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (21, 7, '2026-03-01 23:37:09', '2026-03-15 23:37:09', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (17, 6, '2026-02-18 18:06:19', '2026-03-04 18:06:19', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (24, 6, '2025-09-13 13:29:49', '2025-09-27 13:29:49', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (10, 8, '2025-09-22 05:18:46', '2025-10-06 05:18:46', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (26, 8, '2026-03-24 15:12:12', '2026-04-07 15:12:12', 'Returned');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (15, 6, '2025-09-26 13:49:46', '2025-10-10 13:49:46', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (16, 7, '2026-03-09 23:50:00', '2026-03-23 23:50:00', 'Overdue');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (19, 6, '2026-02-06 23:21:48', '2026-02-20 23:21:48', 'Borrowing');
INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (23, 5, '2025-11-28 06:09:45', '2025-12-12 06:09:45', 'Returned');
GO

-- ======================================================================
-- SAMPLE DATA: BorrowDetails (30 rows)
-- ======================================================================
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (1, 18, '2025-10-10 15:03:26', 20000, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (2, 30, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (3, 29, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (4, 18, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (5, 21, '2025-11-05 13:42:23', 0, 'Lost');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (6, 2, '2025-10-07 08:12:16', 0, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (7, 25, '2025-07-03 20:28:33', 0, 'Slightly damaged');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (8, 5, '2026-03-09 04:52:55', 0, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (9, 23, '2025-11-24 23:32:45', 0, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (10, 7, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (11, 17, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (12, 15, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (13, 12, '2025-09-24 17:27:15', 0, 'Lost');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (14, 21, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (15, 22, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (16, 30, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (17, 20, '2026-03-19 23:37:09', 20000, 'Slightly damaged');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (18, 1, '2026-02-21 18:06:19', 0, 'Lost');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (19, 18, '2025-09-29 13:29:49', 10000, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (20, 1, '2025-10-11 05:18:46', 25000, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (21, 18, '2026-04-05 15:12:12', 0, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (22, 17, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (23, 27, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (24, 23, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (25, 22, '2025-12-14 06:09:45', 10000, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (4, 30, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (4, 17, NULL, 0, NULL);
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (5, 8, '2025-11-10 13:42:23', 0, 'Lost');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (17, 9, '2026-03-15 23:37:09', 0, 'Good');
INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition) VALUES (13, 3, '2025-10-04 17:27:15', 0, 'Slightly damaged');
GO

-- ======================================================================
-- SAMPLE DATA: PasswordResetTokens (20 rows)
-- ======================================================================
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (15, '933410', '2025-10-18 14:45:20', '2025-10-18 15:00:20', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (18, '700217', '2026-04-11 23:28:49', '2026-04-11 23:43:49', 0);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (19, '180339', '2026-05-02 09:52:12', '2026-05-02 10:07:12', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (3, '489025', '2025-09-09 07:32:32', '2025-09-09 07:47:32', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (25, '614293', '2026-06-18 14:10:07', '2026-06-18 14:25:07', 0);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (18, '562185', '2025-09-28 03:33:23', '2025-09-28 03:48:23', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (27, '159996', '2026-02-15 01:04:43', '2026-02-15 01:19:43', 0);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (26, '773586', '2026-04-10 06:45:45', '2026-04-10 07:00:45', 0);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (22, '619431', '2025-10-13 09:45:23', '2025-10-13 10:00:23', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (23, '265511', '2025-09-03 11:13:25', '2025-09-03 11:28:25', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (25, '412126', '2026-04-18 20:16:45', '2026-04-18 20:31:45', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (14, '101581', '2026-02-14 14:01:33', '2026-02-14 14:16:33', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (14, '618398', '2025-11-26 13:51:43', '2025-11-26 14:06:43', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (9, '447212', '2026-04-11 10:02:50', '2026-04-11 10:17:50', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (16, '154379', '2025-12-10 16:40:12', '2025-12-10 16:55:12', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (10, '065965', '2026-04-14 12:11:14', '2026-04-14 12:26:14', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (27, '924593', '2026-05-04 11:26:20', '2026-05-04 11:41:20', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (13, '547935', '2026-03-12 10:12:19', '2026-03-12 10:27:19', 0);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (13, '519398', '2025-12-02 20:01:42', '2025-12-02 20:16:42', 1);
INSERT INTO PasswordResetTokens (UserId, OtpCode, CreatedAt, ExpiresAt, IsUsed) VALUES (24, '737416', '2026-05-14 05:04:02', '2026-05-14 05:19:02', 0);
GO

-- ======================================================================
-- VIEWS: phuc vu Bao cao & Thong ke (thay vi viet truy van phuc tap o Java)
-- ======================================================================
GO

-- vw_BookCatalog: danh muc sach kem ten tac gia / the loai / NXB,
-- phuc vu man hinh tra cuu sach (UC04) va quan ly sach (UC08)
CREATE VIEW vw_BookCatalog AS
SELECT
    b.BookId, b.Title, a.AuthorName, c.CategoryName, p.PublisherName,
    b.PublishYear, b.ISBN, b.Quantity, b.AvailableQuantity, b.Status
FROM Books b
LEFT JOIN Authors a     ON b.AuthorId = a.AuthorId
LEFT JOIN Categories c  ON b.CategoryId = c.CategoryId
LEFT JOIN Publishers p  ON b.PublisherId = p.PublisherId;
GO

-- vw_BorrowSlipDetails: chi tiet day du cua tung phieu muon,
-- phuc vu lich su muon tra (UC07) va quan ly phieu muon (UC13, UC14)
CREATE VIEW vw_BorrowSlipDetails AS
SELECT
    bs.BorrowSlipId, bs.BorrowDate, bs.DueDate, bs.Status AS SlipStatus,
    r.UserId AS ReaderId, r.FullName AS ReaderName, r.Email AS ReaderEmail,
    l.UserId AS LibrarianId, l.FullName AS LibrarianName,
    bd.BorrowDetailId, bk.BookId, bk.Title AS BookTitle,
    bd.ReturnDate, bd.FineAmount, bd.BookCondition
FROM BorrowSlips bs
JOIN Users r         ON bs.ReaderId = r.UserId
JOIN Users l         ON bs.LibrarianId = l.UserId
JOIN BorrowDetails bd ON bd.BorrowSlipId = bs.BorrowSlipId
JOIN Books bk        ON bd.BookId = bk.BookId;
GO

-- vw_OverdueBorrowDetails: cac dau sach dang qua han chua tra,
-- kem so ngay tre va tien phat uoc tinh, phuc vu UC14 va bao cao qua han
CREATE VIEW vw_OverdueBorrowDetails AS
SELECT
    bs.BorrowSlipId, bd.BorrowDetailId,
    r.FullName AS ReaderName, r.PhoneNumber, r.Email,
    bk.Title AS BookTitle, bs.DueDate,
    DATEDIFF(DAY, bs.DueDate, GETDATE())        AS OverdueDays,
    DATEDIFF(DAY, bs.DueDate, GETDATE()) * 5000 AS EstimatedFine
FROM BorrowSlips bs
JOIN BorrowDetails bd ON bd.BorrowSlipId = bs.BorrowSlipId
JOIN Users r          ON bs.ReaderId = r.UserId
JOIN Books bk         ON bd.BookId = bk.BookId
WHERE bd.ReturnDate IS NULL AND bs.DueDate < GETDATE();
GO

-- vw_TopBorrowedBooks: thong ke so lan duoc muon cua tung sach,
-- phuc vu bao cao "sach duoc muon nhieu nhat" (UC17)
CREATE VIEW vw_TopBorrowedBooks AS
SELECT
    bk.BookId, bk.Title, COUNT(bd.BorrowDetailId) AS TimesBorrowed
FROM Books bk
JOIN BorrowDetails bd ON bd.BookId = bk.BookId
GROUP BY bk.BookId, bk.Title;
GO

-- vw_LibraryStatistics: bao cao tong quan 1 dong, phuc vu trang
-- Dashboard thong ke cua Quan tri vien (UC17)
CREATE VIEW vw_LibraryStatistics AS
SELECT
    (SELECT COUNT(*) FROM Books)                                   AS TotalBooks,
    (SELECT COUNT(*) FROM Users WHERE Role = 'READER')             AS TotalReaders,
    (SELECT COUNT(*) FROM Users WHERE Role = 'LIBRARIAN')          AS TotalLibrarians,
    (SELECT COUNT(*) FROM BorrowSlips)                             AS TotalBorrowSlips,
    (SELECT COUNT(*) FROM BorrowSlips WHERE Status = 'Borrowing')  AS CurrentlyBorrowing,
    (SELECT COUNT(*) FROM BorrowSlips WHERE Status = 'Overdue')    AS OverdueSlips,
    (SELECT ISNULL(SUM(FineAmount), 0) FROM BorrowDetails)         AS TotalFineCollected;
GO

-- ======================================================================
-- STORED PROCEDURES: xu ly nghiep vu Muon sach / Tra sach
-- Dam bao tinh toan ven du lieu (Atomic Transaction): tat ca thao tac
-- (kiem tra dieu kien, tao/cap nhat phieu muon, cap nhat kho sach) hoac
-- cung thanh cong, hoac cung bi ROLLBACK neu co loi xay ra.
-- ======================================================================
GO

-- Kieu du lieu bang (Table-Valued Parameter): danh sach ma sach can muon
-- trong cung mot phieu muon (1 phieu muon co the gom nhieu dau sach).
CREATE TYPE dbo.BookIdListType AS TABLE (BookId INT NOT NULL PRIMARY KEY);
GO

-- ------------------------------------------------------------------
-- sp_BorrowBook: lap phieu muon sach (UC13)
--   - Kiem tra doc gia / thu thu hop le, tai khoan con hoat dong
--   - Tu choi neu doc gia dang co phieu qua han chua tra
--   - Tu choi neu bat ky sach nao trong danh sach da het (AvailableQuantity <= 0)
--   - Tao 1 phieu muon (BorrowSlips) + N dong chi tiet (BorrowDetails)
--   - Giam AvailableQuantity tuong ung cho tung sach
--   Toan bo duoc boc trong 1 TRANSACTION: loi o bat ky buoc nao se ROLLBACK
--   toan bo, khong de lai du lieu "nua vay" (vi du: da tao phieu nhung
--   chua kip tru kho).
-- ------------------------------------------------------------------
CREATE PROCEDURE sp_BorrowBook
    @ReaderId        INT,
    @LibrarianId      INT,
    @BookIds          dbo.BookIdListType READONLY,
    @BorrowDays       INT = 14,
    @NewBorrowSlipId  INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = @ReaderId AND Role = 'READER' AND IsActive = 1)
            THROW 50001, N'Doc gia khong hop le hoac tai khoan da bi khoa.', 1;

        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserId = @LibrarianId AND Role = 'LIBRARIAN' AND IsActive = 1)
            THROW 50002, N'Thu thu khong hop le hoac tai khoan da bi khoa.', 1;

        IF EXISTS (SELECT 1 FROM BorrowSlips WHERE ReaderId = @ReaderId AND Status = 'Overdue')
            THROW 50003, N'Doc gia dang co sach qua han chua tra, khong the muon them.', 1;

        IF NOT EXISTS (SELECT 1 FROM @BookIds)
            THROW 50004, N'Danh sach sach can muon khong duoc de trong.', 1;

        BEGIN TRANSACTION;

        -- Khoa cac dong sach lien quan de tranh tinh trang 2 giao dich cung
        -- doc duoc so luong con hang va cung muon vuot qua ton kho (race condition)
        IF EXISTS (
            SELECT 1
            FROM Books b WITH (UPDLOCK, ROWLOCK)
            JOIN @BookIds t ON t.BookId = b.BookId
            WHERE b.AvailableQuantity <= 0
        )
            THROW 50005, N'Mot hoac nhieu sach trong danh sach da het, khong the muon.', 1;

        DECLARE @BorrowDate DATETIME = GETDATE();
        DECLARE @DueDate    DATETIME = DATEADD(DAY, @BorrowDays, @BorrowDate);

        INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status)
        VALUES (@ReaderId, @LibrarianId, @BorrowDate, @DueDate, 'Borrowing');

        SET @NewBorrowSlipId = SCOPE_IDENTITY();

        INSERT INTO BorrowDetails (BorrowSlipId, BookId, ReturnDate, FineAmount, BookCondition)
        SELECT @NewBorrowSlipId, BookId, NULL, 0, NULL
        FROM @BookIds;

        UPDATE b
        SET b.AvailableQuantity = b.AvailableQuantity - 1,
            b.Status = CASE WHEN b.AvailableQuantity - 1 <= 0 THEN 'Out of stock' ELSE b.Status END
        FROM Books b
        JOIN @BookIds t ON t.BookId = b.BookId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- ------------------------------------------------------------------
-- sp_ReturnBook: ghi nhan tra sach (UC14)
--   - Kiem tra chi tiet phieu muon ton tai va chua duoc tra truoc do
--   - Tinh so ngay tre va tien phat (neu tra qua han)
--   - Cap nhat ngay tra, tien phat, tinh trang sach
--   - Hoan tra AvailableQuantity cho sach
--   - Neu tat ca dau sach trong phieu da duoc tra, chuyen phieu sang
--     trang thai 'Returned'
--   Toan bo duoc boc trong 1 TRANSACTION giong sp_BorrowBook.
-- ------------------------------------------------------------------
CREATE PROCEDURE sp_ReturnBook
    @BorrowDetailId  INT,
    @BookCondition   VARCHAR(20)   = 'Good',
    @FinePerDay      DECIMAL(10,2) = 5000
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        DECLARE @BorrowSlipId INT, @BookId INT, @DueDate DATETIME,
                @ReturnDate DATETIME = GETDATE(), @OverdueDays INT, @Fine DECIMAL(10,2);

        SELECT
            @BorrowSlipId = bd.BorrowSlipId,
            @BookId       = bd.BookId,
            @DueDate      = bs.DueDate
        FROM BorrowDetails bd
        JOIN BorrowSlips bs ON bs.BorrowSlipId = bd.BorrowSlipId
        WHERE bd.BorrowDetailId = @BorrowDetailId;

        IF @BorrowSlipId IS NULL
            THROW 50010, N'Khong tim thay chi tiet phieu muon.', 1;

        IF EXISTS (SELECT 1 FROM BorrowDetails WHERE BorrowDetailId = @BorrowDetailId AND ReturnDate IS NOT NULL)
            THROW 50011, N'Sach nay da duoc ghi nhan tra truoc do.', 1;

        SET @OverdueDays = DATEDIFF(DAY, @DueDate, @ReturnDate);
        SET @Fine = CASE WHEN @OverdueDays > 0 THEN @OverdueDays * @FinePerDay ELSE 0 END;

        BEGIN TRANSACTION;

        UPDATE BorrowDetails
        SET ReturnDate = @ReturnDate,
            FineAmount = @Fine,
            BookCondition = @BookCondition
        WHERE BorrowDetailId = @BorrowDetailId;

        UPDATE Books
        SET AvailableQuantity = AvailableQuantity + 1,
            Status = 'Available'
        WHERE BookId = @BookId;

        IF NOT EXISTS (
            SELECT 1 FROM BorrowDetails
            WHERE BorrowSlipId = @BorrowSlipId AND ReturnDate IS NULL
        )
        BEGIN
            UPDATE BorrowSlips SET Status = 'Returned' WHERE BorrowSlipId = @BorrowSlipId;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- ------------------------------------------------------------------
-- sp_UpdateOverdueStatus: cong viec dinh ky (vi du: chay hang ngay qua
-- SQL Server Agent Job) danh dau cac phieu muon da qua han tra ma van
-- con o trang thai 'Borrowing' sang 'Overdue'.
-- ------------------------------------------------------------------
CREATE PROCEDURE sp_UpdateOverdueStatus
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE BorrowSlips
    SET Status = 'Overdue'
    WHERE Status = 'Borrowing' AND DueDate < GETDATE();

    SELECT @@ROWCOUNT AS SlipsMarkedOverdue;
END
GO

-- ======================================================================
-- VI DU SU DUNG STORED PROCEDURE (bo comment de chay thu)
-- ======================================================================
/*
-- Vi du: doc gia reader01 (UserId=9) muon 2 cuon sach BookId=1 va BookId=2,
-- do thu thu librarian01 (UserId=4) lap phieu:
DECLARE @BookList dbo.BookIdListType;
INSERT INTO @BookList (BookId) VALUES (1), (2);

DECLARE @SlipId INT;
EXEC sp_BorrowBook
    @ReaderId = 9,
    @LibrarianId = 4,
    @BookIds = @BookList,
    @BorrowDays = 14,
    @NewBorrowSlipId = @SlipId OUTPUT;

SELECT @SlipId AS NewBorrowSlipId;
SELECT * FROM vw_BorrowSlipDetails WHERE BorrowSlipId = @SlipId;

-- Vi du: ghi nhan tra 1 dau sach (BorrowDetailId lay tu ket qua truy van tren)
-- EXEC sp_ReturnBook @BorrowDetailId = 1, @BookCondition = 'Good';

-- Vi du: cap nhat trang thai qua han cho toan bo phieu muon
-- EXEC sp_UpdateOverdueStatus;
*/
GO

-- ======================================================================
-- QUICK CHECK: ROW COUNT PER TABLE
-- ======================================================================
SELECT 'Users' AS TableName, COUNT(*) AS TotalRows FROM Users
UNION ALL
SELECT 'Authors' AS TableName, COUNT(*) AS TotalRows FROM Authors
UNION ALL
SELECT 'Categories' AS TableName, COUNT(*) AS TotalRows FROM Categories
UNION ALL
SELECT 'Publishers' AS TableName, COUNT(*) AS TotalRows FROM Publishers
UNION ALL
SELECT 'Books' AS TableName, COUNT(*) AS TotalRows FROM Books
UNION ALL
SELECT 'BorrowSlips' AS TableName, COUNT(*) AS TotalRows FROM BorrowSlips
UNION ALL
SELECT 'BorrowDetails' AS TableName, COUNT(*) AS TotalRows FROM BorrowDetails
UNION ALL
SELECT 'PasswordResetTokens' AS TableName, COUNT(*) AS TotalRows FROM PasswordResetTokens
;
GO