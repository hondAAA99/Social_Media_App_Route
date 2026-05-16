import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="text-center">
        <Lock className="mx-auto mb-6 text-red-600" size={64} />
        <h1 className="text-5xl font-bold text-gray-800 mb-2">403</h1>
        <p className="text-xl text-gray-600 mb-8">Access Denied</p>
        <p className="text-gray-600 mb-8 max-w-md">
          You don't have permission to access this resource.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
