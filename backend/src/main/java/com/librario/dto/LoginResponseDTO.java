// src/main/java/com/librario/dto/LoginResponseDTO.java
package com.librario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String username;
    private String role;
    private Long memberId;
}
