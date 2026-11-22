# Banking Frontend

React + TypeScript frontend for the Spring Boot Banking System API.

## Requirements
- Node.js 20 or later
- Spring Boot API running at `http://localhost:8081`

## Run locally
```bash
npm install
cp .env.example .env
npm run dev
```
On Windows PowerShell, copy the environment file with:
```powershell
Copy-Item .env.example .env
```
Open `http://localhost:5173`.

## Backend endpoints expected
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register customer |
| POST | `/api/auth/login` | Login |
| GET | `/api/accounts/balance` | Current account balance |
| POST | `/api/accounts/deposit` | Deposit |
| POST | `/api/accounts/withdraw` | Withdraw |
| POST | `/api/accounts/transfer` | Transfer |
| GET | `/api/transactions/history` | Transaction history |

The frontend assumes:
- Login/register return `token`, `tokenType`, `accountNumber`, `fullName`, and `role`.
- Balance returns `{ "accountNumber": "...", "balance": 0.00 }`.
- Transfer accepts `{ "toAccountNumber": "...", "amount": 100 }`.
- Deposit and withdrawal accept `{ "amount": 100 }`.
- Transaction history returns an array with `id`, `amount`, `transactionType`, `description`, `relatedAccount`, and `createdAt`.

Adjust the endpoint paths or request field names in `src/pages` if your backend uses different contracts.

## Important security note
This is a learning-project frontend. It stores the JWT in `sessionStorage`, which is accessible to JavaScript and therefore vulnerable if the site has an XSS vulnerability. For production, prefer a backend-managed secure, HttpOnly, SameSite cookie and implement CSRF protections appropriate to that design. Never commit real credentials or secrets.

## CORS
If the browser blocks requests, configure CORS in Spring Boot to allow `http://localhost:5173` for the required API routes and the `Authorization` and `Content-Type` headers.
