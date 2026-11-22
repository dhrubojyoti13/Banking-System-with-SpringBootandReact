# System Architecture

## 1. Purpose
This document describes the known architecture of the Banking System: a React/TypeScript frontend, a Spring Boot REST API, and a MySQL database. It reflects the project structure and configuration discussed during development. Verify details against the current source before treating this as an exact implementation specification.

## 2. High-Level Architecture

```text
+------------------------------+
| Browser                      |
| React 18 + TypeScript + Vite |
| Pages / Components / Context |
+---------------+--------------+
                |
                | HTTP + JSON
                | Authorization: Bearer <JWT>
                v
+------------------------------+
| Spring Boot REST API         |
| Security Filter Chain        |
| Controllers                  |
| Services                     |
| Repositories                 |
+---------------+--------------+
                |
                | Spring Data JPA
                | Hibernate ORM
                v
+------------------------------+
| MySQL                        |
| Accounts / Transactions      |
+------------------------------+
```

## 3. Components

### 3.1 Frontend
The frontend is a React application written in TypeScript and built with Vite.

Responsibilities:
- Render registration, login, dashboard, and banking workflow screens.
- Maintain authentication state through the authentication context.
- Navigate with React Router.
- Call backend endpoints through Axios.
- Attach the JWT bearer token to protected API requests.
- Display user-facing success and error messages.

Relevant directories:
| Directory/file | Responsibility |
|---|---|
| `pages/` | Route-level screens |
| `components/` | Reusable UI components |
| `context/AuthContext.tsx` | Authentication state and actions |
| `services/api.ts` | Axios configuration and interceptors |
| `types/` | TypeScript types and interfaces |

### 3.2 Backend
The backend is a Java 21 application using Spring Boot 3.5.x. The package root is `com.banking.api`.

| Package | Responsibility |
|---|---|
| `config/` | Security and CORS configuration |
| `controller/` | REST request and response handling |
| `dto/` | Request and response objects |
| `entity/` | JPA entities |
| `repository/` | Spring Data JPA persistence interfaces |
| `service/` | Application and banking business logic |
| `security/` | JWT service and authentication filter |
| `exception/` | Intended location for centralized exception handling |

### 3.3 Database
MySQL stores application data. Spring Data JPA and Hibernate map Java entities to relational tables. The known domain entities are `Account` and `Transaction`. Exact physical schema details must be confirmed from entity annotations and the database.

## 4. Request Flows

### 4.1 Registration

```text
Browser
  | POST /api/auth/register { fullName, pin }
  v
AuthController
  v
AuthService
  |-- Validate input
  |-- Hash PIN using BCrypt
  |-- Create customer account
  |-- Save account
  |-- Issue JWT
  v
AccountRepository -> MySQL
  |
  v
AuthResponse -> Browser
```

The raw PIN should never be persisted, logged, or returned.

### 4.2 Login

```text
Browser
  | POST /api/auth/login { accountNumber, pin }
  v
AuthController -> AuthService
  |-- Find account by account number
  |-- Verify PIN using BCrypt
  |-- Check account status
  |-- Generate JWT
  v
AuthResponse -> Browser
```

The frontend currently keeps authentication state in session storage. For production, assess secure HttpOnly cookie handling and the corresponding CSRF strategy.

### 4.3 Protected API Request

```text
Browser
  | Request + Authorization: Bearer <JWT>
  v
JwtAuthenticationFilter
  |-- Extract token
  |-- Validate token
  |-- Establish authenticated principal
  v
Spring Security authorization
  v
Controller -> Service -> Repository -> MySQL
  v
HTTP response
```

Frontend route protection is not a security boundary. Every protected operation must be authorized by the backend, including checks that the authenticated customer owns the requested account.

### 4.4 Financial Operation
A deposit, withdrawal, or transfer should be processed by the service layer. A transfer must debit the sender and credit the recipient atomically. Use database transactions, concurrency control, and idempotency before considering such workflows reliable under concurrent requests or retries.

## 5. Security Architecture
Current security concepts include:
- Spring Security filter chain.
- Stateless session policy.
- JWT authentication filter.
- BCrypt PIN hashing.
- `ADMIN` and `CUSTOMER` roles.
- Public registration and login endpoints.
- Protected endpoints for authenticated users.
- CORS allow-list for the local frontend origin.

Production hardening to consider:
- HTTPS/TLS.
- Secret storage and key rotation.
- Short-lived access tokens and refresh-token rotation/revocation.
- Rate limiting and account lockout policies.
- Strict request validation.
- Audit logs for sensitive operations.
- Account ownership checks on every operation.
- Secure token storage and an appropriate CSRF strategy.
- Dependency and vulnerability scanning.

## 6. Reliability and Consistency
Financial operations need stronger guarantees than ordinary CRUD.

Recommended controls:
1. Use Java `BigDecimal` and a defined currency/scale policy.
2. Use `@Transactional` around multi-record operations.
3. Use optimistic locking (`@Version`) or pessimistic database locking.
4. Validate positive amounts, account status, and available balance inside the transaction.
5. Use idempotency keys to prevent duplicate operations after retries.
6. Consider immutable ledger entries as the source of truth.
7. Test concurrent withdrawals and failed transfers.

## 7. Deployment View

### Local development
| Component | Expected address |
|---|---|
| React frontend | `http://localhost:5173` |
| Spring Boot API | `http://localhost:8081` |
| MySQL | `localhost:3306` |

Confirm these values in Vite, Axios, and `application.properties`.

### Suggested future deployment

```text
Internet
   |
HTTPS Load Balancer / Reverse Proxy
   |
   +--------------------+
   |                    |
Frontend Hosting     Spring Boot API
                         |
                    Managed MySQL
```

A later deployment can add containers, managed secrets, centralized logs, metrics, alerting, backups, and automated migrations.

## 8. Architecture Decisions

| Decision | Reason |
|---|---|
| React + TypeScript | Component-based UI and static type checking |
| Spring Boot REST API | Clear backend API boundary |
| Layered backend | Separation of HTTP, business, and persistence concerns |
| MySQL | Relational storage for account and transaction data |
| Spring Data JPA | Repository abstraction and ORM integration |
| JWT | Stateless API authentication model |
| BCrypt | One-way PIN hashing |

## 9. Known Boundaries
This is a portfolio/learning application. Using banking terminology or JWT does not make it production-ready. Regulatory compliance, operational resilience, fraud controls, disaster recovery, secure key management, and independent security review are outside the documented scope.

## 10. Future Architecture Improvements
- Introduce a double-entry ledger as the source of truth for money movement.
- Consider an outbox pattern if reliable asynchronous event publishing is added.
- Cache only suitable read-heavy data; do not use cache as the authoritative balance store.
- Add structured logs, metrics, tracing, and health checks.
- Add CI, security scanning, and repeatable deployment.
- Prefer a well-structured modular monolith until service decomposition has a clear scaling or ownership benefit.
