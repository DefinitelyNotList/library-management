package com.librario.repository;

import com.librario.model.BookRequest;
import com.librario.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookRequestRepository extends JpaRepository<BookRequest, Long> {
    List<BookRequest> findByMember(Member member);
    List<BookRequest> findByStatus(BookRequest.RequestStatus status);
}
