package com.devansh.controller;

import com.devansh.exception.TokenInvalidException;
import com.devansh.exception.UserException;
import com.devansh.request.ChangePasswordRequest;
import com.devansh.request.UserUpdateRequest;
import com.devansh.response.MessageResponse;
import com.devansh.response.UserDto;
import com.devansh.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ===== USER ENDPOINTS =====

    @GetMapping("/user")
    public ResponseEntity<UserDto> getMyDetails(@RequestHeader("Authorization") String token) throws TokenInvalidException, UserException {
        return ResponseEntity.ok(userService.getMyDetails(token));
    }

    @PutMapping("/user")
    public ResponseEntity<UserDto> updateMyDetails(@RequestHeader("Authorization") String token, @RequestBody UserUpdateRequest request) throws UserException, TokenInvalidException {
        return ResponseEntity.ok(userService.updateMyDetails(token, request));
    }

    @PutMapping("/user/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ChangePasswordRequest request) throws UserException, TokenInvalidException {
        return ResponseEntity.ok(userService.changePassword(token, request));
    }

    // ===== ADMIN ENDPOINTS =====

    @GetMapping("/admin/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/users/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer userId) throws UserException {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/admin/users/{userId}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> request) throws UserException {
        String role = request.get("role");
        return ResponseEntity.ok(userService.updateUserRole(userId, role));
    }

    @GetMapping("/admin/users/count")
    public ResponseEntity<Map<String, Long>> getUsersCount() {
        return ResponseEntity.ok(Map.of("total", userService.getTotalUsersCount()));
    }

}
