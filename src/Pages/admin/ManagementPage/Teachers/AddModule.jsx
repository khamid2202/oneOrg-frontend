import React, { useState, useEffect } from "react";
import { Plus, Loader2, AlertCircle, X } from "lucide-react";
import { api } from "../../../../Library/RequestMaker.jsx";
import { endpoints } from "../../../../Library/Endpoints.jsx";

/**
 * Initial form state for creating/editing a teacher
 */
const INITIAL_FORM_STATE = {
  full_name: "",
  username: "",
  email: "",
  phone_number: "",
  password: "",
  status: "active",
  roles: [],
  permissions: [],
};

/**
 * Default roles/permissions for new teachers
 */
const DEFAULT_NEW_TEACHER = {
  roles: ["teacher"],
  permissions: ["can_teach"],
};

/**
 * Predefined role options
 */
const ROLE_OPTIONS = ["admin", "cashier", "teacher"];

/**
 * Predefined permission options
 */
const PERMISSION_OPTIONS = [
  "can_view_billings",
  "can_view_discounts",
  "can_view_invoices",
  "can_view_payments",
  "can_view_wallet",
  "view_homework_reports",
  "can_teach",
  "can_view_points",
];

/**
 * AddTeacherModal Component
 * Modal for creating new teachers or editing existing ones
 *
 * @param {Object} editingTeacher - Teacher object when editing, null when creating
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onSuccess - Callback after successful save (receives updated teachers list)
 */
