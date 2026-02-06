import React, { useEffect, useState } from "react";
import { api } from "../../../Library/RequestMaker.jsx";
import { endpoints } from "../../../Library/Endpoints.jsx";
import {
  Users,
  User,
  Phone,
  Shield,
  Plus,
  Pencil,
  Mail,
  X,
} from "lucide-react";

// Local Components
import TeacherCard from "./TeacherCard.jsx";
import AddTeacherModal from "./AddModule.jsx";

/**
 * Teachers Page Component
 * Main page for viewing, creating, and managing teachers
 */
function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);

  // Data Fetching

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get(
        endpoints.TEACHERS,
        {},
        { withCredentials: true },
      );

      if (res.data && Array.isArray(res.data.users)) {
        setTeachers(res.data.users);
        setFilteredTeachers(res.data.users);
        localStorage.setItem("teachers", JSON.stringify(res.data.users));
      } else {
        setTeachers([]);
        setFilteredTeachers([]);
      }
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      setTeachers([]);
      setFilteredTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const lowerSearch = search.toLowerCase();
    setFilteredTeachers(
      teachers.filter(
        (teacher) =>
          teacher.full_name?.toLowerCase().includes(lowerSearch) ||
          teacher.username?.toLowerCase().includes(lowerSearch),
      ),
    );
  }, [search, teachers]);

  // Modal Handlers
  const handleAddModalClose = () => {
    setShowAddModal(false);
    setEditingTeacher(null);
  };

  const handleModalSuccess = (updatedTeachers) => {
    setTeachers(updatedTeachers);
    setFilteredTeachers(updatedTeachers);
  };

  const handleViewTeacher = (teacher) => setViewingTeacher(teacher);
  const handleEditTeacher = (teacher) => setEditingTeacher(teacher);

  // Computed Values
  const activeTeachersCount = teachers.filter(
    (t) => t.status === "active",
  ).length;

  // Loading State
  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-lg text-gray-600">Loading teachers...</div>
      </div>
    );
  }

  // Render
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">All Teachers</h1>
          <p className="text-gray-500 mt-1">Browse all teaching staff</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
        >
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teachers..."
          className="w-full sm:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Summary Stats Cards */}
      <SummaryCards
        totalCount={teachers.length}
        activeCount={activeTeachersCount}
        filteredCount={filteredTeachers.length}
      />

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.length === 0 ? (
          <EmptyState />
        ) : (
          filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id || teacher.uuid}
              teacher={teacher}
              onView={handleViewTeacher}
              onEdit={handleEditTeacher}
            />
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingTeacher) && (
        <AddTeacherModal
          editingTeacher={editingTeacher}
          onClose={handleAddModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* View Teacher Details Modal */}
      {viewingTeacher && (
        <ViewTeacherModal
          teacher={viewingTeacher}
          onClose={() => setViewingTeacher(null)}
          onEdit={() => {
            setViewingTeacher(null);
            setEditingTeacher(viewingTeacher);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Summary statistics cards
 */
function SummaryCards({ totalCount, activeCount, filteredCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard
        icon={<Users size={28} />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-600"
        label="Total Teachers"
        value={totalCount}
      />
      <StatCard
        icon={<User size={28} />}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        label="Active Now"
        value={activeCount}
      />
      <StatCard
        icon={<Shield size={28} />}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        label="Filtered Results"
        value={filteredCount}
      />
    </div>
  );
}

/**
 * Individual stat card
 */
function StatCard({ icon, iconBgColor, iconColor, label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
      <div className={`p-3 ${iconBgColor} ${iconColor} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
    </div>
  );
}

/**
 * Empty state when no teachers found
 */
function EmptyState() {
  return (
    <div className="col-span-full text-center py-12">
      <p className="text-gray-500 text-lg">No teachers found.</p>
    </div>
  );
}

/**
 * View Teacher Details Modal
 */
function ViewTeacherModal({ teacher, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {teacher.full_name || teacher.username}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Teacher Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                teacher.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {teacher.status || "unknown"}
            </span>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard
              icon={<User size={18} />}
              label="Full Name"
              value={teacher.full_name}
            />
            <InfoCard
              icon={<User size={18} />}
              label="Username"
              value={teacher.username}
            />
            <InfoCard
              icon={<Mail size={18} />}
              label="Email"
              value={teacher.email}
              breakAll
            />
            <InfoCard
              icon={<Phone size={18} />}
              label="Phone Number"
              value={teacher.phone_number}
            />
            <InfoCard
              icon={<Shield size={18} />}
              label="User ID"
              value={teacher.id || teacher.uuid}
              mono
              small
            />
            {teacher.uuid && (
              <InfoCard
                icon={<Shield size={18} />}
                label="UUID"
                value={teacher.uuid}
                mono
                extraSmall
                breakAll
              />
            )}
          </div>

          {/* Roles Section */}
          {teacher.roles && teacher.roles.length > 0 && (
            <TagSection
              icon={<Shield size={18} />}
              label="Roles"
              tags={teacher.roles}
              tagClassName="bg-indigo-100 text-indigo-700"
            />
          )}

          {/* Permissions Section */}
          {teacher.permissions && teacher.permissions.length > 0 && (
            <TagSection
              icon={<Shield size={18} />}
              label="Permissions"
              tags={teacher.permissions}
              tagClassName="bg-purple-100 text-purple-700"
            />
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teacher.created_at && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">
                  Created At
                </span>
                <p className="text-gray-900 text-sm">
                  {new Date(teacher.created_at).toLocaleString()}
                </p>
              </div>
            )}
            {teacher.updated_at && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">
                  Last Updated
                </span>
                <p className="text-gray-900 text-sm">
                  {new Date(teacher.updated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-between items-center">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium"
          >
            <Pencil size={16} />
            Edit Teacher
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Info card for displaying a labeled value
 */
function InfoCard({ icon, label, value, mono, small, extraSmall, breakAll }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p
        className={`text-gray-900 font-medium ${mono ? "font-mono" : ""} ${
          small ? "text-sm" : ""
        } ${extraSmall ? "text-xs" : ""} ${breakAll ? "break-all" : ""}`}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}

/**
 * Tag section for displaying roles/permissions
 */
function TagSection({ icon, label, tags, tagClassName }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-500">{icon}</span>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 ${tagClassName} rounded-full text-sm font-medium`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Teachers;
