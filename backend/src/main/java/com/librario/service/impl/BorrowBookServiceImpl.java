package com.librario.service.impl;

import com.librario.dto.PenaltyDto;
import com.librario.model.BorrowedBook;
import com.librario.model.Member;
import com.librario.model.Book;
import com.librario.repository.BorrowedBookRepository;
import com.librario.repository.MemberRepository;
import com.librario.repository.BookRepository;
import com.librario.service.BorrowBookService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BorrowBookServiceImpl implements BorrowBookService {

    private final MemberRepository memberRepo;
    private final BookRepository bookRepo;
    private final BorrowedBookRepository borrowedBookRepo;

    private static final int FINE_PER_DAY = 10; // ₹10 per day

    public BorrowBookServiceImpl(MemberRepository memberRepo, BookRepository bookRepo,
                                 BorrowedBookRepository borrowedBookRepo) {
        this.memberRepo = memberRepo;
        this.bookRepo = bookRepo;
        this.borrowedBookRepo = borrowedBookRepo;
    }

    @Override
    public List<BorrowedBook> getBorrowingHistory(Long memberId) {
        // Return distinct borrowed books to avoid duplicates
        return borrowedBookRepo.findByMemberId(memberId)
                .stream()
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public int calculatePenalty(BorrowedBook borrowedBook) {
        if (borrowedBook.getReturnDate() != null) {
            return borrowedBook.getFine();
        }

        LocalDate today = LocalDate.now();
        if (borrowedBook.getDueDate().isBefore(today)) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(borrowedBook.getDueDate(), today);
            return (int) overdueDays * FINE_PER_DAY;
        }

        return 0;
    }

    @Override
    @Transactional
    public BorrowedBook borrowBook(Long memberId, Long bookId) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        if (member.getStatus() != Member.Status.ACTIVE) {
            throw new IllegalStateException("Member is not active");
        }

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available");
        }

        List<BorrowedBook> activeBorrows =
                borrowedBookRepo.findByMemberIdAndStatus(memberId, "BORROWED");

        int borrowingLimit = member.getMembershipPlan().getBorrowingLimit();
        if (activeBorrows.size() >= borrowingLimit) {
            throw new IllegalStateException("Borrowing limit reached");
        }

        BorrowedBook borrowedBook = new BorrowedBook();
        borrowedBook.setMember(member);
        borrowedBook.setBook(book);
        borrowedBook.setBorrowDate(LocalDate.now()); // maps to issue_date
        borrowedBook.setDueDate(LocalDate.now().plusDays(30));
        borrowedBook.setStatus("BORROWED");
        borrowedBook.setFine(0);

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepo.save(book);

        return borrowedBookRepo.save(borrowedBook);
    }

    @Override
    @Transactional
    public BorrowedBook returnBook(Long borrowId) {
        BorrowedBook borrowedBook = borrowedBookRepo.findById(borrowId)
                .orElseThrow(() -> new IllegalArgumentException("Borrowed book not found: " + borrowId));

        if ("RETURNED".equals(borrowedBook.getStatus())) {
            throw new IllegalStateException("Book already returned");
        }

        borrowedBook.setStatus("RETURNED");
        borrowedBook.setReturnDate(LocalDate.now());

        // Calculate and store fine
        int fine = calculatePenalty(borrowedBook);
        borrowedBook.setFine(fine);

        Book book = borrowedBook.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepo.save(book);

        return borrowedBookRepo.save(borrowedBook);
    }

    public List<PenaltyDto> getPenaltiesByMemberId(Long memberId) {
        LocalDate today = LocalDate.now();
        List<BorrowedBook> borrowedBooks = borrowedBookRepo.findByMemberId(memberId);

        List<PenaltyDto> penalties = new ArrayList<>();
        BigDecimal perDayPenalty = BigDecimal.valueOf(FINE_PER_DAY);

        for (BorrowedBook bb : borrowedBooks) {
            BigDecimal totalPenalty = BigDecimal.valueOf(bb.getFine() != null ? bb.getFine() : 0);
            long overdueDays = 0;

            // Calculate overdue penalty
            if (bb.getReturnDate() != null) {
                overdueDays = ChronoUnit.DAYS.between(bb.getDueDate(), bb.getReturnDate());
            } else {
                overdueDays = ChronoUnit.DAYS.between(bb.getDueDate(), today);
            }

            // Ensure overdueDays is never negative
            overdueDays = Math.max(overdueDays, 0);

            // Add overdue fine
            totalPenalty = totalPenalty.add(perDayPenalty.multiply(BigDecimal.valueOf(overdueDays)));

            // Only include books that have any penalty
            if (totalPenalty.compareTo(BigDecimal.ZERO) > 0) {
                Book book = bb.getBook();
                PenaltyDto dto = new PenaltyDto(
                        bb.getId(),
                        book != null ? book.getId() : null,
                        book != null ? book.getTitle() : "Unknown",
                        book != null ? book.getAuthor() : "Unknown",
                        bb.getDueDate(),
                        overdueDays,
                        perDayPenalty,
                        totalPenalty,
                        "UNPAID"
                );
                penalties.add(dto);
            }
        }

        return penalties;
    }

    @Override
    @Transactional
    public void markPenaltyAsPaid(Long borrowId) {
        BorrowedBook borrowedBook = borrowedBookRepo.findById(borrowId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        borrowedBook.setPenaltyStatus("PAID");  // add this field in BorrowedBook
        borrowedBookRepo.save(borrowedBook);
    }

    @Override
    @Transactional
    public void markAllPenaltiesAsPaid(Long memberId) {
        List<BorrowedBook> borrowedBooks = borrowedBookRepo.findByMemberId(memberId);
        for (BorrowedBook b : borrowedBooks) {
            if ("UNPAID".equalsIgnoreCase(b.getPenaltyStatus())) {
                b.setPenaltyStatus("PAID");
            }
        }
        borrowedBookRepo.saveAll(borrowedBooks);
    }


}
