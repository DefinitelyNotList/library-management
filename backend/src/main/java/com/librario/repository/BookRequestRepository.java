package com.librario.repository;

import com.librario.model.BookRequest;
import com.librario.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookRequestRepository extends JpaRepository<BookRequest, Long> {
    List<BookRequest> findByMember(Member member);
    List<BookRequest> findByStatus(BookRequest.RequestStatus status);

    @Query("SELECT r FROM BookRequest r WHERE r.member.id = :id OR r.member.user.id = :id")
    List<BookRequest> findByMemberIdOrUserId(@Param("id") Long id);
}
