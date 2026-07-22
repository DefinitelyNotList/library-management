package com.librario.dto;

public record BookUpsertRequest(String title, String author, String genre, String publisher,
                                Integer year, String isbn, Integer totalCopies,
                                Integer availableCopies, String status) { }
