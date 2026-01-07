package com.devansh.response;

import com.devansh.model.enums.Role;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record UserDto(
        Integer id,
        String email,
        String phoneNumber,
        String fullname,
        String address,
        Role role,
        LocalDateTime createdAt
) {
}
