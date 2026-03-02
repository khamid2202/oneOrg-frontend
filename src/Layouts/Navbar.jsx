import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  CreditCard,
  Users,
  User,
  BarChart2,
  Calendar,
  Wrench,
  ChevronLeft,
  ChevronRight,
  ClipboardPenLine,
} from "lucide-react";
import { sendLogoutRequest } from "../Library/Authenticate.jsx";
import { useAuth } from "../Hooks/AuthContext.jsx";

export const getNavItems = (isAdmin, isTeacher) => {
  const allItems = [
    { to: "/home", icon: <Home size={20} />, label: "Home" },
    { to: "/timetable", icon: <Calendar size={20} />, label: "Timetable" },
    {
      to: "/management",
      icon: <Wrench size={20} />,
      label: "AdminTools",
    },
    {
      to: "/new-payments",
      icon: <CreditCard size={20} />,
      label: "Payments",
    },
    {
      to: "/teacher/lessons",
      icon: <ClipboardPenLine size={20} />,
      label: "Lessons",
    },
  ];

  if (isAdmin) {
    return allItems;
  }

  if (isTeacher) {
    return allItems.filter(
      (item) =>
        item.to === "/home" ||
        item.to === "/exams" ||
        item.to === "/home/my-classes" ||
        item.to === "/teacher/lessons",
    );
  }

  return allItems.filter((item) => item.to === "/home" || item.to === "/exams");
};

function Navbar({ isExpanded, setIsExpanded }) {
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [showText, setShowText] = useState(isExpanded);

  const isActive = (path) => location.pathname === path;

  // Get user data from AuthContext (verified by server)
  const { user, username, isAdmin, isTeacher, logout } = useAuth();
  const firstLetter = username ? username.charAt(0).toUpperCase() : "U";
  const fullName =
    user?.user?.full_name || user?.full_name || username || "User";

  const navItems = getNavItems(isAdmin, isTeacher);

  const handleLogOut = () => {
    // kept for backward compatibility if other code uses it
    setShowModal(true);
  };

  const handleToggleEnter = () => setShowToggle(true);
  const handleToggleLeave = () => setShowToggle(false);

  // Smooth text reveal - fade in after width transition starts
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setShowText(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowText(false);
    }
  }, [isExpanded]);

  return (
    <>
      <nav
        className={`hidden md:flex flex-col flex-none bg-white border-r border-gray-200 h-full shadow-md z-40 transition-[width] duration-300 ease-in-out ${
          isExpanded ? "w-56" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full w-full relative">
          {/* Collapse / Expand Button */}
          <div
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 h-full flex items-center"
            onMouseEnter={handleToggleEnter}
            onMouseLeave={handleToggleLeave}
          >
            <button
              className={`bg-white border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-100 transition-opacity duration-100 z-50 ${
                showToggle ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              {isExpanded ? (
                <ChevronLeft className="text-gray-600" size={20} />
              ) : (
                <ChevronRight className="text-gray-600" size={20} />
              )}
            </button>
          </div>

          {/* Top Section */}

          {/* Logo Section as Button */}
          <Link
            className="flex flex-row items-center gap-2 px-3 py-6 border-b w-full focus:outline-none hover:bg-gray-50 transition"
            to="/user-profile"
            type="button"
            tabIndex={0}
            aria-label="Go to profile"
          >
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex justify-center items-center text-white text-lg font-bold">
              {firstLetter}
            </div>
            <div className="text-left min-w-0 flex-1 overflow-hidden">
              <h1
                className={`text-lg font-semibold text-gray-800 truncate whitespace-nowrap transition-opacity duration-300 ${
                  isExpanded && showText ? "opacity-100" : "opacity-0"
                } ${!isExpanded ? "w-0" : ""}`}
              >
                {fullName}
              </h1>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex flex-col mt-2 space-y-1 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-4 py-4 mx-3 rounded-xl transition-all ${
                  isActive(item.to)
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span
                  className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                    isExpanded && showText ? "opacity-100" : "opacity-0"
                  } ${!isExpanded ? "w-0 overflow-hidden" : ""}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Bottom spacer (settings moved to Profile) */}
          <div className="p-4 mt-auto" />
        </div>
        <div
          className="ml-5 w-6 h-full absolute right-0 top-0 "
          onMouseEnter={handleToggleEnter}
          onMouseLeave={handleToggleLeave}
          aria-hidden="true"
        />
      </nav>

      {/* Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[300px] flex flex-col items-center">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Confirm Logout
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                onClick={confirmLogout}
              >
                Yes, Log Out
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                onClick={cancelLogout}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileNavbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { isAdmin, isTeacher, username } = useAuth();
  const navItems = getNavItems(isAdmin, isTeacher);
  const firstLetter = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className="md:hidden bg-white border-t border-gray-200 z-50 w-full flex-none">
      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-center justify-between py-2">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center text-xs gap-1 w-1/6 py-1 transition`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    active
                      ? "bg-purple-100 text-purple-700 shadow-inner"
                      : "text-gray-600"
                  }`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full ${
                      active
                        ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white"
                        : "bg-transparent text-current"
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>
                <span
                  className={`${active ? "text-purple-600 font-medium" : "text-gray-600"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
          {/* Profile nav item */}
          {(() => {
            const profileActive = isActive("/user-profile");
            return (
              <Link
                to="/user-profile"
                className={`flex flex-col items-center justify-center text-xs gap-1 w-1/6 py-1 transition`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    profileActive
                      ? "bg-purple-100 text-purple-700 shadow-inner"
                      : "text-gray-600"
                  }`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full ${profileActive ? "bg-gradient-to-br from-purple-600 to-purple-500 text-white" : "bg-transparent text-current"}`}
                  >
                    <User size={16} />
                  </div>
                </div>
                <span
                  className={`${profileActive ? "text-purple-600 font-medium" : "text-gray-600"}`}
                >
                  Profile
                </span>
              </Link>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
