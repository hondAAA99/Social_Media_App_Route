import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import { Menu, X, Home, Mail, User, LogOut } from "lucide-react";
import { useAuth } from "@hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Messages", href: "/messages", icon: Mail },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 text-gray-700 hover:bg-gray-200 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-white border-r border-gray-200 shadow-lg md:shadow-none z-40 transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 mt-16 md:mt-0">
          <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
            Saraha
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-gray-200">
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.firstName}
                className="w-12 h-12 rounded-full mb-3 object-cover"
              />
            )}
            <p className="font-semibold text-gray-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-6 space-y-2">
          {navLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(href)
                  ? "bg-primary-100 text-primary-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
