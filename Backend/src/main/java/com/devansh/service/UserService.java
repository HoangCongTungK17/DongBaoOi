package com.devansh.service;

import com.devansh.exception.TokenInvalidException;
import com.devansh.exception.UserAlreadyExistException;
import com.devansh.exception.UserException;
import com.devansh.model.User;
import com.devansh.request.ChangePasswordRequest;
import com.devansh.request.UserUpdateRequest;
import com.devansh.response.MessageResponse;
import com.devansh.response.UserDto;

import java.util.List;

public interface UserService {

    User findByJwtToken(String token) throws UserException, TokenInvalidException;

    UserDto getMyDetails(String token) throws UserException, TokenInvalidException;

    UserDto updateMyDetails(String token, UserUpdateRequest request) throws UserException, TokenInvalidException;

    MessageResponse changePassword(String token, ChangePasswordRequest request)
            throws UserException, TokenInvalidException;

    // Admin methods
    List<UserDto> getAllUsers();

    UserDto getUserById(Integer userId) throws UserException;

    UserDto updateUserRole(Integer userId, String role) throws UserException;

    long getTotalUsersCount();

    // Admin CRUD operations
    UserDto createUser(String fullname, String email, String phoneNumber, String address, String role)
            throws UserException, UserAlreadyExistException;

    UserDto updateUser(Integer userId, UserUpdateRequest request) throws UserException;

    MessageResponse deleteUser(Integer userId) throws UserException;
}
