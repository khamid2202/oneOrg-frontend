import React from "react";
import PasswordChangeModule from "./PasswordChangeModule.jsx";

function ProfileRow({ label, value }) {
  return (
    <div className="flex flex-col py-3">
      <div className="text-gray-500 text-sm font-medium">{label}</div>
      <div className="text-gray-900 text-base">{value}</div>
    </div>
  );
}

function MobileView({
  u,
  showReset,
  setShowReset,
  logout,
  showLogoutModal,
  setShowLogoutModal,
}) {
  return (
    <div className="w-full md:hidden px-4">
      <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-400 flex items-center justify-center text-white text-3xl font-bold">
            {u.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {u.fullName}
            </div>
            <div className="text-gray-500 text-sm">@{u.username}</div>
            <div className="text-gray-400 text-sm mt-1">{u.email}</div>
          </div>
        </div>

        <div className="mt-4">
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
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowReset(true)}
            className="w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Reset Password
          </button>
        </div>
      </div>

      <div className="mt-6 px-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Account Details
        </h2>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className="font-semibold text-green-600">{u.status}</div>
            </div>

            <div>
              <div className="text-gray-400 text-sm mb-2">Roles</div>
              <div className="flex flex-wrap gap-2">
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

      {showReset && (
        <PasswordChangeModule onCancel={() => setShowReset(false)} />
      )}

      <div className="w-full mt-4 flex justify-center">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full items-center justify-center rounded-lg bg-white border px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          Log Out
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 min-w-[260px] flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2 text-gray-800">
              Confirm Logout
            </h2>
            <p className="mb-4 text-gray-600">
              Are you sure you want to log out?
            </p>
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
              >
                Yes, Log Out
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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

export default MobileView;
