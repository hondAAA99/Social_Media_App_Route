import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@store/authStore";
import ProtectedRoute from "@components/common/ProtectedRoute";
import ErrorBoundary from "@components/common/ErrorBoundary";
import { ToastProvider } from "@components/common/Toast";
import AuthLayout from "@components/layout/AuthLayout";
import DashboardLayout from "@components/layout/DashboardLayout";

// Auth Pages
import LoginPage from "@pages/Auth/Login";
import SignupPage from "@pages/Auth/Signup";
import ConfirmEmailPage from "@pages/Auth/ConfirmEmail";
import ForgotPasswordPage from "@pages/Auth/ForgotPassword";
import ResetPasswordPage from "@pages/Auth/ResetPassword";
import TwoFactorPage from "@pages/Auth/TwoFactor";

// Dashboard Pages
import DashboardPage from "@pages/Dashboard/Home";
import ProfilePage from "@pages/Dashboard/Profile";
import MessagesPage from "@pages/Dashboard/Messages";
import EditProfilePage from "@pages/Dashboard/EditProfile";

// Common Pages
import NotFoundPage from "@pages/NotFound";
import UnauthorizedPage from "@pages/Unauthorized";

function AppContent() {
  const hydrate = useAuthStore((state) => state.hydrate);

  // Hydrate auth state from cookies on app load
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/two-factor" element={<TwoFactorPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Route>

        {/* Common Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
