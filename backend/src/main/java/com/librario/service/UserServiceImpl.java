package com.librario.service;

import com.librario.dto.*;
import com.librario.model.Member;
import com.librario.model.Otp;
import com.librario.model.Role;
import com.librario.model.User;
import com.librario.repository.MemberRepository;
import com.librario.repository.OtpRepository;
import com.librario.repository.RoleRepository;
import com.librario.repository.UserRepository;
import com.librario.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpRepository otpRepository;

    // User Registration
    @Override
    public String registerUser(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            return "Email already exists";
        }

        String roleName = userDTO.getRole() != null ? userDTO.getRole().toUpperCase() : "MEMBER";
        Role userRole = new Role(null, roleName);

        User newUser = User.builder()
                .username(usernameFromEmail(userDTO.getEmail()))
                .name(userDTO.getName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .role(userRole)
                .libraryRole("MEMBER".equals(roleName) ? "READER" : roleName)
                .status(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(newUser);


        emailService.sendWelcomeEmailForUser(newUser.getEmail(), newUser.getName());

        return "User registered successfully and welcome email sent!";
    }


    // User Login
    @Override
    public LoginResponseDTO loginUser(LoginDTO loginDTO) {
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = "Bearer " + jwtUtil.generateToken(user.getEmail());

        Long memberId = null; // default null
        if ("MEMBER".equals(user.getRole().getRoleName())) {
            try {
                Member member = memberRepository.findByUserId(user.getId());
                memberId = (member != null && member.getId() != null) ? member.getId() : user.getId();
            } catch (Exception e) {
                memberId = user.getId();
            }
        }

        return new LoginResponseDTO(
                token,
                user.getName(),
                user.getRole().getRoleName(),
                memberId
        );
    }

    //  Add Librarian
    @Override
    public String addLibrarian(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            return "Email already exists";
        }

        Role librarianRole = new Role(null, "LIBRARIAN");

        User newUser = User.builder()
                .username(usernameFromEmail(userDTO.getEmail()))
                .name(userDTO.getName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .role(librarianRole)
                .libraryRole("LIBRARIAN")
                .status(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(newUser);


        emailService.sendWelcomeEmailForLibrarian(newUser.getEmail(), newUser.getName());

        return "Librarian added successfully and email sent!";
    }



    // Forgot Password
    @Override
    public String forgotPassword(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return "No user found with that email";
        }

        // Generate 6-digit OTP
        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        // Save OTP in DB
        Otp otpRecord = new Otp();
        otpRecord.setEmail(email);
        otpRecord.setOtp(otp);
        otpRecord.setCreatedAt(LocalDateTime.now());
        otpRepository.save(otpRecord);

        // Send OTP via email
        String subject = "Librario Password Reset OTP";
        String body = """
            Hello %s,
            
            Your OTP for password reset is: %s
            
            If you did not request this, please ignore this email.
            """.formatted(optionalUser.get().getName(), otp);

        emailService.sendEmail(email, subject, body);

        return "OTP sent to your email!";
    }

    //  Reset Password
    @Override
    public String resetPassword(ResetPasswordDTO resetDTO) {
        String email = resetDTO.getEmail();
        String otp = resetDTO.getOtp();
        String newPassword = resetDTO.getNewPassword();

        Otp otpRecord = otpRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (!otpRecord.getOtp().equals(otp)) {
            return "Invalid OTP";
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        otpRepository.delete(otpRecord);

        return "Password reset successful";
    }

    // Change Password
    @Override
    public String changePassword(String email, ChangePasswordDTO changePasswordDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(changePasswordDTO.getOldPassword(), user.getPassword())) {
            return "Old password is incorrect";
        }

        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return "Password changed successfully";
    }

    // Get All Users
    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll(); // fetch all users from DB

        // Map User -> UserDTO
        List<UserDTO> userDTOs = users.stream().map(user -> new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                null, // Do NOT send password back
//                user.getRole().getRoleName()
                user.getRole() != null ? user.getRole().getRoleName() : "NO_ROLE"
        )).toList();

        return userDTOs;
    }

    // Get memberId by user email
    @Override
    public Long getMemberIdByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"MEMBER".equals(user.getRole().getRoleName())) return null;

        try {
            Member member = memberRepository.findByUserId(user.getId());
            return (member != null && member.getId() != null) ? member.getId() : user.getId();
        } catch (Exception e) {
            return user.getId();
        }
    }

    private String usernameFromEmail(String email) {
        String localPart = email == null ? "user" : email.substring(0, Math.max(1, email.indexOf('@')));
        return localPart.length() > 50 ? localPart.substring(0, 50) : localPart;
    }

    @Override
    public String updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userDTO.getName() != null && !userDTO.getName().trim().isEmpty()) {
            user.setName(userDTO.getName());
        }
        if (userDTO.getEmail() != null && !userDTO.getEmail().trim().isEmpty()) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getRole() != null && !userDTO.getRole().trim().isEmpty()) {
            String roleName = userDTO.getRole().toUpperCase();
            if ("MEMBER".equals(roleName)) roleName = "READER";
            user.setLibraryRole(roleName);
        }
        if (userDTO.getPassword() != null && !userDTO.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        userRepository.save(user);
        return "User updated successfully";
    }

    @Override
    public String deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            return "User not found";
        }
        userRepository.deleteById(userId);
        return "User deleted successfully";
    }
}
