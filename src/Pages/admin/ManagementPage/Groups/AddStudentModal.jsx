import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "../../../../Library/RequestMaker.jsx";
import { endpoints } from "../../../../Library/Endpoints.jsx";

function AddStudentModal({ isOpen, onClose, groupId, onAdd }) {
  const [fullName, setFullName] = useState("");
  const [laId, setLaId] = useState("");
  const [joinDate, setJoinDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setFullName("");
    setLaId("");
    setJoinDate(new Date().toISOString().split("T")[0]);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!laId.trim()) {
      setError("LA ID is required");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the student
      const createRes = await api.post(endpoints.CREATE_STUDENT, {
        full_name: fullName.trim(),
        la_id: laId.trim(),
      });

      if (!createRes.data?.ok) {
        throw new Error(createRes.data?.message || "Failed to create student");
      }

      const newStudent = createRes.data.student;
      const studentId = newStudent.id;

      // Step 2: Assign student to group
      // The backend copies billing_ids from the group automatically
      // userId is extracted from the authenticated session by the backend
      const assignRes = await api.post(endpoints.ASSIGN_STUDENT_GROUP, {
        student_id: studentId,
        group_id: groupId,
        join_date: joinDate,
      });

      if (!assignRes.data?.ok) {
        throw new Error(
          assignRes.data?.message || "Failed to assign student to group",
        );
      }

      // Combine student data with group assignment data for the callback
      const studentWithGroup = {
        ...newStudent,
        student_id: studentId,
        student_group_id: assignRes.data.studentGroup.id,
        group: {
          join_date: assignRes.data.studentGroup.join_date,
        },
        status: assignRes.data.studentGroup.status || "active",
      };

      onAdd(studentWithGroup);
      handleClose();
    } catch (err) {
      console.error("Error adding student:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to add student",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Add New Student
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-700"
            >
              Full Name *
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter student's full name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="laId"
              className="block text-sm font-medium text-slate-700"
            >
              LA ID *
            </label>
            <input
              id="laId"
              type="text"
              value={laId}
              onChange={(e) => setLaId(e.target.value)}
              placeholder="Enter LA ID (e.g., LA545454)"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="joinDate"
              className="block text-sm font-medium text-slate-700"
            >
              Join Date
            </label>
            <input
              id="joinDate"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStudentModal;
