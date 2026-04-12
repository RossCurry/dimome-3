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
