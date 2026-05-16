import { useAuthStore } from "@store/authStore";
import { MessageSquare, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Welcome, {user?.firstName}!
      </h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Messages</p>
              <p className="text-3xl font-bold text-gray-800">0</p>
            </div>
            <MessageSquare size={40} className="text-primary-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Profile Completeness
              </p>
              <p className="text-3xl font-bold text-gray-800">60%</p>
            </div>
            <User size={40} className="text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Security Status
              </p>
              <p className="text-3xl font-bold text-gray-800">Good</p>
            </div>
            <Settings size={40} className="text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/messages"
            className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-200"
          >
            <MessageSquare className="text-primary-600 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Send Message</p>
            <p className="text-sm text-gray-600">Share a message with others</p>
          </Link>

          <Link
            to="/profile/edit"
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
          >
            <User className="text-green-600 mb-2" size={24} />
            <p className="font-semibold text-gray-800">Edit Profile</p>
            <p className="text-sm text-gray-600">
              Update your profile information
            </p>
          </Link>

          <Link
            to="/profile"
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Settings className="text-blue-600 mb-2" size={24} />
            <p className="font-semibold text-gray-800">View Profile</p>
            <p className="text-sm text-gray-600">See your public profile</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Getting Started
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
              ✓
            </div>
            <div>
              <p className="font-medium text-gray-800">Email verified</p>
              <p className="text-sm text-gray-600">
                Your email address has been confirmed
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0 text-sm">
              ○
            </div>
            <div>
              <p className="font-medium text-gray-800">Complete profile</p>
              <p className="text-sm text-gray-600">
                Add a profile picture and bio to complete your profile
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center flex-shrink-0 text-sm">
              ○
            </div>
            <div>
              <p className="font-medium text-gray-800">Enable 2FA</p>
              <p className="text-sm text-gray-600">
                Improve your account security with two-factor authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
