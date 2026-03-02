import React, { useState } from "react";
import { useGlobalContext } from "../../../Hooks/UseContext.jsx";
import { useAuth } from "../../../Hooks/AuthContext.jsx";
import PasswordChangeModule from "./PasswordChangeModule.jsx";

function transformApiUser(u) {
  if (!u) return null;
  return {
    fullName: u.full_name || u.name || u.username || "User",
    username: u.username || u.username || "user",
    email: u.email || "",
    phone: u.phone_number || u.phone || null,
    roles: Array.isArray(u.roles) ? u.roles : [],
    branch: u.branch || u.current_branch || "-",
    status: u.status || "active",
    created: u.created_at || u.created || "-",
    updated: u.updated_at || u.updated || "-",
  };
}

function Profile() {
  const { user } = useGlobalContext();
  const u = transformApiUser(user) || {
    fullName: "Unknown",
    username: "unknown",
    email: "",
    phone: null,
    roles: [],
    branch: "-",
    status: "unknown",
    created: "-",
    updated: "-",
  };
  const [showReset, setShowReset] = useState(false);
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleResetPassword = () => setShowReset(true);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-10">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-white border-r border-gray-100 flex flex-col items-center justify-between py-10 px-6 gap-8">
          {/* Avatar */}
          <div className="relative flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 flex items-center justify-center text-white text-5xl font-bold mb-2">
              {u.fullName.charAt(0)}
            </div>
            <span className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-green-400 border-2 border-white block" />
            </span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-gray-900">
              {u.fullName}
            </div>
            <div className="text-gray-500 text-base">@{u.username}</div>
            <div className="text-gray-400 text-sm mt-1">{u.email}</div>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {u.roles.map((role) => (
                <span
                  key={role}
                  className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
          {/* a button to reset password */}
          <button
            onClick={() => setShowReset(true)}
            className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:from-purple-700 hover:to-purple-600"
          >
            Reset Password
          </button>
          {/* Log out button moved from Navbar */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full inline-flex items-center justify-center rounded-lg bg-white border mt-auto px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            Log Out
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 flex flex-col gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              My Profile
            </h2>
            <div className="text-gray-500 mb-2">Personal Information</div>
            <div className="bg-white rounded-2xl shadow p-6 ">
              {showReset ? (
                <PasswordChangeModule onCancel={() => setShowReset(false)} />
              ) : (
                <>
                  <div className="text-gray-400 text-sm mb-4">
                    Tap email or phone to update it.
                  </div>
                  <div className="divide-y divide-gray-100">
                    <ProfileRow label="Full name" value={u.fullName} />
                    <ProfileRow label="Email" value={u.email} />
                    <ProfileRow
                      label="Phone"
                      value={
                        u.phone ? (
                          u.phone
                        ) : (
                          <span className="italic text-gray-400">Not set</span>
                        )
                      }
                    />
                    <ProfileRow label="Username" value={u.username} />
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Details
            </h2>
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <>
                    <div className="text-gray-400 text-sm mb-2">Status</div>
                    <div className="font-semibold text-green-600 mb-4">
                      {u.status}
                    </div>
                  </>
                  <div className="text-gray-400 text-sm mb-2">Roles</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {u.roles.map((role) => (
                      <span
                        key={role}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Logout Modal */}
      {showLogoutModal && (
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
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
              >
                Yes, Log Out
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNavItem({ children, icon, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition font-medium ${active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex flex-col text-left text-base">{children}</span>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center py-3 gap-2 md:gap-0">
      <div className="w-40 text-gray-500 text-sm font-medium md:text-base md:font-normal">
        {label}
      </div>
      <div className="flex-1 text-gray-900 text-base">{value}</div>
    </div>
  );
}

export default Profile;
