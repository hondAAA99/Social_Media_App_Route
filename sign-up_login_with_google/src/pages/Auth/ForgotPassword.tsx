import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@utils/validation";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { forgetPassword, isLoading, error } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setApiError(null);
    setSuccess(false);

    const result = await forgetPassword(data.email);
    if (result.success) {
      setSuccess(true);
      setSubmittedEmail(data.email);
    } else {
      setApiError(result.error);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="mx-auto mb-4 text-green-600" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Check Your Email
        </h2>
        <p className="text-gray-600 mb-4">
          We've sent a password reset link to <strong>{submittedEmail}</strong>
        </p>
        <p className="text-sm text-gray-600 mb-6">
          The link will expire in 1 hour. If you don't see the email, check your
          spam folder.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>

      {(apiError || error) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-700">{apiError || error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" message="" />
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
