import { create } from "zustand";
import { authApi } from "../api/authApi";
import { governmentAuthApi } from "../api/governmentAuthApi";
import { usersApi } from "../api/usersApi";
import { apiErrorMessage } from "../lib/apiError";

const useAuthStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────
  user: JSON.parse(localStorage.getItem("user") || "null"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,
  error: null,

  // ── Actions ────────────────────────────────────────────────────

  /**
   * Store tokens + user after login or register.
   */
  _setSession: (data) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    const r = String(data.user?.role || "");
    if (r.startsWith("gov_") || r === "system_admin") {
      sessionStorage.removeItem("rd_gov_2fa_verified");
      sessionStorage.removeItem("rd_admin_2fa_verified");
    }
    set({ user: data.user, isAuthenticated: true, error: null });
  },

  /**
   * Register a new account.
   */
  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(formData);
    } catch (err) {
      const message =
        apiErrorMessage(err, "Registration failed. Please try again.");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Log in with email + password.
   */
  governmentLogin: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    const emailTrim = String(email ?? "").trim();
    try {
      const data = await governmentAuthApi.login({ email: emailTrim, password });
      get()._setSession(data);
      return data;
    } catch (err) {
      const message = apiErrorMessage(err, "Government sign-in failed.");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshSessionUser: async () => {
    try {
      const user = await usersApi.getMe();
      if (user?.id) {
        get().updateUser(user);
        return user;
      }
    } catch {
      /* keep cached user if profile fetch fails */
    }
    return get().user;
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    const emailTrim = String(email ?? "").trim();
    try {
      const data = await authApi.login({ email: emailTrim, password });
      get()._setSession(data);
      await get().refreshSessionUser();
      return { ...data, user: get().user };
    } catch (err) {
      const message = apiErrorMessage(err, "Login failed. Check your credentials.");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  /** Session from POST /auth/privy (Google / Apple / email + embedded Sui wallet). */
  loginWithPrivy: async (sessionData) => {
    set({ isLoading: true, error: null });
    try {
      get()._setSession(sessionData);
      await get().refreshSessionUser();
      return { ...sessionData, user: get().user };
    } catch (err) {
      const message = apiErrorMessage(err, "Privy sign-in failed.");
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /** Session from POST /auth/firebase (legacy fallback). */
  loginWithFirebase: async (sessionData) => {
    set({ isLoading: true, error: null });
    try {
      get()._setSession(sessionData);
      await get().refreshSessionUser();
      return { ...sessionData, user: get().user };
    } catch (err) {
      const message = apiErrorMessage(err, "Social sign-in failed.");
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Log out — clears session locally and invalidates server-side token.
   */
  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore server errors on logout — clear locally regardless
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("rd_admin_2fa_verified");
      sessionStorage.removeItem("rd_gov_2fa_verified");
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  /**
   * Update the stored user profile (e.g. after profile edit).
   */
  updateUser: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearError: () => set({ error: null }),

  /** PATCH-style merge for name / phone / role (requires access token). */
  updateProfileRemote: async (partial) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersApi.putMe(partial);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, error: null });
      return user;
    } catch (err) {
      const message = apiErrorMessage(err, "Could not update profile.");
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;