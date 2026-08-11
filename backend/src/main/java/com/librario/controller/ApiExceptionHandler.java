package com.librario.controller;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Xử lý tập trung các exception từ toàn bộ REST controllers.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    /** 400 Bad Request – lỗi do đầu vào không hợp lệ */
    @ExceptionHandler({IllegalArgumentException.class, EmptyResultDataAccessException.class})
    public ResponseEntity<Map<String, String>> badRequest(Exception ex) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", ex.getMessage() != null ? ex.getMessage() : "Yêu cầu không hợp lệ."));
    }

    /** 409 Conflict – vi phạm ràng buộc nghiệp vụ */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> conflict(IllegalStateException ex) {
        return ResponseEntity.status(409)
                .body(Map.of("message", ex.getMessage()));
    }

    /** 500 Internal Server Error – lỗi không mong đợi */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        String msg = ex.getMessage();
        if (msg == null || msg.isBlank()) {
            msg = ex.getClass().getSimpleName();
        }
        return ResponseEntity.internalServerError()
                .body(Map.of("message", msg));
    }
}
