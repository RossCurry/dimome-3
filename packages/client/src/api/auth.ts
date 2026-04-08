import { apiJson } from "@/api/client";

export type LoginResponse = {
  token: string;
  userId: string;
  venueId: string;
};

export function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiJson<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
