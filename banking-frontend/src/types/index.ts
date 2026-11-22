export interface AuthResponse {
  token: string;
  tokenType: string;
  accountNumber: string;
  fullName: string;
  role: string;
}

export interface AccountBalance {
  accountNumber: string;
  balance: number;
}

export interface BankTransaction {
  id: number;
  accountNumber?: string;
  amount: number;
  transactionType: string;
  description?: string;
  relatedAccount?: string;
  createdAt: string;
}

export interface ApiError {
  message?: string;
}