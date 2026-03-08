import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/image.jpeg";
import { requestPasswordReset } from "../../api/auth";

const ForgotPassPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      await requestPasswordReset(email.trim(), redirectTo);
      setSuccess("If an account exists for this email, a reset link has been sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-row items-center mb-10">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <h1 className="text-md font-bold text-[#005B17]">RECYKLE</h1>
        </div>

        <h2 className="text-3xl font-medium mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter your email and we will send you a password reset link.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full px-4 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-[#005B17] text-white py-2 rounded-[10px] hover:bg-green-700 transition duration-200"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassPage;
