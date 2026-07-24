package com.librario.repository;

import com.librario.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE UPPER(u.libraryRole) = UPPER(:roleName) OR (UPPER(:roleName) = 'MEMBER' AND UPPER(u.libraryRole) = 'READER')")
    long countByRole_RoleName(@Param("roleName") String roleName);
}

