import { apiJson } from "@/api/client";

export type LoginResponse = {
  token: string;
  userId: string;
  venueId: string;
};

/**
 * Authenticate with email/password and return session token plus user/venue ids.
 */
export function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    showErrorSnack: false,
  });
}

/**
 * Create owner account; returns the same session shape as login. Failures use the global API snackbar.
 */
export function registerRequest(
  email: string,
  password: string,
  businessName: string,
): Promise<LoginResponse> {
  return apiJson<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, businessName }),
  });
}
