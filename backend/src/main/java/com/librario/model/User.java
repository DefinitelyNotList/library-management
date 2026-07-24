package com.librario.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId")
    private Long id;

    @Column(name = "Username")
    private String username;

    @Column(name = "FullName")
    private String name;

    @Column(name = "Email", unique = true)
    private String email;

    @Column(name = "PasswordHash")
    private String password;

    @Column(name = "PhoneNumber")
    private String phoneNumber;

    @Column(name = "Role")
    private String libraryRole;

    @Transient
    private Role role;

    public Role getRole() {
        if (role != null) return role;
        if (libraryRole != null) {
            String r = libraryRole.toUpperCase();
            if ("READER".equals(r)) r = "MEMBER";
            return new Role(null, r);
        }
        return new Role(null, "MEMBER");
    }

    @Column(name = "IsActive")
    private Boolean status;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;
}

