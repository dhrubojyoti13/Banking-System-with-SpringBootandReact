# Database Design

## 1. Purpose
This document describes the known logical data model for the Banking System. The application uses MySQL with Spring Data JPA and Hibernate.

The known primary entities are:
- `Account`
- `Transaction`

The exact table names, SQL types, constraints, indexes, and foreign keys depend on the current JPA entity annotations and generated schema. Verify these details in `Account.java`, `Transaction.java`, and MySQL before treating the illustrative SQL as the exact deployed schema.

## 2. Database Configuration

Expected local database:

```sql
CREATE DATABASE banking_system_api;
```

Expected connection pattern:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/banking_system_api
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

Keep credentials outside source control.

## 3. Logical Entities

### 3.1 Account
Represents a customer banking account.

| Attribute | Meaning |
|---|---|
| `id` | Entity primary key |
| `accountNumber` | Customer-facing account identifier |
| `fullName` | Customer name |
| `pinHash` | BCrypt hash of customer PIN |
| `balance` | Account balance |
| `role` | Role such as ADMIN or CUSTOMER |
| `status` | Status such as ACTIVE or FROZEN |
| `createdAt` | Account creation timestamp |

Design recommendations:
- Make `accountNumber` unique and indexed.
- Store only the PIN hash, never the raw PIN.
- Use Java `BigDecimal` and SQL `DECIMAL` for money.
- Define currency and allowed decimal scale.
- Enforce rules in application logic and database constraints.

### 3.2 Transaction
Represents a recorded banking operation.

| Attribute | Meaning |
|---|---|
| `id` | Transaction primary key |
| `accountNumber` | Account associated with the transaction |
| `relatedAccount` | Other account involved, when applicable |
| `amount` | Transaction amount |
| `transactionType` | Type of operation |
| `description` | Human-readable description |
| `createdAt` | Transaction timestamp |

Design recommendations:
- Index `accountNumber` for transaction-history queries.
- Use fixed-precision decimal values for `amount`.
- Keep transaction records append-only where practical.
- Decide whether a transfer creates one transaction or separate debit and credit records. A ledger model provides stronger traceability.

## 4. Logical Relationship

The known fields suggest a one-to-many logical association between an account and its transactions:

```text
+-----------------------+
|        ACCOUNT        |
+-----------------------+
| PK id                 |
| UQ account_number     |
|    full_name          |
|    pin_hash           |
|    balance            |
|    role                |
|    status              |
|    created_at          |
+-----------+-----------+
            |
            | 1 to many (logical association)
            |
+-----------v-----------+
|      TRANSACTION      |
+-----------------------+
| PK id                 |
|    account_number     |
|    related_account    |
|    amount             |
|    transaction_type   |
|    description        |
|    created_at         |
+-----------------------+
```

This is a logical relationship based on the known fields. Confirm whether JPA maps a real foreign key or stores only an account-number string.

## 5. Illustrative SQL Schema

This is a design example, not a migration guaranteed to match Hibernate's current schema. Review it before applying to an existing database.

```sql
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(32) NOT NULL,
    related_account VARCHAR(32),
    amount DECIMAL(19, 2) NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    INDEX idx_transactions_account_created
        (account_number, created_at)
);
```

If Hibernate `ddl-auto=update` is enabled, its generated schema may differ. For controlled deployments, use Flyway or Liquibase migrations and schema validation.

## 6. Data Integrity Rules
Recommended rules:
1. Account numbers must be unique and non-null.
2. Accounts must have valid roles and statuses.
3. Monetary amounts must use fixed-precision decimal types.
4. Deposits and withdrawals must have positive amounts.
5. Withdrawals must not create a negative available balance.
6. A transfer must debit and credit accounts atomically.
7. Customers must not access another customer's account by changing a request parameter.
8. Transaction history should not be silently overwritten or deleted.
9. Use a consistent timestamp policy, preferably UTC in storage.

## 7. Transaction Processing and Concurrency
A read-calculate-save balance workflow can lose updates when concurrent requests modify the same account.

Recommended approach:
- Use `@Transactional` for the complete operation.
- Use optimistic locking (`@Version`) or pessimistic write locking.
- Validate account status and available balance inside the transaction.
- Update sender and recipient in the same database transaction.
- Add an idempotency key with a unique constraint to prevent duplicate retry processing.
- Test concurrent withdrawals and transfers.

## 8. Recommended Future Ledger Model
For a more realistic financial design, add a double-entry ledger rather than relying only on a mutable account balance and one transaction row.

### `ledger_transactions`

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `reference` | Unique business transaction reference |
| `idempotency_key` | Unique request key, where applicable |
| `transaction_type` | Deposit, withdrawal, transfer, etc. |
| `status` | Pending, posted, reversed, failed |
| `description` | Operation description |
| `created_at` | Creation timestamp |

### `ledger_entries`

| Column | Purpose |
|---|---|
| `id` | Primary key |
| `ledger_transaction_id` | Parent ledger transaction |
| `account_id` | Account affected |
| `entry_type` | DEBIT or CREDIT |
| `amount` | Positive decimal amount |
| `created_at` | Entry timestamp |

Example transfer of 100.00 from Account A to Account B:

```text
Ledger transaction: TRANSFER-REFERENCE

Account A: DEBIT  100.00
Account B: CREDIT 100.00

Total debits = Total credits
```

Commit the ledger transaction and its entries atomically. Enforce balanced postings in the service/domain layer and test the invariant.

## 9. Indexing Recommendations

| Table | Index | Query supported |
|---|---|---|
| `accounts` | Unique index on `account_number` | Account lookup and login |
| `transactions` | `(account_number, created_at)` | Account transaction history |
| `ledger_transactions` | Unique `reference` | Transaction lookup |
| `ledger_transactions` | Unique `idempotency_key` | Duplicate request prevention |
| `ledger_entries` | `(account_id, created_at)` | Account ledger history |

Validate indexes against real query patterns using `EXPLAIN`; indexes add write and storage overhead.

## 10. Backup, Migration, and Privacy
- Use Flyway or Liquibase for repeatable schema changes.
- Back up regularly and test restoration.
- Do not commit database dumps containing personal or financial data.
- Use synthetic test data in development.
- Restrict database users to the minimum required privileges.
- Define retention and deletion policies for personal data and audit records.

## 11. Verification Checklist
Before publishing this as an exact schema description, verify:
- [ ] Actual table names in MySQL.
- [ ] Actual column names and SQL types.
- [ ] Primary keys and unique constraints.
- [ ] Whether transaction/account relationships use foreign keys.
- [ ] Whether money fields use `BigDecimal` and `DECIMAL`.
- [ ] Whether deposit, withdrawal, and transfer use `@Transactional`.
- [ ] Whether concurrent updates use locking/versioning.
- [ ] Whether transaction history is indexed and paginated.
