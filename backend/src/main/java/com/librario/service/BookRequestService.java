package com.librario.service;

import com.librario.model.BookRequest;
import com.librario.model.Member;
import java.util.List;

public interface BookRequestService {
    BookRequest createRequest(Long memberId, Long bookId);
    List<BookRequest> getRequestsByMember(Long memberId);
    List<BookRequest> getPendingRequests();
    BookRequest approveRequest(Long requestId);
    BookRequest rejectRequest(Long requestId);
}
