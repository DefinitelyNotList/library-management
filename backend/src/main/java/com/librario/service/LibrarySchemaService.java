package com.librario.service;

import com.librario.dto.BookUpsertRequest;
import com.librario.dto.BorrowRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LibrarySchemaService {
    private static final String BOOKS = "SELECT b.BookId,b.Title,a.AuthorName,c.CategoryName,p.PublisherName,b.PublishYear,b.ISBN,b.Quantity,b.AvailableQuantity,b.Status FROM Books b LEFT JOIN Authors a ON a.AuthorId=b.AuthorId LEFT JOIN Categories c ON c.CategoryId=b.CategoryId LEFT JOIN Publishers p ON p.PublisherId=b.PublisherId";
    private final JdbcTemplate jdbc;
    public LibrarySchemaService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<Map<String, Object>> books(String q) {
        if (q == null || q.isBlank()) return jdbc.query(BOOKS + " ORDER BY b.BookId DESC", (rs, i) -> mapBook(rs));
        String like = "%" + q.trim() + "%";
        return jdbc.query(BOOKS + " WHERE b.Title LIKE ? OR a.AuthorName LIKE ? OR b.ISBN LIKE ? ORDER BY b.BookId DESC", (rs, i) -> mapBook(rs), like, like, like);
    }
    public Map<String, Object> book(int id) {
        List<Map<String,Object>> result = jdbc.query(BOOKS + " WHERE b.BookId=?", (rs, i) -> mapBook(rs), id);
        if (result.isEmpty()) throw new IllegalArgumentException("Không tìm thấy sách có mã " + id);
        return result.getFirst();
    }
    @Transactional public Map<String,Object> create(BookUpsertRequest r) {
        validate(r);
        jdbc.update("INSERT INTO Books (Title,AuthorId,CategoryId,PublisherId,PublishYear,ISBN,Quantity,AvailableQuantity,Status) VALUES (?,?,?,?,?,?,?,?,?)", r.title().trim(), lookup("Authors","AuthorId","AuthorName",r.author()), lookup("Categories","CategoryId","CategoryName",r.genre()), lookup("Publishers","PublisherId","PublisherName",r.publisher()), r.year(), empty(r.isbn()), r.totalCopies(), r.availableCopies(), status(r));
        return book(jdbc.queryForObject("SELECT CAST(SCOPE_IDENTITY() AS INT)", Integer.class));
    }
    @Transactional public Map<String,Object> update(int id, BookUpsertRequest r) {
        book(id); validate(r);
        jdbc.update("UPDATE Books SET Title=?,AuthorId=?,CategoryId=?,PublisherId=?,PublishYear=?,ISBN=?,Quantity=?,AvailableQuantity=?,Status=? WHERE BookId=?", r.title().trim(), lookup("Authors","AuthorId","AuthorName",r.author()), lookup("Categories","CategoryId","CategoryName",r.genre()), lookup("Publishers","PublisherId","PublisherName",r.publisher()), r.year(), empty(r.isbn()), r.totalCopies(), r.availableCopies(), status(r), id);
        return book(id);
    }
    public void delete(int id) {
        try { if (jdbc.update("DELETE FROM Books WHERE BookId=?",id)==0) throw new IllegalArgumentException("Không tìm thấy sách có mã " + id); }
        catch (org.springframework.dao.DataIntegrityViolationException ex) { throw new IllegalStateException("Không thể xóa sách đã có lịch sử mượn/trả."); }
    }
    public List<Map<String,Object>> lookup(String type) {
        return switch(type) {
            case "authors" -> jdbc.queryForList("SELECT AuthorId AS id,AuthorName AS name,Biography AS description FROM Authors ORDER BY AuthorName");
            case "categories" -> jdbc.queryForList("SELECT CategoryId AS id,CategoryName AS name,Description AS description FROM Categories ORDER BY CategoryName");
            case "publishers" -> jdbc.queryForList("SELECT PublisherId AS id,PublisherName AS name,Address AS address FROM Publishers ORDER BY PublisherName");
            default -> throw new IllegalArgumentException("Loại danh mục không hợp lệ.");
        };
    }
    @Transactional public Map<String,Object> borrow(BorrowRequest r) {
        if (r.readerId()==null || r.librarianId()==null || r.bookIds()==null || r.bookIds().isEmpty()) throw new IllegalArgumentException("Cần có độc giả, thủ thư và ít nhất một sách.");
        int days=r.borrowDays()==null?14:r.borrowDays(); if(days<1||days>90) throw new IllegalArgumentException("Thời hạn mượn phải từ 1 đến 90 ngày.");
        if(!validUser(r.readerId(),"READER")||!validUser(r.librarianId(),"LIBRARIAN")) throw new IllegalArgumentException("Độc giả hoặc thủ thư không hợp lệ/đã bị khóa.");
        if(jdbc.queryForObject("SELECT COUNT(*) FROM BorrowSlips WHERE ReaderId=? AND Status='Overdue'",Integer.class,r.readerId())>0) throw new IllegalStateException("Độc giả đang có phiếu mượn quá hạn.");
        List<Integer> ids=r.bookIds().stream().distinct().toList();
        for(Integer id:ids) { Integer available=jdbc.queryForObject("SELECT AvailableQuantity FROM Books WITH (UPDLOCK,ROWLOCK) WHERE BookId=?",Integer.class,id); if(available==null||available<=0) throw new IllegalStateException("Sách mã " + id + " không còn sẵn."); }
        LocalDateTime now=LocalDateTime.now(), due=now.plusDays(days);
        jdbc.update("INSERT INTO BorrowSlips (ReaderId,LibrarianId,BorrowDate,DueDate,Status) VALUES (?,?,?,?, 'Borrowing')",r.readerId(),r.librarianId(),now,due);
        int slip=jdbc.queryForObject("SELECT CAST(SCOPE_IDENTITY() AS INT)",Integer.class);
        for(Integer id:ids) { jdbc.update("INSERT INTO BorrowDetails (BorrowSlipId,BookId) VALUES (?,?)",slip,id); jdbc.update("UPDATE Books SET AvailableQuantity=AvailableQuantity-1,Status=CASE WHEN AvailableQuantity-1=0 THEN 'Out of stock' ELSE 'Available' END WHERE BookId=?",id); }
        return Map.of("borrowSlipId",slip,"status","Borrowing","dueDate",due.toString());
    }
    @Transactional public Map<String,Object> returnBook(int detailId,String condition) {
        Map<String,Object> row=jdbc.queryForMap("SELECT bd.BorrowSlipId,bd.BookId,bs.DueDate FROM BorrowDetails bd JOIN BorrowSlips bs ON bs.BorrowSlipId=bd.BorrowSlipId WHERE bd.BorrowDetailId=? AND bd.ReturnDate IS NULL",detailId);
        String c=condition==null||condition.isBlank()?"Good":condition; if(!List.of("Good","Slightly damaged","Lost").contains(c)) throw new IllegalArgumentException("Tình trạng sách không hợp lệ.");
        LocalDateTime now=LocalDateTime.now(),due=((java.sql.Timestamp)row.get("DueDate")).toLocalDateTime(); BigDecimal fine=BigDecimal.valueOf(Math.max(0,java.time.temporal.ChronoUnit.DAYS.between(due.toLocalDate(),now.toLocalDate()))*5000L);
        jdbc.update("UPDATE BorrowDetails SET ReturnDate=?,FineAmount=?,BookCondition=? WHERE BorrowDetailId=?",now,fine,c,detailId); jdbc.update("UPDATE Books SET AvailableQuantity=AvailableQuantity+1,Status='Available' WHERE BookId=?",((Number)row.get("BookId")).intValue());
        int slip=((Number)row.get("BorrowSlipId")).intValue(); if(jdbc.queryForObject("SELECT COUNT(*) FROM BorrowDetails WHERE BorrowSlipId=? AND ReturnDate IS NULL",Integer.class,slip)==0) jdbc.update("UPDATE BorrowSlips SET Status='Returned' WHERE BorrowSlipId=?",slip);
        return Map.of("borrowDetailId",detailId,"fineAmount",fine,"returnedAt",now.toString());
    }
    public List<Map<String,Object>> history(int readerId) { return jdbc.queryForList("SELECT * FROM vw_BorrowSlipDetails WHERE ReaderId=? ORDER BY BorrowSlipId DESC,BorrowDetailId DESC",readerId); }
    public List<Map<String,Object>> overdue() { return jdbc.queryForList("SELECT * FROM vw_OverdueBorrowDetails ORDER BY DueDate"); }
    public Map<String,Object> statistics() { return jdbc.queryForMap("SELECT * FROM vw_LibraryStatistics"); }
    public Map<String,Object> updateOverdue() { jdbc.update("UPDATE BorrowSlips SET Status='Overdue' WHERE Status='Borrowing' AND DueDate<GETDATE()"); return statistics(); }
    public List<Map<String,Object>> topBooks() { return jdbc.queryForList("SELECT TOP 10 bk.BookId, bk.Title, a.AuthorName, c.CategoryName, COUNT(bd.BorrowDetailId) AS TimesBorrowed FROM Books bk LEFT JOIN BorrowDetails bd ON bd.BookId=bk.BookId LEFT JOIN Authors a ON a.AuthorId=bk.AuthorId LEFT JOIN Categories c ON c.CategoryId=bk.CategoryId GROUP BY bk.BookId, bk.Title, a.AuthorName, c.CategoryName ORDER BY TimesBorrowed DESC"); }
    public List<Map<String,Object>> allBorrows() { return jdbc.queryForList("SELECT bs.BorrowSlipId, bs.BorrowDate, bs.DueDate, bs.Status AS SlipStatus, r.UserId AS ReaderId, r.FullName AS ReaderName, r.Email AS ReaderEmail, l.FullName AS LibrarianName, bd.BorrowDetailId, bk.BookId, bk.Title AS BookTitle, bd.ReturnDate, bd.FineAmount, bd.BookCondition FROM BorrowSlips bs JOIN Users r ON bs.ReaderId=r.UserId JOIN Users l ON bs.LibrarianId=l.UserId JOIN BorrowDetails bd ON bd.BorrowSlipId=bs.BorrowSlipId JOIN Books bk ON bd.BookId=bk.BookId ORDER BY bs.BorrowSlipId DESC"); }
    private Map<String,Object> mapBook(java.sql.ResultSet rs) throws java.sql.SQLException { Map<String,Object> m=new LinkedHashMap<>(); m.put("id",rs.getInt("BookId"));m.put("title",rs.getString("Title"));m.put("author",rs.getString("AuthorName"));m.put("genre",rs.getString("CategoryName"));m.put("publisher",rs.getString("PublisherName"));m.put("year",rs.getObject("PublishYear"));m.put("isbn",rs.getString("ISBN"));m.put("totalCopies",rs.getInt("Quantity"));m.put("availableCopies",rs.getInt("AvailableQuantity"));m.put("status",rs.getString("Status"));return m; }
    private Integer lookup(String table,String id,String nameColumn,String name) { if(name==null||name.isBlank()) return null; List<Integer> ids=jdbc.query("SELECT "+id+" FROM "+table+" WHERE "+nameColumn+"=?",(rs,i)->rs.getInt(1),name.trim()); if(!ids.isEmpty())return ids.getFirst();jdbc.update("INSERT INTO "+table+" ("+nameColumn+") VALUES (?)",name.trim());return jdbc.queryForObject("SELECT CAST(SCOPE_IDENTITY() AS INT)",Integer.class); }
    private boolean validUser(int id,String role) { return jdbc.queryForObject("SELECT COUNT(*) FROM Users WHERE UserId=? AND Role=? AND IsActive=1",Integer.class,id,role)==1; }
    private void validate(BookUpsertRequest r) { if(r.title()==null||r.title().isBlank())throw new IllegalArgumentException("Tên sách là bắt buộc.");if(r.totalCopies()==null||r.availableCopies()==null||r.totalCopies()<0||r.availableCopies()<0||r.availableCopies()>r.totalCopies())throw new IllegalArgumentException("Số lượng sách không hợp lệ.");if(r.year()!=null&&(r.year()<1000||r.year()>2100))throw new IllegalArgumentException("Năm xuất bản không hợp lệ."); }
    private String status(BookUpsertRequest r) { return r.availableCopies()==0||"Out of stock".equalsIgnoreCase(r.status())||"UNAVAILABLE".equalsIgnoreCase(r.status())?"Out of stock":"Available"; }
    private String empty(String value) { return value==null||value.isBlank()?null:value.trim(); }
}
