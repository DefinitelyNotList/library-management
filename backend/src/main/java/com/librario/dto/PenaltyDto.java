package com.librario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PenaltyDto {
    private Long borrowedBookId;
    private Long bookId;
    private String title;
    private String author;
    private LocalDate dueDate;
    private long daysOverdue;



    private BigDecimal perDay;
    private BigDecimal amount;
    private String status; // UNPAID / PAID

    // Constructor, getters & setters
    public PenaltyDto(Long borrowedBookId, Long bookId, String title, String author,
                      LocalDate dueDate, long daysOverdue, BigDecimal perDay, BigDecimal amount, String status) {
        this.borrowedBookId = borrowedBookId;
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.dueDate = dueDate;
        this.daysOverdue = daysOverdue;
        this.perDay = perDay;
        this.amount = amount;
        this.status = status;
    }


    public Long getBookId() {
        return bookId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getTitle() {
        return title;
    }

    public BigDecimal getPerDay() {
        return perDay;
    }

    public void setPerDay(BigDecimal perDay) {
        this.perDay = perDay;
    }

    public String getAuthor() {
        return author;
    }

    public long getDaysOverdue() {
        return daysOverdue;
    }

    public void setDaysOverdue(long daysOverdue) {
        this.daysOverdue = daysOverdue;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Long getBorrowedBookId() {
        return borrowedBookId;
    }

    public void setBorrowedBookId(Long borrowedBookId) {
        this.borrowedBookId = borrowedBookId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
}
