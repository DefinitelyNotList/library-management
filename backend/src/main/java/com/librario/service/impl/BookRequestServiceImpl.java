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

import com.librario.model.User;
import com.librario.repository.UserRepository;

import com.librario.model.MembershipPlan;
import com.librario.repository.MembershipPlanRepository;

@Service
public class BookRequestServiceImpl implements BookRequestService {

    private final BookRequestRepository bookRequestRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final MembershipPlanRepository planRepository;

    public BookRequestServiceImpl(BookRequestRepository bookRequestRepository,
                                  MemberRepository memberRepository,
                                  BookRepository bookRepository,
                                  TransactionRepository transactionRepository,
                                  UserRepository userRepository,
                                  MembershipPlanRepository planRepository) {
        this.bookRequestRepository = bookRequestRepository;
        this.memberRepository = memberRepository;
        this.bookRepository = bookRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
    }

    @Override
    public BookRequest createRequest(Long memberId, Long bookId) {
        // First try finding by UserId (since memberId passed from UI is usually user ID)
        Member member = memberRepository.findByUserId(memberId);
        if (member == null) {
            member = memberRepository.findById(memberId).orElse(null);
        }
        if (member == null) {
            User user = userRepository.findById(memberId).orElse(null);
            if (user != null) {
                member = memberRepository.findByUserId(user.getId());
                if (member == null) {
                    member = new Member();
                    member.setUser(user);
                    member.setStartDate(LocalDate.now());
                    member.setEndDate(LocalDate.now().plusDays(365));
                    member.setStatus(Member.Status.ACTIVE);
                    MembershipPlan defaultPlan = planRepository.findAll().stream().findFirst().orElse(null);
                    if (defaultPlan == null) {
                        defaultPlan = new MembershipPlan(null, MembershipPlan.PlanType.BASIC, 0.0, 5, 365);
                        defaultPlan = planRepository.save(defaultPlan);
                    }
                    member.setMembershipPlan(defaultPlan);
                    member = memberRepository.save(member);
                }
            }
        }
        if (member == null) {
            throw new RuntimeException("Member not found for id=" + memberId + ". Please ensure member account is active.");
        }
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id=" + bookId));

        BookRequest request = new BookRequest();
        request.setMember(member);
        request.setBook(book);
        request.setRequestDate(LocalDate.now());
        request.setStatus(BookRequest.RequestStatus.PENDING);

        return bookRequestRepository.save(request);
    }

    @Override
    public List<BookRequest> getRequestsByMember(Long memberId) {
        if (memberId == null) return List.of();
        List<BookRequest> requests = bookRequestRepository.findByMemberIdOrUserId(memberId);
        if (requests.isEmpty()) {
            Member member = memberRepository.findByUserId(memberId);
            if (member == null) {
                member = memberRepository.findById(memberId).orElse(null);
            }
            if (member != null) {
                requests = bookRequestRepository.findByMember(member);
            }
        }
        return requests;
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

        // check duplicate active borrow
        if (transactionRepository.existsByMemberIdAndBookIdAndStatus(member.getId(), book.getId(), "BORROWED")) {
            throw new RuntimeException("Member already has an active borrow for this book");
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
