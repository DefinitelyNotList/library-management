package com.librario.service;

import com.librario.dto.BookUpsertRequest;
import com.librario.dto.BorrowRequest;
import com.librario.model.Book;
import com.librario.model.Member;
import com.librario.model.Transaction;
import com.librario.repository.BookRepository;
import com.librario.repository.MemberRepository;
import com.librario.repository.TransactionRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LibrarySchemaService {

    // ──────────────────────────────────────────────
    // SQL Constants — all queries use actual MySQL tables
    // ──────────────────────────────────────────────

    private static final String SELECT_BOOKS =
            "SELECT b.BookId, b.Title, a.AuthorName, c.CategoryName, p.PublisherName, " +
            "b.PublishYear, b.ISBN, b.Quantity, b.AvailableQuantity, b.Status " +
            "FROM Books b " +
            "LEFT JOIN Authors    a ON a.AuthorId    = b.AuthorId " +
            "LEFT JOIN Categories c ON c.CategoryId  = b.CategoryId " +
            "LEFT JOIN Publishers p ON p.PublisherId  = b.PublisherId";

    private final JdbcTemplate jdbc;
    private final TransactionRepository transactionRepo;
    private final MemberRepository memberRepo;
    private final BookRepository bookRepo;

    public LibrarySchemaService(JdbcTemplate jdbc,
                                TransactionRepository transactionRepo,
                                MemberRepository memberRepo,
                                BookRepository bookRepo) {
        this.jdbc = jdbc;
        this.transactionRepo = transactionRepo;
        this.memberRepo = memberRepo;
        this.bookRepo = bookRepo;
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
        return result.get(0);
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
        int newId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
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
    // Borrow — uses TransactionRepository (bảng `transactions`)
    // ──────────────────────────────────────────────

    @Transactional
    public Map<String, Object> borrow(BorrowRequest r) {
        if (r.readerId() == null || r.bookIds() == null || r.bookIds().isEmpty()) {
            throw new IllegalArgumentException("Cần có độc giả và ít nhất một sách.");
        }

        int days = (r.borrowDays() == null) ? 14 : r.borrowDays();
        if (days < 1 || days > 90) {
            throw new IllegalArgumentException("Thời hạn mượn phải từ 1 đến 90 ngày.");
        }

        // Validate member exists (check by userId or memberId)
        Member member = memberRepo.findByUserId(r.readerId().longValue());
        if (member == null) {
            member = memberRepo.findById(r.readerId().longValue()).orElse(null);
        }
        if (member == null) {
            throw new IllegalArgumentException("Độc giả không tồn tại hoặc chưa có hội viên: " + r.readerId());
        }

        List<Integer> ids = r.bookIds().stream().distinct().toList();
        if (ids.size() > 5) {
            throw new IllegalArgumentException("Mỗi phiếu mượn tối đa 5 quyển sách.");
        }

        // Check if member already has overdue borrows
        long overdueCount = transactionRepo.findByMemberId(member.getId())
                .stream()
                .filter(t -> "BORROWED".equals(t.getStatus()) && t.getDueDate().isBefore(LocalDate.now()))
                .count();
        if (overdueCount > 0) {
            throw new IllegalStateException("Độc giả đang có sách mượn quá hạn.");
        }

        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = issueDate.plusDays(days);

        // Issue each book
        for (Integer bookId : ids) {
            Book book = bookRepo.findById(bookId.longValue())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sách mã " + bookId));

            if (book.getAvailableCopies() <= 0) {
                throw new IllegalStateException("Sách \"" + book.getTitle() + "\" không còn sẵn.");
            }

            // Check for duplicate active borrow
            if (transactionRepo.existsByMemberIdAndBookIdAndStatus(member.getId(), bookId.longValue(), "BORROWED")) {
                throw new IllegalStateException("Thành viên đã mượn sách \"" + book.getTitle() + "\" và chưa trả.");
            }

            Transaction transaction = new Transaction();
            transaction.setMember(member);
            transaction.setBook(book);
            transaction.setIssueDate(issueDate);
            transaction.setDueDate(dueDate);
            transaction.setStatus("BORROWED");

            // Decrease available copies
            book.setAvailableCopies(book.getAvailableCopies() - 1);
            if (book.getAvailableCopies() == 0) {
                book.setStatus("Out of stock");
            } else {
                book.setStatus("Available");
            }
            bookRepo.save(book);
            transactionRepo.save(transaction);
        }

        return Map.of(
                "memberId", member.getId(),
                "bookCount", ids.size(),
                "status", "BORROWED",
                "issueDate", issueDate.toString(),
                "dueDate", dueDate.toString()
        );
    }

    // ──────────────────────────────────────────────
    // Return — uses TransactionRepository (bảng `transactions`)
    // ──────────────────────────────────────────────

    @Transactional
    public Map<String, Object> returnBook(int transactionId, String condition) {
        Transaction transaction = transactionRepo.findById((long) transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch mã " + transactionId));

        if (!"BORROWED".equals(transaction.getStatus()) && !"RENEWED".equals(transaction.getStatus())) {
            throw new IllegalStateException("Giao dịch này không ở trạng thái mượn.");
        }

        String bookCondition = (condition == null || condition.isBlank()) ? "GOOD" : condition.toUpperCase();

        LocalDate returnDate = LocalDate.now();
        transaction.setReturnDate(returnDate);
        transaction.setStatus("RETURNED");
        transaction.setBookConditionOnReturn(bookCondition);

        // Calculate overdue fine (5,000 VND/day)
        int overdueFine = 0;
        if (returnDate.isAfter(transaction.getDueDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(transaction.getDueDate(), returnDate);
            overdueFine = (int) (overdueDays * 5_000L);
        }
        transaction.setFine(overdueFine);

        // Increase available copies
        Book book = transaction.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus("Available");
        bookRepo.save(book);

        transactionRepo.save(transaction);

        return Map.of(
                "transactionId", transactionId,
                "returnDate", returnDate.toString(),
                "bookCondition", bookCondition,
                "fine", overdueFine,
                "status", "RETURNED"
        );
    }

    // ──────────────────────────────────────────────
    // Queries / Statistics — using bảng `transactions`, `members`, `Books`, `Users`
    // ──────────────────────────────────────────────

    /**
     * Lịch sử mượn sách theo readerId (UserId hoặc memberId).
     */
    public List<Map<String, Object>> history(int readerId) {
        // Try by member.id first, then by user.id via join
        String sql =
            "SELECT t.id AS transactionId, " +
            "       b.BookId, b.Title AS bookTitle, " +
            "       a.AuthorName, " +
            "       t.issue_date AS issueDate, " +
            "       t.due_date AS dueDate, " +
            "       t.return_date AS returnDate, " +
            "       t.status, " +
            "       t.fine, " +
            "       t.penalty_status AS penaltyStatus " +
            "FROM transactions t " +
            "JOIN members m ON m.id = t.member_id " +
            "JOIN Books b ON b.BookId = t.book_id " +
            "LEFT JOIN Authors a ON a.AuthorId = b.AuthorId " +
            "WHERE m.id = ? OR m.user_id = ? " +
            "ORDER BY t.id DESC";
        return jdbc.queryForList(sql, readerId, readerId);
    }

    /**
     * Danh sách sách đang mượn quá hạn.
     */
    public List<Map<String, Object>> overdue() {
        String sql =
            "SELECT t.id AS transactionId, " +
            "       u.UserId, u.FullName AS memberName, u.Email AS memberEmail, " +
            "       b.BookId, b.Title AS bookTitle, " +
            "       t.issue_date AS issueDate, " +
            "       t.due_date AS dueDate, " +
            "       DATEDIFF(CURDATE(), t.due_date) AS overdueDays " +
            "FROM transactions t " +
            "JOIN members m ON m.id = t.member_id " +
            "JOIN Users u ON u.UserId = m.user_id " +
            "JOIN Books b ON b.BookId = t.book_id " +
            "WHERE t.status = 'BORROWED' AND t.due_date < CURDATE() " +
            "ORDER BY t.due_date ASC";
        return jdbc.queryForList(sql);
    }

    /**
     * Thống kê thư viện tổng hợp.
     */
    public Map<String, Object> statistics() {
        String sql =
            "SELECT " +
            "  (SELECT COUNT(*) FROM Books) AS totalBooks, " +
            "  (SELECT SUM(AvailableQuantity) FROM Books) AS availableBooks, " +
            "  (SELECT COUNT(*) FROM members WHERE status = 'ACTIVE') AS activeMembers, " +
            "  (SELECT COUNT(*) FROM transactions WHERE status = 'BORROWED') AS currentlyBorrowed, " +
            "  (SELECT COUNT(*) FROM transactions WHERE status = 'BORROWED' AND due_date < CURDATE()) AS overdueCount, " +
            "  (SELECT COUNT(*) FROM transactions) AS totalTransactions, " +
            "  (SELECT COALESCE(SUM(fine), 0) FROM transactions WHERE status = 'RETURNED') AS totalFinesCollected";
        return jdbc.queryForMap(sql);
    }

    /**
     * Cập nhật trạng thái quá hạn trong bảng transactions.
     */
    @Transactional
    public Map<String, Object> updateOverdue() {
        // Update penalty status for overdue transactions that are still BORROWED
        jdbc.update(
            "UPDATE transactions SET penalty_status = 'PENDING' " +
            "WHERE status = 'BORROWED' AND due_date < CURDATE() AND (penalty_status IS NULL OR penalty_status = 'PENDING')"
        );
        return statistics();
    }

    /**
     * Toàn bộ lịch sử mượn/trả (dành cho admin/librarian).
     */
    public List<Map<String, Object>> allBorrows() {
        String sql =
            "SELECT t.id AS transactionId, " +
            "       m.id AS memberId, " +
            "       u.UserId, u.FullName AS memberName, u.Email AS memberEmail, " +
            "       b.BookId, b.Title AS bookTitle, " +
            "       a.AuthorName, " +
            "       t.issue_date AS issueDate, " +
            "       t.due_date AS dueDate, " +
            "       t.return_date AS returnDate, " +
            "       t.status, " +
            "       t.fine, " +
            "       t.damage_penalty AS damagePenalty, " +
            "       t.book_condition_on_return AS bookCondition, " +
            "       t.penalty_status AS penaltyStatus " +
            "FROM transactions t " +
            "JOIN members m ON m.id = t.member_id " +
            "JOIN Users u ON u.UserId = m.user_id " +
            "JOIN Books b ON b.BookId = t.book_id " +
            "LEFT JOIN Authors a ON a.AuthorId = b.AuthorId " +
            "ORDER BY t.id DESC";
        return jdbc.queryForList(sql);
    }

    /**
     * Top 10 sách được mượn nhiều nhất.
     */
    public List<Map<String, Object>> topBooks() {
        return jdbc.queryForList(
                "SELECT b.BookId, b.Title, a.AuthorName, c.CategoryName, " +
                "COUNT(t.id) AS timesBorrowed " +
                "FROM Books b " +
                "LEFT JOIN transactions t ON t.book_id = b.BookId " +
                "LEFT JOIN Authors       a ON a.AuthorId    = b.AuthorId " +
                "LEFT JOIN Categories    c ON c.CategoryId  = b.CategoryId " +
                "GROUP BY b.BookId, b.Title, a.AuthorName, c.CategoryName " +
                "ORDER BY timesBorrowed DESC LIMIT 10"
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
        if (!ids.isEmpty()) return ids.get(0);

        jdbc.update("INSERT INTO " + table + " (" + nameColumn + ") VALUES (?)", name.trim());
        return jdbc.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
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
