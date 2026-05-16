import { useParams } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import { Mail, Phone, Calendar, User as UserIcon } from "lucide-react";
import { formatDate } from "@utils/validation";

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const currentUser = useAuthStore((state) => state.user);

  // Use current user profile if no userId provided, otherwise would fetch shared profile
  const user = currentUser;

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User profile not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-800 relative">
          {user.coverPictures && user.coverPictures.length > 0 ? (
            <img
              src={user.coverPictures[0]}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="flex flex-col md:flex-row gap-6 -mt-24 mb-6">
            <div className="flex-shrink-0">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center shadow-lg">
                  <UserIcon size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 pt-4">
              <h1 className="text-3xl font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === "admin" ? "Administrator" : "User"}
              </p>

              {user.bio && (
                <p className="text-gray-700 mt-3 text-lg">{user.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-primary-600" />
                    <span>{user.email}</span>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-primary-600" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary-600" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
            <div>
              <p className="text-gray-600 text-sm">Account Status</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {user.isConfirmed ? (
                  <span className="text-green-600">Verified</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">2FA Status</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {user.is2FAEnabled ? (
                  <span className="text-green-600">Enabled</span>
                ) : (
                  <span className="text-gray-600">Disabled</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Member Since</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {new Date(user.createdAt).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Cover Photos */}
      {user.coverPictures && user.coverPictures.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Cover Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.coverPictures.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Cover ${index + 1}`}
                className="w-full h-48 rounded-lg object-cover shadow"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
