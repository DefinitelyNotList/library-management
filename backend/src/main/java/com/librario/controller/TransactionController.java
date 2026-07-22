package com.librario.controller;

import com.librario.model.Transaction;
import com.librario.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Issue a book
    @PostMapping("/issue/{memberId}/{bookId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<Transaction> issueBook(
            @PathVariable Long memberId,
            @PathVariable Long bookId
    ) {
        Transaction transaction = transactionService.issueBook(memberId, bookId);
        return ResponseEntity.ok(transaction);
    }

    // Return a book (handled only by Librarian/Admin with condition & penalty)
    @PostMapping("/return/{transactionId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<Transaction> returnBook(
            @PathVariable Long transactionId,
            @RequestParam(defaultValue = "GOOD") String bookCondition,
            @RequestParam(defaultValue = "0") int damagePenalty
    ) {
        Transaction transaction = transactionService.returnBook(transactionId, bookCondition, damagePenalty);
        return ResponseEntity.ok(transaction);
    }

    // Renew a book
    @PostMapping("/renew/{transactionId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN','MEMBER')")
    public ResponseEntity<Transaction> renewBook(
            @PathVariable Long transactionId,
            @RequestParam(defaultValue = "7") int extraDays
    ) {
        Transaction transaction = transactionService.renewBook(transactionId, extraDays);
        return ResponseEntity.ok(transaction);
    }

    // Get all transactions for a member
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN','MEMBER')")
    public ResponseEntity<List<Transaction>> getMemberTransactions(@PathVariable Long memberId) {
        List<Transaction> transactions = transactionService.getMemberTransactions(memberId);
        return ResponseEntity.ok(transactions);
    }

    // Get all transactions for a specific book
    @GetMapping("/book/{bookId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN','ADMIN')")
    public ResponseEntity<List<Transaction>> getBookTransactions(@PathVariable Long bookId) {
        List<Transaction> transactions = transactionService.getBookTransactions(bookId);
        return ResponseEntity.ok(transactions);
    }

}
