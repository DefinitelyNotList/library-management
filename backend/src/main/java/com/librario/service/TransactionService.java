package com.librario.service;

import com.librario.model.Transaction;
import java.util.List;

public interface TransactionService {

    // Issue a book to a member
    Transaction issueBook(Long memberId, Long bookId);

    // Return a borrowed book (with condition & penalty check)
    Transaction returnBook(Long transactionId, String bookCondition, int damagePenalty);

    // Renew a borrowed book (extend due date)
    Transaction renewBook(Long transactionId, int extraDays);

    // Get all transactions for a member
    List<Transaction> getMemberTransactions(Long memberId);

    // Get all transactions for a specific book
    List<Transaction> getBookTransactions(Long bookId);

    // Calculate fine for a transaction
    int calculateFine(Transaction transaction);
}
