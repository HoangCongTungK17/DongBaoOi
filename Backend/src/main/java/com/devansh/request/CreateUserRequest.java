package com.devansh.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        @NotBlank(message = "Fullname is required") String fullname,

        @NotBlank(message = "Email is required") @Email(message = "Email should be valid") String email,

        String phoneNumber,
        String address,

        @NotBlank(message = "Role is required") String role) {
}
