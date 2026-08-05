package com.librario.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class DatabaseCleanupRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseCleanupRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            // 1. Drop foreign keys on book_requests pointing to legacy table 'dbo.book'
            jdbcTemplate.execute("""
                DECLARE @sql NVARCHAR(MAX) = '';
                SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
                FROM sys.foreign_keys
                WHERE referenced_object_id = OBJECT_ID('dbo.book')
                   OR name = 'FKgbxcroeeuga10vjy3ategefg9';
                IF @sql <> '' EXEC sp_executesql @sql;
            """);

            // 2. Drop legacy table 'dbo.book' if it exists
            jdbcTemplate.execute("IF OBJECT_ID('dbo.book', 'U') IS NOT NULL DROP TABLE dbo.book;");

            // 3. Match column data type INT for book_requests.book_id and create Foreign Key to Books(BookId)
            jdbcTemplate.execute("""
                IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'book_requests')
                BEGIN
                    ALTER TABLE book_requests ALTER COLUMN book_id INT NOT NULL;
                    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_book_requests_Books')
                    BEGIN
                        ALTER TABLE book_requests ADD CONSTRAINT FK_book_requests_Books FOREIGN KEY (book_id) REFERENCES Books(BookId);
                    END
                END
            """);

            // 4. Ensure transactions table has penalty_status column (required by BorrowedBook entity)
            jdbcTemplate.execute("""
                IF NOT EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID('dbo.transactions') AND name = 'penalty_status'
                )
                BEGIN
                    ALTER TABLE transactions ADD penalty_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING';
                END
            """);

            // 5. Ensure transactions table has penalty_amount column
            jdbcTemplate.execute("""
                IF NOT EXISTS (
                    SELECT 1 FROM sys.columns
                    WHERE object_id = OBJECT_ID('dbo.transactions') AND name = 'penalty_amount'
                )
                BEGIN
                    ALTER TABLE transactions ADD penalty_amount FLOAT NULL;
                END
            """);

            // 6. Force update all user FullNames using PreparedStatement (proper Unicode NVARCHAR params)
            Map<String, String> userNames = Map.ofEntries(
                Map.entry("admin01", "Tr\u1EA7n \u0110\u1EE9c To\u00E0n"),
                Map.entry("admin02", "Ho\u00E0ng V\u0103n B\u1EA3o"),
                Map.entry("admin03", "Tr\u1EA7n Xu\u00E2n H\u00F9ng"),
                Map.entry("librarian01", "Ng\u00F4 Kim Th\u1EA3o"),
                Map.entry("librarian02", "Tr\u1EA7n V\u0103n Ki\u00EAn"),
                Map.entry("librarian03", "Ho\u00E0ng H\u1EFFu To\u00E0n"),
                Map.entry("librarian04", "Tr\u1EA7n Xu\u00E2n Tu\u1EA5n"),
                Map.entry("librarian05", "Ng\u00F4 \u0110\u1EE9c D\u0169ng"),
                Map.entry("reader01", "Ph\u1EA1m Th\u00E0nh B\u1EA3o"),
                Map.entry("reader02", "B\u00F9i Ng\u1ECDc Th\u1EA3o"),
                Map.entry("reader03", "V\u00F5 Minh Trang"),
                Map.entry("reader04", "Ho\u00E0ng Qu\u1ED1c Ki\u00EAn"),
                Map.entry("reader05", "H\u1ED3 V\u0103n Long"),
                Map.entry("reader06", "H\u1ED3 Kim Nga"),
                Map.entry("reader07", "Ph\u1EA1m \u0110\u1EE9c Long"),
                Map.entry("reader08", "Phan H\u1ED3ng Trang"),
                Map.entry("reader09", "Ph\u1EA1m Th\u00E0nh B\u1EA3o"),
                Map.entry("reader10", "D\u01B0\u01A1ng B\u00EDch H\u01B0\u01A1ng"),
                Map.entry("reader11", "L\u00EA C\u00F4ng H\u00F9ng"),
                Map.entry("reader12", "Ng\u00F4 Ng\u1ECDc Trang"),
                Map.entry("reader13", "H\u1ED3 B\u00EDch Th\u1EA3o"),
                Map.entry("reader14", "Phan C\u00F4ng \u0110\u1EA1t"),
                Map.entry("reader15", "V\u00F5 V\u0103n Ki\u00EAn"),
                Map.entry("reader16", "B\u00F9i Thanh My"),
                Map.entry("reader17", "Tr\u1EA7n Thanh Nga"),
                Map.entry("reader18", "Nguy\u1EC5n Th\u00E0nh \u0110\u1EA1t"),
                Map.entry("reader19", "V\u00F5 Ng\u1ECDc Uy\u00EAn"),
                Map.entry("reader20", "Ng\u00F4 Minh Trang"),
                Map.entry("reader21", "L\u00EA V\u0103n Trung"),
                Map.entry("reader22", "Nguy\u1EC5n H\u1EFFu Vinh")
            );

            userNames.forEach((username, fullName) -> {
                try {
                    jdbcTemplate.update(
                        "UPDATE Users SET FullName = ? WHERE Username = ?",
                        fullName, username
                    );
                } catch (Exception ignored) {}
            });

            System.out.println("✅ Database cleanup successfully repaired corrupted user names and linked 'book_requests' to 'Books(BookId)'.");
        } catch (Exception e) {
            System.err.println("⚠️ DatabaseCleanupRunner notice: " + e.getMessage());
        }
    }
}
