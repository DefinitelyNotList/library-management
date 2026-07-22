package com.librario.repository;

import com.librario.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    // Fetch a Member by its linked User's ID
    Member findByUserId(Long userId);
}
