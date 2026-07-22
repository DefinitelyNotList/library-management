package com.librario.controller;

import com.librario.model.BookRequest;
import com.librario.service.BookRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class BookRequestController {

    private final BookRequestService bookRequestService;

    public BookRequestController(BookRequestService bookRequestService) {
        this.bookRequestService = bookRequestService;
    }

    // 🔹 Member: Create request
    @PostMapping("/member/{memberId}/book/{bookId}")
    public ResponseEntity<BookRequest> createRequest(
            @PathVariable Long memberId,
            @PathVariable Long bookId) {
        return ResponseEntity.ok(bookRequestService.createRequest(memberId, bookId));
    }

    // 🔹 Member: View all requests by this member
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<BookRequest>> getRequestsByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(bookRequestService.getRequestsByMember(memberId));
    }

    // 🔹 Librarian: View all pending requests
    @GetMapping("/pending")
    public ResponseEntity<List<BookRequest>> getPendingRequests() {
        return ResponseEntity.ok(bookRequestService.getPendingRequests());
    }

    // 🔹 Librarian: Approve request
    @PutMapping("/{requestId}/approve")
    public ResponseEntity<BookRequest> approveRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(bookRequestService.approveRequest(requestId));
    }

    // 🔹 Librarian: Reject request
    @PutMapping("/{requestId}/reject")
    public ResponseEntity<BookRequest> rejectRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(bookRequestService.rejectRequest(requestId));
    }
}