function AddTeacherModal({ editingTeacher, onClose, onSuccess }) {
  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Input fields for adding roles/permissions
  const [newRole, setNewRole] = useState("");
  const [newPermission, setNewPermission] = useState("");

  const isEditMode = Boolean(editingTeacher);

  // Initialize form when modal opens

  useEffect(() => {
    if (editingTeacher) {
      // Populate form with existing teacher data
      setFormData({
        full_name: editingTeacher.full_name || "",
        username: editingTeacher.username || "",
        email: editingTeacher.email || "",
        phone_number: editingTeacher.phone_number || "",
        password: "",
        status: editingTeacher.status || "active",
        roles: editingTeacher.roles || [],
        permissions: editingTeacher.permissions || [],
      });
    } else {
      // New teacher with default values
      setFormData({
        ...INITIAL_FORM_STATE,
        roles: DEFAULT_NEW_TEACHER.roles,
        permissions: DEFAULT_NEW_TEACHER.permissions,
      });
    }
    setHasChanges(false);
    setError("");
    setNewRole("");
    setNewPermission("");
  }, [editingTeacher]);

  // Form field change handler with change detection

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Track changes for edit mode
    if (editingTeacher) {
      const hasFieldChanged = checkForChanges(field, value);
      setHasChanges(hasFieldChanged);
    }
  };

  /**
   * Compare current form values with original teacher data
   */
  const checkForChanges = (changedField, newValue) => {
    const fieldsToCheck = { ...formData, [changedField]: newValue };

    return Object.keys(fieldsToCheck).some((key) => {
      if (key === "password") return fieldsToCheck[key] !== "";
      if (key === "roles" || key === "permissions") {
        const original = editingTeacher[key] || [];
        const current = fieldsToCheck[key] || [];
        return (
          JSON.stringify([...current].sort()) !==
          JSON.stringify([...original].sort())
        );
      }
      return fieldsToCheck[key] !== (editingTeacher[key] || "");
    });
  };

  // Role management

  const handleAddRole = (directValue) => {
    const trimmedRole = (directValue || newRole).trim();
    if (trimmedRole && !formData.roles.includes(trimmedRole)) {
      handleFormChange("roles", [...formData.roles, trimmedRole]);
      setNewRole("");
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    handleFormChange(
      "roles",
      formData.roles.filter((r) => r !== roleToRemove),
    );
  };

  // Permission management

  const handleAddPermission = (directValue) => {
    const trimmedPermission = (directValue || newPermission).trim();
    if (
      trimmedPermission &&
      !formData.permissions.includes(trimmedPermission)
    ) {
      handleFormChange("permissions", [
        ...formData.permissions,
        trimmedPermission,
      ]);
      setNewPermission("");
    }
  };

  const handleRemovePermission = (permissionToRemove) => {
    handleFormChange(
      "permissions",
      formData.permissions.filter((p) => p !== permissionToRemove),
    );
  };

  // Form validation

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!isEditMode && !formData.password) {
      setError("Password is required for new teachers");
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // Save handler (create or update)

  const handleSave = async () => {
    setError("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      if (isEditMode) {
        await updateTeacher();
      } else {
        await createTeacher();
      }

      // Refetch teachers list and notify parent
      const res = await api.get(endpoints.TEACHERS);
      if (res.data && Array.isArray(res.data.users)) {
        onSuccess(res.data.users);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save teacher:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save teacher. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update existing teacher via PATCH request
   */
  const updateTeacher = async () => {
    const payload = {
      full_name: formData.full_name,
      username: formData.username,
      email: formData.email || undefined,
      phone: formData.phone_number || undefined,
      status: formData.status,
      roles: formData.roles,
      permissions: formData.permissions,
    };

    // Only include password if changed
    if (formData.password) {
      payload.password = formData.password;
    }

    const response = await api.patch(
      `${endpoints.UPDATE_USER}/${editingTeacher.id}`,
      payload,
    );

    if (!response.data?.ok) {
      throw new Error("Update failed");
    }
  };

  /**
   * Create new teacher via POST request
   */
  const createTeacher = async () => {
    const payload = {
      username: formData.username,
      password: formData.password,
      full_name: formData.full_name,
      email: formData.email || undefined,
      phone: formData.phone_number || undefined,
      status: formData.status || "active",
      roles:
        formData.roles.length > 0 ? formData.roles : DEFAULT_NEW_TEACHER.roles,
      permissions:
        formData.permissions.length > 0 ? formData.permissions : undefined,
    };

    // Clean up undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    const response = await api.post(endpoints.CREATE_USER, payload);

    if (!response.data?.ok) {
      throw new Error("Creation failed");
    }
  };

  // Render

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Teacher" : "Add New Teacher"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode
              ? "Update teacher information"
              : "Fill in the details to add a new teacher"}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Full Name Field */}
          <FormField
            label="Full Name"
            required
            value={formData.full_name}
            onChange={(e) => handleFormChange("full_name", e.target.value)}
            placeholder="John Doe"
          />

          {/* Username Field */}
          <FormField
            label="Username"
            required
            value={formData.username}
            onChange={(e) => handleFormChange("username", e.target.value)}
            placeholder="johndoe"
          />

          {/* Email Field */}
          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFormChange("email", e.target.value)}
            placeholder="john.doe@example.com"
          />

          {/* Phone Field */}
          <FormField
            label="Phone Number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleFormChange("phone_number", e.target.value)}
            placeholder="+1234567890"
          />

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {!isEditMode && <span className="text-red-500">*</span>}
              {isEditMode && (
                <span className="text-gray-500 text-xs">
                  (leave empty to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleFormChange("password", e.target.value)}
              placeholder={
                isEditMode
                  ? "Enter new password to change"
                  : "Minimum 6 characters"
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleFormChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Roles Section */}
          <TagInput
            label="Roles"
            tags={formData.roles}
            newTagValue={newRole}
            onNewTagChange={setNewRole}
            onAddTag={handleAddRole}
            onRemoveTag={handleRemoveRole}
            placeholder="Add role (e.g., teacher, admin)"
            tagClassName="bg-indigo-100 text-indigo-700"
            buttonClassName="bg-indigo-600 hover:bg-indigo-700"
            suggestions={ROLE_OPTIONS}
          />

          {/* Permissions Section */}
          <TagInput
            label="Permissions"
            tags={formData.permissions}
            newTagValue={newPermission}
            onNewTagChange={setNewPermission}
            onAddTag={handleAddPermission}
            onRemoveTag={handleRemovePermission}
            placeholder="Add permission (e.g., can_teach)"
            tagClassName="bg-purple-100 text-purple-700"
            buttonClassName="bg-purple-600 hover:bg-purple-700"
            suggestions={PERMISSION_OPTIONS}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={(isEditMode && !hasChanges) || saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isEditMode ? (hasChanges ? "Update" : "No Changes") : "Add"}{" "}
                Teacher
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components

/**
 * Reusable form field component
 */
function FormField({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}

/**
 * Reusable tag input component for roles/permissions
 * Supports both typing custom values and selecting from predefined suggestions
 */
function TagInput({
  label,
  tags,
  newTagValue,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  placeholder,
  tagClassName,
  buttonClassName,
  suggestions = [],
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddTag();
    }
  };

  // Filter suggestions to exclude already selected tags
  const availableSuggestions = suggestions.filter(
    (suggestion) => !tags.includes(suggestion),
  );

  const handleSuggestionClick = (suggestion) => {
    if (!tags.includes(suggestion)) {
      // Pass value directly to avoid async state issues
      onAddTag(suggestion);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="bg-gray-50 p-4 rounded-lg">
        {/* Current Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags && tags.length > 0 ? (
            tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 ${tagClassName} rounded-full text-sm font-medium flex items-center gap-2`}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="hover:opacity-70"
                >
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">
              No {label.toLowerCase()} assigned
            </span>
          )}
        </div>

        {/* Suggestions Toggle */}
        {availableSuggestions.length > 0 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              {showSuggestions ? "Hide" : "Show"} suggestions
              <span className="text-xs text-gray-500">
                ({availableSuggestions.length} available)
              </span>
            </button>

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                {availableSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-3 py-1 border-2 border-dashed rounded-full text-sm font-medium transition hover:border-solid ${
                      tagClassName.includes("indigo")
                        ? "border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500"
                        : "border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-500"
                    }`}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add New Tag Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagValue}
            onChange={(e) => onNewTagChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="button"
            onClick={onAddTag}
            className={`px-3 py-2 ${buttonClassName} text-white rounded-lg transition text-sm font-medium`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTeacherModal;
