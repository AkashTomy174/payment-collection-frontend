export type Customer = {
  id: number;
  account_number: string;
  issue_date: string;
  interest_rate: string;
  tenure_months: number;
  emi_due: string;
  paid_installments: number;
  payments_left: number;
  total_amount_to_be_paid: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  account_number: string;
  role: "customer" | "admin";
};

export type AuthSession = {
  token: string;
  user: AuthUser;
  customer: Customer | null;
};

export type Payment = {
  id: number;
  customer_id: number;
  transaction_reference: string;
  payment_date: string;
  payment_amount: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
};

export type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
