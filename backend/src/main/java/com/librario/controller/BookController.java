package com.librario.controller;

import com.librario.dto.BookUpsertRequest;
import com.librario.service.LibrarySchemaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final LibrarySchemaService libraryService;

    public BookController(LibrarySchemaService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping
    public List<Map<String, Object>> getAllBooks(@RequestParam(required = false) String q) {
        return libraryService.books(q);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getBook(@PathVariable int id) {
        return libraryService.book(id);
    }

    @GetMapping("/search/title")
    public List<Map<String, Object>> searchByTitle(@RequestParam String title) {
        return libraryService.books(title);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Map<String, Object>> createBook(@RequestBody BookUpsertRequest request) {
        return ResponseEntity.status(201).body(libraryService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public Map<String, Object> updateBook(@PathVariable int id, @RequestBody BookUpsertRequest request) {
        return libraryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Void> deleteBook(@PathVariable int id) {
        libraryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
