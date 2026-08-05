package com.librario.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BookId", columnDefinition = "INT")
    private Long id;

    @Column(name = "Title")
    private String title;

    @Transient
    private String author;

    @Transient
    private String genre;

    @Transient
    private String publisher;

    @Column(name = "PublishYear")
    private Integer year;

    @Column(name = "ISBN")
    private String isbn;

    @Column(name = "Quantity")
    private int totalCopies;

    @Column(name = "AvailableQuantity")
    private int availableCopies;

    @Column(name = "Status")
    private String status;
}
