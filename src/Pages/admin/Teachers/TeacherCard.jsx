import React from "react";
import { User, Phone, Shield, Eye, Pencil } from "lucide-react";

/**
 * TeacherCard Component
 * Displays individual teacher information in a card format
 *
 * @param {Object} teacher - Teacher data object
 * @param {Function} onView - Callback when View button is clicked
 * @param {Function} onEdit - Callback when Edit button is clicked
 */
function TeacherCard({ teacher, onView, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100 flex flex-col">
      {/* Header: Avatar & Name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <User size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            {teacher.full_name || teacher.username || "Unnamed Teacher"}
          </h3>
          <p className="text-sm text-gray-500">@{teacher.username}</p>
        </div>
      </div>

      {/* Body: Contact & Roles */}
      <div className="space-y-2 text-sm flex-1 pb-3">
        {/* Phone Number */}
        {teacher.phone_number && (
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} className="text-gray-400" />
            <span>{teacher.phone_number}</span>
          </div>
        )}

        {/* Roles Badges */}
        {teacher.roles && teacher.roles.length > 0 && (
          <div className="flex items-start gap-2">
            <Shield size={16} className="text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {teacher.roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Status & Actions */}
      <div className="pt-4 border-t flex items-center justify-between">
        {/* Status Badge */}
        {teacher.status && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              teacher.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {teacher.status}
          </span>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onView(teacher)}
            className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs font-medium"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => onEdit(teacher)}
            className="flex items-center gap-1 px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition text-xs font-medium"
          >
            <Pencil size={14} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeacherCard;
