package com.librario.dto;

import java.util.List;

public record BorrowRequest(Integer readerId, Integer librarianId, List<Integer> bookIds,
                            Integer borrowDays) { }
