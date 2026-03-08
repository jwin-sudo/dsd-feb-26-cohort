import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/image.jpeg";
import { updatePassword } from "../../api/auth";

function parseHashParams(hash: string): URLSearchParams {
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(normalized);
}

const ResetPassPage = () => {
  const navigate = useNavigate();
  const hashParams = useMemo(() => parseHashParams(window.location.hash), []);
  const accessToken = hashParams.get("access_token");
  const type = hashParams.get("type");
  const isRecoveryLink = Boolean(accessToken) && type === "recovery";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isRecoveryLink || !accessToken) {
      setError("Invalid or expired reset link. Request a new one.");
      return;
    }
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Both password fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updatePassword(accessToken, password);
      setSuccess("Password updated successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password");
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

        <h2 className="text-3xl font-medium mb-2">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-6">
          Set your new password below.
        </p>

        {!isRecoveryLink ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">
              Invalid or expired reset link. Please request a new password reset email.
            </p>
            <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Go to forgot password
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <label className="mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {success ? <p className="text-sm text-green-700">{success}</p> : null}

            <button
              type="submit"
              disabled={loading || !password.trim() || !confirmPassword.trim()}
              className="w-full bg-[#005B17] text-white py-2 rounded-[10px] hover:bg-green-700 transition duration-200"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-4 text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassPage;
