package com.banking.api.dto;

public record AuthResponse(
        String token,
        String tokenType,
        String accountNumber,
        String fullName,
        String role
) {
}