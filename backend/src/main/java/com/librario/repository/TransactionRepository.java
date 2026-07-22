package com.librario.repository;

import com.librario.model.Transaction;
import com.librario.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Find all transactions by a member
    List<Transaction> findByMember(Member member);

    // Find all transactions by memberId directly
    List<Transaction> findByMemberId(Long memberId);

    // Optional: find transactions by status
    List<Transaction> findByStatus(String status);

    List<Transaction> findByBookId(Long bookId);

    // Simple query: get borrowed transactions due on `dueDate`

    //  Get transactions that are due on a given date and still BORROWED
    @Query("SELECT t FROM Transaction t WHERE t.status = 'BORROWED' AND t.dueDate = :dueDate")
    List<Transaction> findTransactionsDueOn(@Param("dueDate") LocalDate dueDate);
}
