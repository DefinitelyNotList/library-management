package com.librario.service.impl;

import com.librario.model.Book;
import com.librario.model.BookRequest;
import com.librario.model.Member;
import com.librario.model.Transaction;
import com.librario.repository.BookRepository;
import com.librario.repository.BookRequestRepository;
import com.librario.repository.MemberRepository;
import com.librario.repository.TransactionRepository;
import com.librario.service.BookRequestService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookRequestServiceImpl implements BookRequestService {

    private final BookRequestRepository bookRequestRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;

    public BookRequestServiceImpl(BookRequestRepository bookRequestRepository,
                                  MemberRepository memberRepository,
                                  BookRepository bookRepository,
                                  TransactionRepository transactionRepository) {
        this.bookRequestRepository = bookRequestRepository;
        this.memberRepository = memberRepository;
        this.bookRepository = bookRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public BookRequest createRequest(Long memberId, Long bookId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        BookRequest request = new BookRequest();
        request.setMember(member);
        request.setBook(book);
        request.setRequestDate(LocalDate.now());
        request.setStatus(BookRequest.RequestStatus.PENDING);

        return bookRequestRepository.save(request);
    }

    @Override
    public List<BookRequest> getRequestsByMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        return bookRequestRepository.findByMember(member);
    }

    @Override
    public List<BookRequest> getPendingRequests() {
        return bookRequestRepository.findByStatus(BookRequest.RequestStatus.PENDING);
    }

    @Override
    public BookRequest approveRequest(Long requestId) {
        BookRequest request = bookRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Book book = request.getBook();
        Member member = request.getMember();

        // check availability
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book not available for issue");
        }

        // reduce available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // create transaction
        Transaction transaction = new Transaction();
        transaction.setMember(member);
        transaction.setBook(book);
        transaction.setIssueDate(LocalDate.now());
        transaction.setDueDate(LocalDate.now().plusDays(14)); // default 2 weeks
        transaction.setStatus("BORROWED");
        transactionRepository.save(transaction);

        // update request
        request.setStatus(BookRequest.RequestStatus.APPROVED);
        return bookRequestRepository.save(request);
    }

    @Override
    public BookRequest rejectRequest(Long requestId) {
        BookRequest request = bookRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(BookRequest.RequestStatus.REJECTED);
        return bookRequestRepository.save(request);
    }
}
