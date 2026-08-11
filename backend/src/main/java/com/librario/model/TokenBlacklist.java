package com.librario.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "token_blacklist")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "VARCHAR(1000)", nullable = false, unique = true)
    private String token;

    @Column(name = "blacklisted_at")
    private LocalDateTime blacklistedAt;

    public TokenBlacklist(String token) {
        this.token = token;
        this.blacklistedAt = java.time.LocalDateTime.now();
    }

}
