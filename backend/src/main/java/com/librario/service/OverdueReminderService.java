package com.librario.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Gửi email nhắc nhở cho độc giả có sách sắp đến hạn trả (trước 2 ngày).
 *
 * Sử dụng JdbcTemplate để query trực tiếp bảng BorrowSlips/BorrowDetails —
 * nhất quán với LibrarySchemaService, thay vì dùng Transaction entity cũ
 * không đồng bộ với schema hiện tại.
 */
@Service
public class OverdueReminderService {

    private static final Logger log = LoggerFactory.getLogger(OverdueReminderService.class);

    private final JdbcTemplate jdbc;
    private final EmailService emailService;

    public OverdueReminderService(JdbcTemplate jdbc, EmailService emailService) {
        this.jdbc = jdbc;
        this.emailService = emailService;
    }

    /**
     * Chạy mỗi ngày lúc 8:00 sáng.
     * Tìm tất cả các BorrowDetails còn đang mượn (chưa trả) và sẽ đến hạn trong 2 ngày tới,
     * sau đó gửi email nhắc nhở cho độc giả.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendOverdueReminders() {
        List<Map<String, Object>> dueSoon = jdbc.queryForList("""
                SELECT u.Email, u.FullName, bk.Title, bs.DueDate
                FROM BorrowDetails bd
                JOIN BorrowSlips  bs ON bs.BorrowSlipId = bd.BorrowSlipId
                JOIN Books        bk ON bk.BookId = bd.BookId
                JOIN Users        u  ON u.UserId  = bs.ReaderId
                WHERE bd.ReturnDate IS NULL
                  AND bs.Status = 'Borrowing'
                  AND CAST(bs.DueDate AS DATE) = CAST(DATEADD(DAY, 2, GETDATE()) AS DATE)
                """);

        for (Map<String, Object> row : dueSoon) {
            String email     = (String) row.get("Email");
            String name      = (String) row.get("FullName");
            String bookTitle = (String) row.get("Title");
            String dueDate   = String.valueOf(row.get("DueDate"));

            try {
                emailService.sendOverdueReminderEmail(email, name, bookTitle, dueDate);
            } catch (Exception e) {
                log.warn("Không thể gửi email nhắc nhở đến {}: {}", email, e.getMessage());
            }
        }

        log.info("Đã xử lý {} email nhắc trả sách.", dueSoon.size());
    }
}
