package com.librario.controller;

import com.librario.dto.ChangePasswordDTO;
import com.librario.dto.LoginDTO;
import com.librario.dto.LoginResponseDTO;
import com.librario.dto.ResetPasswordDTO;
import com.librario.dto.UserDTO;
import com.librario.model.TokenBlacklist;
import com.librario.repository.TokenBlacklistRepository;
import com.librario.repository.UserRepository;
import com.librario.service.UserService;
import com.librario.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.registerUser(userDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginDTO loginDTO) {
        LoginResponseDTO response = userService.loginUser(loginDTO);

        if ("MEMBER".equals(response.getRole()) || "READER".equals(response.getRole())) {
            Long memberId = userService.getMemberIdByUserEmail(loginDTO.getEmail());
            response.setMemberId(memberId);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/add-librarian")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> addLibrarian(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.addLibrarian(userDTO));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        return ResponseEntity.ok(userService.forgotPassword(email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO resetDTO) {
        return ResponseEntity.ok(userService.resetPassword(resetDTO));
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordDTO dto,
                                                 @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7));
        return ResponseEntity.ok(userService.changePassword(email, dto));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        tokenBlacklistRepository.save(new TokenBlacklist(token.substring(7)));
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/librarians/count")
    @PreAuthorize("hasRole('ADMIN')")
    public long countLibrarians() {
        return userRepository.countByRole_RoleName("LIBRARIAN");
    }

    @GetMapping("/members/count")
    @PreAuthorize("hasRole('ADMIN')")
    public long countMembers() {
        return userRepository.countByRole_RoleName("READER");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(userService.deleteUser(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
