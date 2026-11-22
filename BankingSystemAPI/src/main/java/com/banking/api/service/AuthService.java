package com.banking.api.service;

import com.banking.api.dto.RegisterRequest;
import com.banking.api.dto.LoginRequest;
import com.banking.api.dto.AuthResponse;

import com.banking.api.entity.Account;
import com.banking.api.entity.Role;
import com.banking.api.entity.AccountStatus;

import com.banking.api.repository.AccountRepository;
import com.banking.api.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (request.fullName() == null ||
                request.fullName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Full name is required"
            );
        }

        if (request.pin() == null ||
                !request.pin().matches("\\d{4,6}")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "PIN must contain 4 to 6 digits"
            );
        }

        String accountNumber = generateAccountNumber();

        Account account = new Account();

        account.setAccountNumber(accountNumber);
        account.setFullName(request.fullName().trim());

        // Never store the original PIN.
        account.setPinHash(
                passwordEncoder.encode(request.pin())
        );

        account.setBalance(BigDecimal.ZERO);
        account.setRole(Role.CUSTOMER);
        account.setStatus(AccountStatus.ACTIVE);
        account.setCreatedAt(LocalDateTime.now());

        Account savedAccount =
                accountRepository.save(account);

        String token = jwtService.generateToken(
                savedAccount.getAccountNumber(),
                savedAccount.getRole().name()
        );

        return new AuthResponse(
                token,
                "Bearer",
                savedAccount.getAccountNumber(),
                savedAccount.getFullName(),
                savedAccount.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {

        if (request.accountNumber() == null ||
                request.pin() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Account number and PIN are required"
            );
        }

        Account account = accountRepository
                .findByAccountNumber(request.accountNumber())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid account number or PIN"
                ));

        if (!passwordEncoder.matches(
                request.pin(),
                account.getPinHash()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid account number or PIN"
            );
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account is not active"
            );
        }

        String token = jwtService.generateToken(
                account.getAccountNumber(),
                account.getRole().name()
        );

        return new AuthResponse(
                token,
                "Bearer",
                account.getAccountNumber(),
                account.getFullName(),
                account.getRole().name()
        );
    }

    private String generateAccountNumber() {

        String accountNumber;

        do {
            accountNumber = "10" +
                    UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 10)
                            .toUpperCase();

        } while (accountRepository.existsByAccountNumber(
                accountNumber
        ));

        return accountNumber;
    }
}