package com.librario.repository;

import com.librario.model.Role;
import com.librario.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    long countByRole_RoleName(String roleName);

}
