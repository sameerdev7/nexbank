const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8180";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("bankToken");
}

export function setToken(token: string) {
  localStorage.setItem("bankToken", token);
}

export function clearToken() {
  localStorage.removeItem("bankToken");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

// Auth
export const auth = {
  register: (data: { name: string; email: string; password: string; address: string; phoneNumber: string; countryCode: string }) =>
    request("/api/users/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { identifier: string; password: string }) =>
    request<{ token: string }>("/api/users/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request("/api/users/logout"),
  generateOtp: (data: { identifier: string }) =>
    request("/api/users/generate-otp", { method: "POST", body: JSON.stringify(data) }),
  verifyOtp: (data: { identifier: string; otp: string }) =>
    request<{ token: string }>("/api/users/verify-otp", { method: "POST", body: JSON.stringify(data) }),
};

// Dashboard
export const dashboard = {
  getUser: () => request<any>("/api/dashboard/user"),
  getAccount: () => request<{ accountNumber: string; balance: number; accountType: string; branch: string; ifscCode: string }>("/api/dashboard/account"),
};

// Account
export const account = {
  checkPin: () => request<any>("/api/account/pin/check"),
  createPin: (data: { pin: string; password: string }) =>
    request("/api/account/pin/create", { method: "POST", body: JSON.stringify(data) }),
  updatePin: (data: { oldPin: string; newPin: string; password: string }) =>
    request("/api/account/pin/update", { method: "POST", body: JSON.stringify(data) }),
  deposit: (data: { amount: number; pin: string }) =>
    request("/api/account/deposit", { method: "POST", body: JSON.stringify(data) }),
  withdraw: (data: { amount: number; pin: string }) =>
    request("/api/account/withdraw", { method: "POST", body: JSON.stringify(data) }),
  fundTransfer: (data: { targetAccountNumber: string; amount: number; pin: string }) =>
    request("/api/account/fund-transfer", { method: "POST", body: JSON.stringify(data) }),
  getTransactions: () => request<any[]>("/api/account/transactions"),
  sendStatement: () => request("/api/account/send-statement"),
};
