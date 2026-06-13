import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import i18n from "i18next";
import { AuthState, AuthResponseData, User } from "../types";
import { authApi } from "../api/auth.api";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (input: LoginInput, { rejectWithValue }) => {
    try {
      const response = await authApi.login(input);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || i18n.t("loginFailed"));
      }
    } catch (error: any) {
      if (error.status === 401) {
        return rejectWithValue(i18n.t("invalidCredentials"));
      }
      return rejectWithValue(error.message || i18n.t("serverConnectionError"));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (input: RegisterInput, { rejectWithValue }) => {
    try {
      const { confirmPassword, ...registerPayload } = input;
      const response = await authApi.register(registerPayload);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || i18n.t("registerFailed"));
      }
    } catch (error: any) {
      return rejectWithValue(error.message || i18n.t("serverConnectionError"));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
    } catch (error: any) {
      return rejectWithValue(error.message || i18n.t("logoutFailed"));
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  "auth/checkStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.checkStatus();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || i18n.t("authFailed"));
      }
    } catch (error: any) {
      return rejectWithValue(error.message || i18n.t("notLoggedIn"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponseData>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string || null;
      })

      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<{ user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isInitialized = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isInitialized = true;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
