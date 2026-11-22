package com.banking.api.controller;

import com.banking.api.dto.DepositRequest;
import com.banking.api.service.AccountService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/balance")
    public Map<String, Object> getBalance(
            Authentication authentication
    ) {

        String accountNumber = authentication.getName();

        BigDecimal balance =
                accountService.getBalance(accountNumber);

        return Map.of(
                "accountNumber", accountNumber,
                "balance", balance
        );
    }
    //-----
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(
            @RequestBody DepositRequest request,
            Authentication authentication) {

        var account = accountService.deposit(
                authentication.getName(),
                request.amount()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Deposit successful",
                "accountNumber", account.getAccountNumber(),
                "balance", account.getBalance()
        ));
    }
}