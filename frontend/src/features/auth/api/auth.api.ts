import i18n from "i18next";
import { LoginInput, RegisterInput } from "@/features/auth/schemas/auth.schema";
import { APIResponse, AuthResponseData } from "@/features/auth/types";

export const authApi = {
  login: async (input: LoginInput): Promise<APIResponse<AuthResponseData>> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok) {
      const err: any = new Error();
      err.status = response.status;
      throw err;
    }
    return data;
  },

  register: async (input: Omit<RegisterInput, "confirmPassword">): Promise<APIResponse<AuthResponseData>> => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || i18n.t("register_failed"));
    }
    return data;
  },

  checkStatus: async (): Promise<APIResponse<{ user: any }>> => {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || i18n.t("auth_failed"));
    }
    return data;
  },

  logout: async (): Promise<APIResponse<void>> => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || i18n.t("logout_failed"));
    }
    return data;
  },
};
