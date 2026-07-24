package com.librario.controller;

import com.librario.dto.*;
import com.librario.model.Role;
import com.librario.model.TokenBlacklist;
import com.librario.repository.TokenBlacklistRepository;
import com.librario.repository.UserRepository;
import com.librario.service.UserService;
import com.librario.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;

    @Autowired
    private UserRepository userRepository;


    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserDTO userDTO) {
        String response = userService.registerUser(userDTO);
        return ResponseEntity.ok(response);
    }

//    @PostMapping("/login")
//    public ResponseEntity<?> loginUser(@RequestBody LoginDTO loginDTO) {
//        LoginResponseDTO response = userService.loginUser(loginDTO);
//        return ResponseEntity.ok(response);
//    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginDTO loginDTO) {
        // Authenticate user
        LoginResponseDTO response = userService.loginUser(loginDTO);


        if ("MEMBER".equals(response.getRole())) {
            Long memberId = userService.getMemberIdByUserEmail(loginDTO.getEmail());
            response.setMemberId(memberId);
        }

        return ResponseEntity.ok(response);
    }


    @PostMapping("/add-librarian")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> addLibrarian(@RequestBody UserDTO userDTO) {
        String response = userService.addLibrarian(userDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        String response = userService.forgotPassword(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDTO resetDTO) {
        String response = userService.resetPassword(resetDTO);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordDTO dto,
                                                 @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractUsername(token.substring(7)); // Remove "Bearer "
        String response = userService.changePassword(email, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7); // Remove "Bearer "
        tokenBlacklistRepository.save(new TokenBlacklist(jwt));
        return ResponseEntity.ok("Logged out successfully");
    }

    // Get all users for Membership Management
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // New count endpoint
    @GetMapping("/librarians/count")
    @PreAuthorize("hasRole('ADMIN')")
    public long countLibrarians() {
        return userRepository.countByRole_RoleName("LIBRARIAN");
    }

    @GetMapping("/members/count")
    @PreAuthorize("hasRole('ADMIN')")
    public long countMembers() {
        return userRepository.countByRole_RoleName("MEMBER");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        String response = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String response = userService.deleteUser(id);
        return ResponseEntity.ok(response);
    }

}
