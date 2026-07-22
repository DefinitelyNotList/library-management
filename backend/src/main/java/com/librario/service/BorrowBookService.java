package com.librario.service;

import com.librario.dto.PenaltyDto;
import com.librario.model.BorrowedBook;
import java.util.List;

public interface BorrowBookService {

    // Borrow a book for a member
    BorrowedBook borrowBook(Long memberId, Long bookId);

    // Get all borrowed books for a member
    List<BorrowedBook> getBorrowingHistory(Long memberId);

    // Calculate the penalty for a borrowed book (overdue or damaged)
    int calculatePenalty(BorrowedBook borrowedBook);

    // Return a borrowed book and update status & available copies
    BorrowedBook returnBook(Long borrowId);


    List<PenaltyDto> getPenaltiesByMemberId(Long memberId);

    void markPenaltyAsPaid(Long borrowId);
    void markAllPenaltiesAsPaid(Long memberId);

}
