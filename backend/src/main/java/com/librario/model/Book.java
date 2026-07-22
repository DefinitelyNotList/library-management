package com.librario.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;
    private String genre;
    private String publisher;
    private int year;
    private String isbn;
    private int totalCopies;
    private int availableCopies;

    @Enumerated(EnumType.STRING)
    private BookStatus status;

    public enum BookStatus {
        AVAILABLE, UNAVAILABLE
    }
}
