package com.banking.api.service;

import com.banking.api.entity.Account;
import com.banking.api.entity.AccountStatus;
import com.banking.api.entity.Transaction;

import com.banking.api.repository.AccountRepository;
import com.banking.api.repository.TransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public AccountService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public Account getAccount(String accountNumber) {
        return getActiveAccount(accountNumber);
    }

    public BigDecimal getBalance(String accountNumber) {

        Account account = getActiveAccount(accountNumber);

        return account.getBalance();
    }
    @Transactional
    public Account deposit(String accountNumber, BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Deposit amount must be greater than zero"
            );
        }

        Account account = accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active");
        }

        account.setBalance(account.getBalance().add(amount));

        return accountRepository.save(account);
    }

//    @Transactional
//    public BigDecimal deposit(
//            String accountNumber,
//            BigDecimal amount
//    ) {
//
//        validateAmount(amount);
//
//        Account account = getActiveAccount(accountNumber);
//
//        account.setBalance(account.getBalance().add(amount));
//
//        accountRepository.save(account);
//
//        saveTransaction(
//                accountNumber,
//                null,
//                amount,
//                "DEPOSIT",
//                "Money deposited"
//        );
//
//        return account.getBalance();
//    }

    @Transactional
    public BigDecimal withdraw(
            String accountNumber,
            BigDecimal amount
    ) {

        validateAmount(amount);

        Account account = getActiveAccount(accountNumber);

        if (account.getBalance().compareTo(amount) < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient balance"
            );
        }

        account.setBalance(account.getBalance().subtract(amount));

        accountRepository.save(account);

        saveTransaction(
                accountNumber,
                null,
                amount,
                "WITHDRAW",
                "Money withdrawn"
        );

        return account.getBalance();
    }

    @Transactional
    public void transfer(
            String fromAccountNumber,
            String toAccountNumber,
            BigDecimal amount
    ) {

        validateAmount(amount);

        if (fromAccountNumber.equals(toAccountNumber)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot transfer to the same account"
            );
        }

        Account sender = getActiveAccount(fromAccountNumber);
        Account receiver = getActiveAccount(toAccountNumber);

        if (sender.getBalance().compareTo(amount) < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient balance"
            );
        }

        sender.setBalance(sender.getBalance().subtract(amount));

        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        saveTransaction(
                fromAccountNumber,
                toAccountNumber,
                amount,
                "TRANSFER_SENT",
                "Money transferred"
        );

        saveTransaction(
                toAccountNumber,
                fromAccountNumber,
                amount,
                "TRANSFER_RECEIVED",
                "Money received"
        );
    }

    private Account getActiveAccount(String accountNumber) {

        Account account = accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Account not found"
                ));

        if (account.getStatus() != AccountStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account is not active"
            );
        }

        return account;
    }

    private void validateAmount(BigDecimal amount) {

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Amount must be greater than zero"
            );
        }
    }

    private void saveTransaction(
            String accountNumber,
            String relatedAccount,
            BigDecimal amount,
            String type,
            String description
    ) {

        Transaction transaction = new Transaction();

        transaction.setAccountNumber(accountNumber);
        transaction.setRelatedAccount(relatedAccount);
        transaction.setAmount(amount);
        transaction.setTransactionType(type);
        transaction.setDescription(description);
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);
    }
}