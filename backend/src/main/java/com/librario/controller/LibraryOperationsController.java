package com.librario.controller;

import com.librario.dto.BorrowRequest;
import com.librario.dto.ReturnBookRequest;
import com.librario.service.LibrarySchemaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
public class LibraryOperationsController {
    private final LibrarySchemaService libraryService;

    public LibraryOperationsController(LibrarySchemaService libraryService) {
        this.libraryService = libraryService;
    }

    @GetMapping("/lookups/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public List<Map<String, Object>> lookups(@PathVariable String type) {
        return libraryService.lookup(type);
    }

    @PostMapping("/borrows")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public Map<String, Object> borrow(@RequestBody BorrowRequest request) {
        return libraryService.borrow(request);
    }

    @PostMapping("/borrows/{borrowDetailId}/return")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public Map<String, Object> returnBook(@PathVariable int borrowDetailId,
                                           @RequestBody(required = false) ReturnBookRequest request) {
        return libraryService.returnBook(borrowDetailId, request == null ? null : request.bookCondition());
    }

    @GetMapping("/borrows/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN', 'READER')")
    public List<Map<String, Object>> history(@RequestParam int readerId) {
        return libraryService.history(readerId);
    }

    @GetMapping("/borrows/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public List<Map<String, Object>> allBorrows() {
        return libraryService.allBorrows();
    }

    @GetMapping("/borrows/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public List<Map<String, Object>> overdue() {
        return libraryService.overdue();
    }

    @PutMapping("/borrows/update-overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public Map<String, Object> updateOverdue() {
        return libraryService.updateOverdue();
    }

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Object> statistics() {
        return libraryService.statistics();
    }

    @GetMapping("/top-books")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public List<Map<String, Object>> topBooks() {
        return libraryService.topBooks();
    }
}
