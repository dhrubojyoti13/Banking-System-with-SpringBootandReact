package com.banking.api.dto;

public record LoginRequest(
        String accountNumber,
        String pin
) {
}