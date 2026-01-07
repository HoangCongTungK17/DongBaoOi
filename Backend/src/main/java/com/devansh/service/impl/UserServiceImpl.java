package com.devansh.service.impl;

import com.devansh.config.JwtService;
import com.devansh.exception.TokenInvalidException;
import com.devansh.exception.UserAlreadyExistException;
import com.devansh.exception.UserException;
import com.devansh.model.User;
import com.devansh.model.enums.Role;
import com.devansh.repo.UserRepository;
import com.devansh.request.ChangePasswordRequest;
import com.devansh.request.UserUpdateRequest;
import com.devansh.response.MessageResponse;
import com.devansh.response.UserDto;
import com.devansh.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public User findByJwtToken(String token) throws UserException, TokenInvalidException {
        token = token.substring(7);
        String email = jwtService.extractUsername(token);
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found with email: " + email));
        return user;
    }

    @Override
    public UserDto getMyDetails(String token) throws UserException, TokenInvalidException {
        User user = findByJwtToken(token);
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .address(user.getAddress())
                .build();
    }

    @Override
    public UserDto updateMyDetails(String token, UserUpdateRequest request)
            throws UserException, TokenInvalidException {
        User user = findByJwtToken(token);
        if (request.address() != null) {
            user.setAddress(request.address());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }
        if (request.fullname() != null) {
            user.setFullname(request.fullname());
        }
        User updatedUser = userRepository.save(user);
        return UserDto.builder()
                .id(updatedUser.getId())
                .email(updatedUser.getEmail())
                .fullname(updatedUser.getFullname())
                .phoneNumber(updatedUser.getPhoneNumber())
                .role(updatedUser.getRole())
                .address(updatedUser.getAddress())
                .build();
    }

    @Override
    public MessageResponse changePassword(String token, ChangePasswordRequest request)
            throws UserException, TokenInvalidException {
        User user = findByJwtToken(token);

        // Validate current password
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new UserException("Mật khẩu hiện tại không đúng");
        }

        // Validate new password confirmation
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new UserException("Mật khẩu xác nhận không khớp");
        }

        // Validate new password is different from current
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new UserException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new MessageResponse("Đổi mật khẩu thành công");
    }

    // ===== ADMIN METHODS =====

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Integer userId) throws UserException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with ID: " + userId));
        return mapToUserDto(user);
    }

    @Override
    public UserDto updateUserRole(Integer userId, String role) throws UserException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with ID: " + userId));

        try {
            Role newRole = Role.valueOf(role.toUpperCase());
            user.setRole(newRole);
            User updated = userRepository.save(user);
            return mapToUserDto(updated);
        } catch (IllegalArgumentException e) {
            throw new UserException("Invalid role: " + role);
        }
    }

    @Override
    public long getTotalUsersCount() {
        return userRepository.count();
    }

    @Override
    public UserDto createUser(String fullname, String email, String phoneNumber, String address, String role)
            throws UserException, UserAlreadyExistException {
        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new UserAlreadyExistException("Email already exists: " + email);
        }

        // Validate role
        Role userRole;
        try {
            userRole = Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new UserException("Invalid role: " + role);
        }

        // Create new user with default password "123456"
        User newUser = new User();
        newUser.setFullname(fullname);
        newUser.setEmail(email);
        newUser.setPhoneNumber(phoneNumber);
        newUser.setAddress(address);
        newUser.setRole(userRole);
        newUser.setPassword(passwordEncoder.encode("123456")); // Default password

        User savedUser = userRepository.save(newUser);
        return mapToUserDto(savedUser);
    }

    @Override
    public UserDto updateUser(Integer userId, UserUpdateRequest request) throws UserException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with ID: " + userId));

        // Update fields
        if (request.fullname() != null && !request.fullname().isEmpty()) {
            user.setFullname(request.fullname());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }
        if (request.address() != null) {
            user.setAddress(request.address());
        }

        User updatedUser = userRepository.save(user);
        return mapToUserDto(updatedUser);
    }

    @Override
    public MessageResponse deleteUser(Integer userId) throws UserException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found with ID: " + userId));

        // Delete the user
        userRepository.delete(user);
        return new MessageResponse("User deleted successfully");
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .address(user.getAddress())
                .createdAt(user.getCreatedAt())
                .build();
    }

}
