package com.banking.api.dto;

public record RegisterRequest(
        String fullName,
        String pin
) {
}