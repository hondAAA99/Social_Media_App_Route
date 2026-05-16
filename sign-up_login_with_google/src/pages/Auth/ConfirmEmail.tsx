import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, CheckCircle } from "lucide-react";

const ConfirmEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { confirmSignUp, isLoading, error } = useAuth();
  const [token, setToken] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    if (!token.trim()) {
      setApiError("Please enter the confirmation code");
      return;
    }

    const result = await confirmSignUp(token);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } else {
      setApiError(result.error);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Email Confirmed!
        </h2>
        <p className="text-gray-600 mb-4">
          Your account is now active. Redirecting to dashboard...
        </p>
        <LoadingSpinner size="sm" message="" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">
        Confirm Your Email
      </h2>
      <p className="text-gray-600 mb-6">
        We've sent a confirmation code to your email. Enter it below to verify
        your account.
      </p>

      {(apiError || error) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700">{apiError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="token"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirmation Code
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center tracking-widest font-mono text-lg"
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Confirming..." : "Confirm Email"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button className="text-primary-600 hover:text-primary-700 font-medium">
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
