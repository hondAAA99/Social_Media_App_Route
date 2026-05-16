import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-6 text-primary-600" size={64} />
        <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
