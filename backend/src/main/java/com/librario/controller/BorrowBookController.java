package com.librario.controller;

import com.librario.dto.PenaltyDto;
import com.librario.model.BorrowedBook;
import com.librario.model.Transaction;
import com.librario.service.BorrowBookService;
import com.librario.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/borrow")
public class BorrowBookController {

    private final BorrowBookService borrowBookService;
    private final TransactionService transactionService;

    public BorrowBookController(BorrowBookService borrowBookService,
                                TransactionService transactionService) {
        this.borrowBookService = borrowBookService;
        this.transactionService = transactionService;
    }

    @PostMapping("/{memberId}/{bookId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<BorrowedBook> borrowBook(@PathVariable Long memberId, @PathVariable Long bookId) {
        BorrowedBook borrowedBook = borrowBookService.borrowBook(memberId, bookId);
        return ResponseEntity.ok(borrowedBook);
    }

    @GetMapping("/history/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
    public ResponseEntity<List<Object>> getBorrowingHistory(@PathVariable Long memberId) {
        List<BorrowedBook> borrowHistory = borrowBookService.getBorrowingHistory(memberId);
        List<Transaction> transactionHistory = transactionService.getMemberTransactions(memberId);

        // Remove duplicates by BorrowedBook ID
        List<BorrowedBook> uniqueBorrowHistory = borrowHistory.stream()
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(BorrowedBook::getId, b -> b, (b1, b2) -> b1),
                        m -> new ArrayList<>(m.values())
                ));

        List<Object> combinedHistory = new ArrayList<>();
        combinedHistory.addAll(uniqueBorrowHistory);
        combinedHistory.addAll(transactionHistory);

        return ResponseEntity.ok(combinedHistory);
    }

    @PostMapping("/return/{borrowId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<BorrowedBook> returnBorrowedBook(@PathVariable Long borrowId) {
        BorrowedBook returnedBook = borrowBookService.returnBook(borrowId);
        return ResponseEntity.ok(returnedBook);
    }


    @GetMapping("/penalties/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','LIBRARIAN','MEMBER')")
    public ResponseEntity<List<PenaltyDto>> getPenalties(@PathVariable Long memberId) {
        List<PenaltyDto> penalties = borrowBookService.getPenaltiesByMemberId(memberId);
        return ResponseEntity.ok(penalties);
    }



}
