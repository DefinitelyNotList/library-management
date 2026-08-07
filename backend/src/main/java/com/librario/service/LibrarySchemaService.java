package com.librario.service;

import com.librario.dto.BookUpsertRequest;
import com.librario.dto.BorrowRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LibrarySchemaService {

    // ──────────────────────────────────────────────
    // SQL Constants
    // ──────────────────────────────────────────────

    private static final String SELECT_BOOKS =
            "SELECT b.BookId, b.Title, a.AuthorName, c.CategoryName, p.PublisherName, " +
            "b.PublishYear, b.ISBN, b.Quantity, b.AvailableQuantity, b.Status " +
            "FROM Books b " +
            "LEFT JOIN Authors    a ON a.AuthorId    = b.AuthorId " +
            "LEFT JOIN Categories c ON c.CategoryId  = b.CategoryId " +
            "LEFT JOIN Publishers p ON p.PublisherId  = b.PublisherId";

    private final JdbcTemplate jdbc;

    public LibrarySchemaService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ──────────────────────────────────────────────
    // Book CRUD
    // ──────────────────────────────────────────────

    public List<Map<String, Object>> books(String q) {
        if (q == null || q.isBlank()) {
            return jdbc.query(SELECT_BOOKS + " ORDER BY b.BookId DESC",
                    (rs, i) -> mapBook(rs));
        }
        String like = "%" + q.trim() + "%";
        return jdbc.query(
                SELECT_BOOKS + " WHERE b.Title LIKE ? OR a.AuthorName LIKE ? OR b.ISBN LIKE ? ORDER BY b.BookId DESC",
                (rs, i) -> mapBook(rs),
                like, like, like
        );
    }

    public Map<String, Object> book(int id) {
        List<Map<String, Object>> result = jdbc.query(
                SELECT_BOOKS + " WHERE b.BookId = ?",
                (rs, i) -> mapBook(rs),
                id
        );
        if (result.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy sách có mã " + id);
        }
        return result.getFirst();
    }

    @Transactional
    public Map<String, Object> create(BookUpsertRequest r) {
        validate(r);
        jdbc.update(
                "INSERT INTO Books (Title, AuthorId, CategoryId, PublisherId, PublishYear, ISBN, Quantity, AvailableQuantity, Status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                r.title().trim(),
                lookup("Authors",    "AuthorId",    "AuthorName",    r.author()),
                lookup("Categories", "CategoryId",  "CategoryName",  r.genre()),
                lookup("Publishers", "PublisherId", "PublisherName", r.publisher()),
                r.year(),
                empty(r.isbn()),
                r.totalCopies(),
                r.availableCopies(),
                status(r)
        );
        int newId = jdbc.queryForObject("SELECT CAST(SCOPE_IDENTITY() AS INT)", Integer.class);
        return book(newId);
    }

    @Transactional
    public Map<String, Object> update(int id, BookUpsertRequest r) {
        book(id); // verify exists
        validate(r);
        jdbc.update(
                "UPDATE Books SET Title = ?, AuthorId = ?, CategoryId = ?, PublisherId = ?, " +
                "PublishYear = ?, ISBN = ?, Quantity = ?, AvailableQuantity = ?, Status = ? " +
                "WHERE BookId = ?",
                r.title().trim(),
                lookup("Authors",    "AuthorId",    "AuthorName",    r.author()),
                lookup("Categories", "CategoryId",  "CategoryName",  r.genre()),
                lookup("Publishers", "PublisherId", "PublisherName", r.publisher()),
                r.year(),
                empty(r.isbn()),
                r.totalCopies(),
                r.availableCopies(),
                status(r),
                id
        );
        return book(id);
    }

    public void delete(int id) {
        try {
            int rows = jdbc.update("DELETE FROM Books WHERE BookId = ?", id);
            if (rows == 0) {
                throw new IllegalArgumentException("Không tìm thấy sách có mã " + id);
            }
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new IllegalStateException("Không thể xóa sách đã có lịch sử mượn/trả.");
        }
    }

    // ──────────────────────────────────────────────
    // Lookup helpers (authors / categories / publishers)
    // ──────────────────────────────────────────────

    public List<Map<String, Object>> lookup(String type) {
        return switch (type) {
            case "authors"    -> jdbc.queryForList(
                    "SELECT AuthorId AS id, AuthorName AS name, Biography AS description FROM Authors ORDER BY AuthorName");
            case "categories" -> jdbc.queryForList(
                    "SELECT CategoryId AS id, CategoryName AS name, Description AS description FROM Categories ORDER BY CategoryName");
            case "publishers" -> jdbc.queryForList(
                    "SELECT PublisherId AS id, PublisherName AS name, Address AS address FROM Publishers ORDER BY PublisherName");
            default -> throw new IllegalArgumentException("Loại danh mục không hợp lệ.");
        };
    }

    // ──────────────────────────────────────────────
    // Borrow / Return
    // ──────────────────────────────────────────────

    @Transactional
    public Map<String, Object> borrow(BorrowRequest r) {
        if (r.readerId() == null || r.librarianId() == null
                || r.bookIds() == null || r.bookIds().isEmpty()) {
            throw new IllegalArgumentException("Cần có độc giả, thủ thư và ít nhất một sách.");
        }

        int days = (r.borrowDays() == null) ? 14 : r.borrowDays();
        if (days < 1 || days > 90) {
            throw new IllegalArgumentException("Thời hạn mượn phải từ 1 đến 90 ngày.");
        }

        if (!validUser(r.readerId(), "READER") || !validUser(r.librarianId(), "LIBRARIAN")) {
            throw new IllegalArgumentException("Độc giả hoặc thủ thư không hợp lệ/đã bị khóa.");
        }

        int overdueCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM BorrowSlips WHERE ReaderId = ? AND Status = 'Overdue'",
                Integer.class, r.readerId());
        if (overdueCount > 0) {
            throw new IllegalStateException("Độc giả đang có phiếu mượn quá hạn.");
        }

        List<Integer> ids = r.bookIds().stream().distinct().toList();
        if (ids.size() > 5) {
            throw new IllegalArgumentException("Mỗi phiếu mượn tối đa 5 quyển sách.");
        }

        for (Integer bookId : ids) {
            Integer available = jdbc.queryForObject(
                    "SELECT AvailableQuantity FROM Books WITH (UPDLOCK, ROWLOCK) WHERE BookId = ?",
                    Integer.class, bookId);
            if (available == null || available <= 0) {
                throw new IllegalStateException("Sách mã " + bookId + " không còn sẵn.");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime due = now.plusDays(days);

        jdbc.update(
                "INSERT INTO BorrowSlips (ReaderId, LibrarianId, BorrowDate, DueDate, Status) VALUES (?, ?, ?, ?, 'Borrowing')",
                r.readerId(), r.librarianId(), now, due
        );
        int slip = jdbc.queryForObject("SELECT CAST(SCOPE_IDENTITY() AS INT)", Integer.class);

        for (Integer bookId : ids) {
            jdbc.update("INSERT INTO BorrowDetails (BorrowSlipId, BookId) VALUES (?, ?)", slip, bookId);
            jdbc.update(
                    "UPDATE Books SET AvailableQuantity = AvailableQuantity - 1, " +
                    "Status = CASE WHEN AvailableQuantity - 1 = 0 THEN 'Out of stock' ELSE 'Available' END " +
                    "WHERE BookId = ?",
                    bookId
            );
        }

        return Map.of("borrowSlipId", slip, "status", "Borrowing", "dueDate", due.toString());
    }

    @Transactional
    public Map<String, Object> returnBook(int detailId, String condition) {
        Map<String, Object> row = jdbc.queryForMap(
                "SELECT bd.BorrowSlipId, bd.BookId, bs.DueDate " +
                "FROM BorrowDetails bd " +
                "JOIN BorrowSlips bs ON bs.BorrowSlipId = bd.BorrowSlipId " +
                "WHERE bd.BorrowDetailId = ? AND bd.ReturnDate IS NULL",
                detailId
        );

        String bookCondition = (condition == null || condition.isBlank()) ? "Good" : condition;
        if (!List.of("Good", "Slightly damaged", "Lost").contains(bookCondition)) {
            throw new IllegalArgumentException("Tình trạng sách không hợp lệ.");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime due = ((java.sql.Timestamp) row.get("DueDate")).toLocalDateTime();
        long overdueDays = Math.max(0, ChronoUnit.DAYS.between(due.toLocalDate(), now.toLocalDate()));
        BigDecimal fine = BigDecimal.valueOf(overdueDays * 5_000L);

        jdbc.update(
                "UPDATE BorrowDetails SET ReturnDate = ?, FineAmount = ?, BookCondition = ? WHERE BorrowDetailId = ?",
                now, fine, bookCondition, detailId
        );

        int bookId = ((Number) row.get("BookId")).intValue();
        jdbc.update("UPDATE Books SET AvailableQuantity = AvailableQuantity + 1, Status = 'Available' WHERE BookId = ?", bookId);

        int slip = ((Number) row.get("BorrowSlipId")).intValue();
        int remaining = jdbc.queryForObject(
                "SELECT COUNT(*) FROM BorrowDetails WHERE BorrowSlipId = ? AND ReturnDate IS NULL",
                Integer.class, slip);
        if (remaining == 0) {
            jdbc.update("UPDATE BorrowSlips SET Status = 'Returned' WHERE BorrowSlipId = ?", slip);
        }

        return Map.of("borrowDetailId", detailId, "fineAmount", fine, "returnedAt", now.toString());
    }

    // ──────────────────────────────────────────────
    // Queries / Statistics
    // ──────────────────────────────────────────────

    public List<Map<String, Object>> history(int readerId) {
        return jdbc.queryForList(
                "SELECT * FROM vw_BorrowSlipDetails WHERE ReaderId = ? ORDER BY BorrowSlipId DESC, BorrowDetailId DESC",
                readerId
        );
    }

    public List<Map<String, Object>> overdue() {
        return jdbc.queryForList("SELECT * FROM vw_OverdueBorrowDetails ORDER BY DueDate");
    }

    public Map<String, Object> statistics() {
        return jdbc.queryForMap("SELECT * FROM vw_LibraryStatistics");
    }

    public Map<String, Object> updateOverdue() {
        jdbc.update("UPDATE BorrowSlips SET Status = 'Overdue' WHERE Status = 'Borrowing' AND DueDate < GETDATE()");
        return statistics();
    }

    public List<Map<String, Object>> topBooks() {
        return jdbc.queryForList(
                "SELECT TOP 10 bk.BookId, bk.Title, a.AuthorName, c.CategoryName, " +
                "COUNT(bd.BorrowDetailId) AS TimesBorrowed " +
                "FROM Books bk " +
                "LEFT JOIN BorrowDetails bd ON bd.BookId = bk.BookId " +
                "LEFT JOIN Authors       a  ON a.AuthorId = bk.AuthorId " +
                "LEFT JOIN Categories    c  ON c.CategoryId = bk.CategoryId " +
                "GROUP BY bk.BookId, bk.Title, a.AuthorName, c.CategoryName " +
                "ORDER BY TimesBorrowed DESC"
        );
    }

    public List<Map<String, Object>> allBorrows() {
        return jdbc.queryForList(
                "SELECT bs.BorrowSlipId, bs.BorrowDate, bs.DueDate, bs.Status AS SlipStatus, " +
                "r.UserId AS ReaderId, r.FullName AS ReaderName, r.Email AS ReaderEmail, " +
                "l.FullName AS LibrarianName, " +
                "bd.BorrowDetailId, bk.BookId, bk.Title AS BookTitle, " +
                "bd.ReturnDate, bd.FineAmount, bd.BookCondition " +
                "FROM BorrowSlips bs " +
                "JOIN Users r  ON bs.ReaderId    = r.UserId " +
                "JOIN Users l  ON bs.LibrarianId  = l.UserId " +
                "JOIN BorrowDetails bd ON bd.BorrowSlipId = bs.BorrowSlipId " +
                "JOIN Books bk ON bd.BookId = bk.BookId " +
                "ORDER BY bs.BorrowSlipId DESC"
        );
    }

    // ──────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────

    private Map<String, Object> mapBook(ResultSet rs) throws SQLException {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",              rs.getInt("BookId"));
        m.put("title",           rs.getString("Title"));
        m.put("author",          rs.getString("AuthorName"));
        m.put("genre",           rs.getString("CategoryName"));
        m.put("publisher",       rs.getString("PublisherName"));
        m.put("year",            rs.getObject("PublishYear"));
        m.put("isbn",            rs.getString("ISBN"));
        m.put("totalCopies",     rs.getInt("Quantity"));
        m.put("availableCopies", rs.getInt("AvailableQuantity"));
        m.put("status",          rs.getString("Status"));
        return m;
    }

    /**
     * Tìm ID theo tên trong bảng tham chiếu. Nếu chưa có, tự động INSERT.
     */
    private Integer lookup(String table, String idColumn, String nameColumn, String name) {
        if (name == null || name.isBlank()) return null;

        List<Integer> ids = jdbc.query(
                "SELECT " + idColumn + " FROM " + table + " WHERE " + nameColumn + " = ?",
                (rs, i) -> rs.getInt(1),
                name.trim()
        );
        if (!ids.isEmpty()) return ids.getFirst();

        jdbc.update("INSERT INTO " + table + " (" + nameColumn + ") VALUES (?)", name.trim());
        return jdbc.queryForObject("SELECT CAST(SCOPE_IDENTITY() AS INT)", Integer.class);
    }

    private boolean validUser(int id, String role) {
        if ("READER".equalsIgnoreCase(role)) {
            return jdbc.queryForObject(
                    "SELECT COUNT(*) FROM Users WHERE UserId = ? AND (Role = 'READER' OR Role = 'MEMBER') AND IsActive = 1",
                    Integer.class, id) >= 1;
        }
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM Users WHERE UserId = ? AND Role = ? AND IsActive = 1",
                Integer.class, id, role) == 1;
    }

    private void validate(BookUpsertRequest r) {
        if (r.title() == null || r.title().isBlank()) {
            throw new IllegalArgumentException("Tên sách là bắt buộc.");
        }
        if (r.totalCopies() == null || r.availableCopies() == null
                || r.totalCopies() < 0 || r.availableCopies() < 0
                || r.availableCopies() > r.totalCopies()) {
            throw new IllegalArgumentException("Số lượng sách không hợp lệ.");
        }
        if (r.year() != null && (r.year() < 1000 || r.year() > 2100)) {
            throw new IllegalArgumentException("Năm xuất bản không hợp lệ.");
        }
    }

    private String status(BookUpsertRequest r) {
        boolean outOfStock = r.availableCopies() == 0
                || "Out of stock".equalsIgnoreCase(r.status())
                || "UNAVAILABLE".equalsIgnoreCase(r.status());
        return outOfStock ? "Out of stock" : "Available";
    }

    private String empty(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
