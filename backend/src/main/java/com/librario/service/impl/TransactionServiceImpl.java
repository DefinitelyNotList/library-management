package com.librario.service.impl;

import com.librario.model.Book;
import com.librario.model.Member;
import com.librario.model.Transaction;
import com.librario.repository.BookRepository;
import com.librario.repository.MemberRepository;
import com.librario.repository.TransactionRepository;
import com.librario.service.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepo;
    private final MemberRepository memberRepo;
    private final BookRepository bookRepo;


    private static final int FINE_PER_DAY = 10; // ₹10/day

    public TransactionServiceImpl(TransactionRepository transactionRepo,
                                  MemberRepository memberRepo,
                                  BookRepository bookRepo) {
        this.transactionRepo = transactionRepo;
        this.memberRepo = memberRepo;
        this.bookRepo = bookRepo;
    }

    @Override
    @Transactional
    public Transaction issueBook(Long memberId, Long bookId) {
        Member member = memberRepo.findById(memberId)
                .orElseGet(() -> memberRepo.findByUserId(memberId));
        if (member == null) {
            throw new IllegalArgumentException("Member not found for ID: " + memberId);
        }

        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available to issue for book: " + book.getTitle());
        }

        Transaction transaction = new Transaction();
        transaction.setMember(member);
        transaction.setBook(book);
        transaction.setIssueDate(LocalDate.now());
        transaction.setDueDate(LocalDate.now().plusDays(14)); // default 2-week period
        transaction.setStatus("BORROWED");

        // Decrease available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepo.save(book);

        return transactionRepo.save(transaction);
    }

    @Override
    @Transactional
    public List<Transaction> issueBooks(Long memberId, List<Long> bookIds) {
        if (bookIds == null || bookIds.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất 1 quyển sách.");
        }
        if (bookIds.size() > 5) {
            throw new IllegalArgumentException("Mỗi phiếu mượn được mượn tối đa 5 quyển sách.");
        }
        List<Transaction> transactions = new java.util.ArrayList<>();
        for (Long bookId : bookIds) {
            transactions.add(issueBook(memberId, bookId));
        }
        return transactions;
    }

    @Override
    @Transactional
    public Transaction returnBook(Long transactionId, String bookCondition, int damagePenalty) {
        Transaction transaction = transactionRepo.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        if (!"BORROWED".equals(transaction.getStatus()) && !"RENEWED".equals(transaction.getStatus())) {
            throw new IllegalStateException("Book is not currently borrowed");
        }

        // Mark return
        transaction.setReturnDate(LocalDate.now());
        transaction.setStatus("RETURNED");

        // Calculate overdue fine
        int overdueFine = calculateFine(transaction);
        int totalFine = overdueFine;

        // Add damage penalty if condition is not GOOD
        if (!"GOOD".equalsIgnoreCase(bookCondition)) {
            totalFine += damagePenalty;
        }

        transaction.setFine(totalFine);
        transaction.setBookConditionOnReturn(bookCondition);
        transaction.setDamagePenalty(damagePenalty);

        // Increase available copies
        Book book = transaction.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepo.save(book);

        return transactionRepo.save(transaction);
    }

    @Override
    @Transactional
    public Transaction renewBook(Long transactionId, int extraDays) {
        Transaction transaction = transactionRepo.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        if (!"BORROWED".equals(transaction.getStatus()) && !"RENEWED".equals(transaction.getStatus())) {
            throw new IllegalStateException("Book is not currently borrowed");
        }

        transaction.setDueDate(transaction.getDueDate().plusDays(extraDays));
        transaction.setStatus("RENEWED");

        return transactionRepo.save(transaction);
    }

    @Override
    public List<Transaction> getMemberTransactions(Long memberId) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));
        return transactionRepo.findByMember(member);
    }

    @Override
    public List<Transaction> getBookTransactions(Long bookId) {
        return transactionRepo.findByBookId(bookId);
    }

    @Override
    public int calculateFine(Transaction transaction) {
        if (transaction.getReturnDate() != null && transaction.getReturnDate().isAfter(transaction.getDueDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(
                    transaction.getDueDate(), transaction.getReturnDate());
            return (int) overdueDays * FINE_PER_DAY;
        } else if (transaction.getReturnDate() == null && transaction.getDueDate().isBefore(LocalDate.now())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(
                    transaction.getDueDate(), LocalDate.now());
            return (int) overdueDays * FINE_PER_DAY;
        }
        return 0;
    }
}
