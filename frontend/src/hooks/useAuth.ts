import { useEffect, useState } from "react";
import { isAxiosError } from "axios";

import {
  checkEmailExists as checkAuthEmailExists,
  clearStoredAccessToken,
  fetchCurrentUser,
  getStoredAccessToken,
  loginWithEmailPassword,
  registerCurrentUserRole,
  signupWithEmailPassword,
  storeAccessToken,
} from "../api/auth";
import { submitCustomerSignup, submitDriverSignup } from "../api/signup";
import type { Role, User } from "../types/auth";
import type { SignupDetails } from "../types/signup";

const PENDING_SIGNUP_KEY = "pending_signup_profile";

type PendingSignupProfile =
  | {
      role: "driver";
      email: string;
      driver_name: string;
    }
  | {
      role: "customer";
      email: string;
      customer_name: string;
      billing_address?: string;
      phone_number: string;
      street_address: string;
      city: string;
      state: string;
      zipcode: string;
    };

type UseAuthResult = {
  user: User | null;
  hydrating: boolean;
  loading: boolean;
  error: string | null;
  notice: string | null;
  checkEmailExists: (email: string) => Promise<boolean>;
  login: (email: string, password: string, loginType: Role) => Promise<void>;
  signupWithProfile: (payload: SignupDetails) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    async function hydrateSession() {
      const token = getStoredAccessToken();
      if (!token) {
        setHydrating(false);
        return;
      }

      try {
        await loadCurrentUser();
      } catch {
        clearStoredAccessToken();
        setUser(null);
      } finally {
        setHydrating(false);
      }
    }

    hydrateSession();
  }, []);

  async function loadCurrentUser() {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  function clearMessages() {
    setError(null);
    setNotice(null);
  }

  async function runWithLoading(task: () => Promise<void>, fallbackError: string) {
    clearMessages();
    setLoading(true);

    try {
      await task();
    } catch (e) {
      const message = extractErrorMessage(e, fallbackError);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    clearMessages();

    try {
      await loadCurrentUser();
    } catch (e) {
      const message = extractErrorMessage(e, "Backend verify failed");
      setError(message);
    }
  }

  function extractErrorMessage(error: unknown, fallbackError: string): string {
    if (isAxiosError<{ detail?: string }>(error)) {
      const detail = error.response?.data?.detail;
      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }
      return error.message || fallbackError;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallbackError;
  }

  async function login(email: string, password: string, loginType: Role) {
    await runWithLoading(async () => {
      const accessToken = await loginWithEmailPassword(email, password);
      storeAccessToken(accessToken);
      let currentUser = await loadCurrentUser();
      const roleFromMetadata = currentUser.user_metadata?.role;
      if (!currentUser.role && roleFromMetadata) {
        await registerCurrentUserRole(roleFromMetadata);
        currentUser = await loadCurrentUser();
      }

      if (currentUser.role !== loginType) {
        clearStoredAccessToken();
        setUser(null);
        throw new Error(
          `This account is registered as ${currentUser.role ?? "unknown"}. Switch to ${currentUser.role ?? "the correct"} login.`,
        );
      }

      await completePendingSignupProfile(currentUser, email);
    }, "Login failed");
  }

  async function checkEmailExists(email: string): Promise<boolean> {
    return checkAuthEmailExists(email.trim().toLowerCase());
  }

  async function signupWithProfile(payload: SignupDetails) {
    await runWithLoading(async () => {
      savePendingSignupProfile(payload);
      const accessToken = await signupWithEmailPassword(
        payload.email,
        payload.password,
        payload.role,
      );
      if (accessToken) {
        storeAccessToken(accessToken);
        await registerCurrentUserRole(payload.role);

        if (payload.role === "driver") {
          await submitDriverSignup({ driver_name: payload.driver_name });
        } else {
          await submitCustomerSignup({
            customer_name: payload.customer_name,
            billing_address: payload.billing_address,
            phone_number: payload.phone_number,
            street_address: payload.street_address,
            city: payload.city,
            state: payload.state,
            zipcode: payload.zipcode,
          });
        }

        clearPendingSignupProfile();
        await loadCurrentUser();
        return;
      }

      setNotice(
        "Signup successful. Confirm email and sign in to complete profile sync.",
      );
    }, "Signup failed");
  }

  function savePendingSignupProfile(payload: SignupDetails) {
    const pendingProfile: PendingSignupProfile =
      payload.role === "driver"
        ? {
            role: payload.role,
            email: payload.email,
            driver_name: payload.driver_name,
          }
        : {
            role: payload.role,
            email: payload.email,
            customer_name: payload.customer_name,
            billing_address: payload.billing_address,
            phone_number: payload.phone_number,
            street_address: payload.street_address,
            city: payload.city,
            state: payload.state,
            zipcode: payload.zipcode,
          };

    localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(pendingProfile));
  }

  function clearPendingSignupProfile() {
    localStorage.removeItem(PENDING_SIGNUP_KEY);
  }

  function getPendingSignupProfile(): PendingSignupProfile | null {
    const raw = localStorage.getItem(PENDING_SIGNUP_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PendingSignupProfile;
    } catch {
      return null;
    }
  }

  async function completePendingSignupProfile(currentUser: User, loginEmail: string) {
    const pending = getPendingSignupProfile();
    if (!pending) return;

    if (pending.email.toLowerCase() !== loginEmail.toLowerCase()) return;
    if (currentUser.role !== pending.role) return;

    if (pending.role === "driver") {
      await submitDriverSignup({ driver_name: pending.driver_name });
    } else {
      await submitCustomerSignup({
        customer_name: pending.customer_name,
        billing_address: pending.billing_address,
        phone_number: pending.phone_number,
        street_address: pending.street_address,
        city: pending.city,
        state: pending.state,
        zipcode: pending.zipcode,
      });
    }

    clearPendingSignupProfile();
  }

  function logout() {
    clearStoredAccessToken();
    setUser(null);
    setError(null);
    setNotice(null);
  }

  return {
    user,
    hydrating,
    loading,
    error,
    notice,
    checkEmailExists,
    login,
    signupWithProfile,
    refreshUser,
    logout,
  };
}
