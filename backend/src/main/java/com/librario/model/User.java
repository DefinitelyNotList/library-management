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

    @ManyToOne
    @JoinColumn(name = "RoleId", referencedColumnName = "RoleId")
    private Role role;

    @Column(name = "Role")
    private String libraryRole;

    @Column(name = "IsActive")
    private Boolean status;

    @Column(name = "CreatedAt")
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
}
