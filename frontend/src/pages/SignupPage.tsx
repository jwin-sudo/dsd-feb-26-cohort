import { useMemo, useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";

import type { Role } from "@/types/auth";
import type { SignupDetails } from "@/types/signup";

type SignupPageProps = {
  loading: boolean;
  error: string | null;
  notice: string | null;
  onSignup: (payload: SignupDetails) => Promise<void>;
};

const defaultCustomerForm = {
  customer_name: "",
  billing_address: "",
  phone_number: "",
  street_address: "",
  city: "",
  state: "",
  zipcode: "",
};

export default function SignupPage({
  loading,
  error,
  notice,
  onSignup,
}: SignupPageProps) {
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [driverName, setDriverName] = useState("");
  const [customerForm, setCustomerForm] = useState(defaultCustomerForm);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) {
      return false;
    }

    if (role === "driver") {
      return Boolean(driverName.trim());
    }

    return Boolean(
      customerForm.customer_name.trim() &&
        customerForm.phone_number.trim() &&
        customerForm.street_address.trim() &&
        customerForm.city.trim() &&
        customerForm.state.trim() &&
        customerForm.zipcode.trim(),
    );
  }, [customerForm, driverName, email, password, role]);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (role === "driver") {
      await onSignup({
        role,
        email,
        password,
        driver_name: driverName,
      });
      return;
    }

    await onSignup({
      role,
      email,
      password,
      ...customerForm,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-slate-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-sm text-slate-600 mt-1">
          Register as a customer or driver and complete your profile details.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`rounded-lg border px-4 py-2 text-sm ${
              role === "customer"
                ? "bg-[#005B17] text-white border-[#005B17]"
                : "bg-white border-slate-300"
            }`}
            onClick={() => setRole("customer")}
          >
            Customer
          </button>
          <button
            type="button"
            className={`rounded-lg border px-4 py-2 text-sm ${
              role === "driver"
                ? "bg-[#005B17] text-white border-[#005B17]"
                : "bg-white border-slate-300"
            }`}
            onClick={() => setRole("driver")}
          >
            Driver
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="border rounded-md px-3 py-2"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border rounded-md px-3 py-2"
                minLength={6}
                required
              />
            </label>
          </div>

          {role === "driver" ? (
            <label className="flex flex-col gap-1 text-sm">
              Driver name
              <input
                value={driverName}
                onChange={(event) => setDriverName(event.target.value)}
                className="border rounded-md px-3 py-2"
                required
              />
            </label>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                Customer name
                <input
                  value={customerForm.customer_name}
                  onChange={(event) =>
                    setCustomerForm((current) => ({
                      ...current,
                      customer_name: event.target.value,
                    }))
                  }
                  className="border rounded-md px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Phone number
                <input
                  value={customerForm.phone_number}
                  onChange={(event) =>
                    setCustomerForm((current) => ({
                      ...current,
                      phone_number: event.target.value,
                    }))
                  }
                  className="border rounded-md px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                Billing address (optional)
                <input
                  value={customerForm.billing_address}
                  onChange={(event) =>
                    setCustomerForm((current) => ({
                      ...current,
                      billing_address: event.target.value,
                    }))
                  }
                  className="border rounded-md px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                Street address
                <input
                  value={customerForm.street_address}
                  onChange={(event) =>
                    setCustomerForm((current) => ({
                      ...current,
                      street_address: event.target.value,
                    }))
                  }
                  className="border rounded-md px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                City
                <input
                  value={customerForm.city}
                  onChange={(event) =>
                    setCustomerForm((current) => ({ ...current, city: event.target.value }))
                  }
                  className="border rounded-md px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                State
                <input
                  value={customerForm.state}
                  onChange={(event) =>
                    setCustomerForm((current) => ({ ...current, state: event.target.value }))
                  }
                  className="border rounded-md px-3 py-2"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                Zip code
                <input
                  value={customerForm.zipcode}
                  onChange={(event) =>
                    setCustomerForm((current) => ({ ...current, zipcode: event.target.value }))
                  }
                  className="border rounded-md px-3 py-2"
                  required
                />
              </label>
            </div>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {notice ? <p className="text-sm text-blue-700">{notice}</p> : null}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full bg-[#005B17] text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-sm text-center text-slate-600">
            Already have an account?{" "}
            <Link className="text-blue-600 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
