package com.librario.service;

import com.librario.dto.*;

import java.util.List;

public interface UserService {
    String registerUser(UserDTO userDTO);
    LoginResponseDTO loginUser(LoginDTO loginDTO);

    String addLibrarian(UserDTO userDTO);
    String forgotPassword(String email);

    String resetPassword(ResetPasswordDTO resetDTO);
    String changePassword(String email, ChangePasswordDTO changePasswordDTO);

    List<UserDTO> getAllUsers();

    Long getMemberIdByUserEmail(String email);

    String updateUser(Long userId, UserDTO userDTO);

    String deleteUser(Long userId);
}

