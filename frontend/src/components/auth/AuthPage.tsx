import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/image.jpeg";
import driverPic from "../../assets/Garbage_Men.jpeg";
import customerPic from "../../assets/Customer.jpeg";
import type { Role } from "../../types/auth";

type AuthPageProps = {
  loading: boolean;
  error: string | null;
  notice: string | null;
  onCheckEmail: (email: string) => Promise<boolean>;
  onLogin: (email: string, password: string, loginType: Role) => Promise<void>;
};

export function AuthPage({
  loading,
  error,
  notice,
  onCheckEmail,
  onLogin,
}: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"driver" | "customer">("driver");
  const [emailVerified, setEmailVerified] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const canSubmit = Boolean(email.trim() && password.trim() && emailVerified);

  async function handleCheckEmail() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setLocalError("Email is required.");
      return;
    }

    setCheckingEmail(true);
    setLocalError(null);

    try {
      const exists = await onCheckEmail(normalizedEmail);
      if (!exists) {
        setEmailVerified(false);
        setPassword("");
        setLocalError("Email does not exist.");
        return;
      }

      setEmail(normalizedEmail);
      setEmailVerified(true);
    } catch (e) {
      setEmailVerified(false);
      setPassword("");
      setLocalError(e instanceof Error ? e.message : "Failed to verify email");
    } finally {
      setCheckingEmail(false);
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailVerified) {
      await handleCheckEmail();
      return;
    }
    await onLogin(email, password, loginType);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailVerified) {
      setEmailVerified(false);
      setPassword("");
    }
    if (localError) {
      setLocalError(null);
    }
  }

  const images: Record<"driver" | "customer", string> = {
    driver: driverPic,
    customer: customerPic,
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-[65%]">
        <img
          src={images[loginType]}
          alt={`${loginType} login`}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex flex-col w-full items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-row items-center mb-10">
            <img src={logo} alt="logo" className="w-8 h-8" />
            <h1 className="text-md font-bold text-[#005B17]">RECYKLE</h1>
          </div>

          <h2 className="text-3xl font-medium mb-6">
            {loginType === "driver" ? "Driver Login" : "Customer Login"}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full px-4 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {!emailVerified ? (
                <button
                  type="button"
                  disabled={!email.trim() || checkingEmail}
                  onClick={handleCheckEmail}
                  className="w-full border border-slate-300 py-2 rounded-[10px] hover:bg-slate-100 transition duration-200 mt-3 disabled:opacity-60"
                >
                  {checkingEmail ? "Checking..." : "Continue"}
                </button>
              ) : null}

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  emailVerified ? "max-h-96 opacity-100 mt-6 mb-5" : "max-h-0 opacity-0"
                }`}
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required={emailVerified}
                  className="w-full px-4 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {emailVerified ? (
                  <div className="flex justify-end mt-3">
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                ) : null}
              </div>

              {localError ? <p className="text-sm text-red-600 mb-3">{localError}</p> : null}
              {error ? <p className="text-sm text-red-600 mb-3">{error}</p> : null}
              {notice ? <p className="text-sm text-blue-700 mb-3">{notice}</p> : null}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full bg-[#005B17] text-white py-2 rounded-[10px] hover:bg-green-700 transition duration-200 mt-2"
              >
                {loading ? "Working..." : "Sign in"}
              </button>

              <button
                type="button"
                className="w-full border border-slate-300 py-2 rounded-[10px] hover:bg-slate-100 transition duration-200 mt-3"
                onClick={() =>
                  setLoginType(loginType === "driver" ? "customer" : "driver")
                }
              >
                Switch to {loginType === "driver" ? "Customer" : "Driver"} Login
              </button>

              <div className="flex justify-center mt-6">
                <p className="text-sm text-gray-500">New here?</p>
                <Link to="/signup" className="ml-1 text-sm text-blue-600 hover:underline">
                  Create account
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
