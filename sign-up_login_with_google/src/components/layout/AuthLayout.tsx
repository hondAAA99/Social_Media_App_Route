import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Saraha</h1>
          <p className="text-gray-600">Secure Messaging Platform</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>&copy; 2024 Saraha. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
