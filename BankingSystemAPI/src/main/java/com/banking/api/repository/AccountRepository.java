package com.banking.api.repository;

import com.banking.api.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository
        extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(String accountNumber);

    boolean existsByAccountNumber(String accountNumber);
}

//
//package com.banking.api.repository;
//
//import com.banking.api.entity.Account;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.Optional;
//
//public interface AccountRepository
//        extends JpaRepository<Account, Long> {
//
//    Optional<Account> findByAccountNumber(String accountNumber);
//
//    Optional<Account> findByAccountNumberAndStatus(
//            String accountNumber,
//            com.banking.api.entity.AccountStatus status
//    );
//
//    boolean existsByAccountNumber(String accountNumber);
//}
