import Constants from "expo-constants";
import type { AuthSession, Customer, Pagination, Payment } from "../types";

const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string) ?? "http://localhost:3000";
let authToken = "";

export function setAuthToken(token: string) {
  authToken = token;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const body = await response.json();

  if (!response.ok || body.success === false) {
    throw new Error(body.message ?? "Request failed");
  }

  return body;
}

export async function register(input: { name: string; email: string; password: string; accountNumber: string }) {
  return request<AuthSession & { success: true }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function login(input: { email: string; password: string }) {
  return request<AuthSession & { success: true }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCustomer(accountNumber: string) {
  const body = await request<{ data: Customer }>(`/api/customers/${encodeURIComponent(accountNumber)}`);
  return body.data;
}

export async function makePayment(accountNumber: string, amount: number) {
  const body = await request<{ data: Payment; message: string }>("/api/payments", {
    method: "POST",
    body: JSON.stringify({ accountNumber, amount }),
  });
  return body.data;
}

export async function getPayments(accountNumber: string, page = 1) {
  const body = await request<{ data: Payment[]; pagination: Pagination }>(
    `/api/payments/${encodeURIComponent(accountNumber)}?page=${page}&limit=10&sort=payment_date&order=desc`
  );
  return body;
}
