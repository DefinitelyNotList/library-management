//package com.librario.repository;
//
//import com.librario.model.BorrowedBook;
//import org.springframework.data.jpa.repository.JpaRepository;
//import java.util.List;
//
//public interface BorrowedBookRepository extends JpaRepository<BorrowedBook, Long> {
//    List<BorrowedBook> findByMemberIdAndStatus(Long memberId, String status);
//    List<BorrowedBook> findByMemberId(Long memberId);
//    List<BorrowedBook> findAll();
//
//
//}

package com.librario.repository;

import com.librario.model.BorrowedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BorrowedBookRepository extends JpaRepository<BorrowedBook, Long> {

    List<BorrowedBook> findByMemberIdAndStatus(Long memberId, String status);
    List<BorrowedBook> findByMemberIdAndPenaltyStatus(Long memberId, String status);


    @Query("SELECT DISTINCT b FROM BorrowedBook b WHERE b.member.id = :memberId")
    List<BorrowedBook> findByMemberId(Long memberId);

}

