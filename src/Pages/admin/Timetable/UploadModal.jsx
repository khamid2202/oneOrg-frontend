import React, { useState } from "react";
import { api } from "../../../Library/RequestMaker.jsx";
import { endpoints } from "../../../Library/Endpoints.jsx";
import { Loader2, AlertCircle, Upload } from "lucide-react";

export default function UploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !academicYear || !startDate) {
      setError("Please fill in all required fields");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("academic_year", academicYear);
      formData.append("start_date", startDate);
      if (endDate) formData.append("end_date", endDate);

      const res = await api.postForm(endpoints.TIMETABLE_UPLOAD, formData);
      setResult(res.data || res);

      setTimeout(() => {
        onClose();
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Upload failed. Please check the file format.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="p-4 md:p-6 border-b">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Upload Timetable
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Upload an Excel file with timetable data
          </p>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 space-y-4">
          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excel file <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 2MB. .xlsx or .xls format
            </p>
          </div>

          {/* Academic year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025-2026"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-2">
                Upload Successful!
              </div>
              <div className="flex gap-4 text-sm text-green-700">
                <div>
                  <span className="font-semibold">Inserted:</span>{" "}
                  {result.inserted ?? 0}
                </div>
                <div>
                  <span className="font-semibold">Updated:</span>{" "}
                  {result.updated ?? 0}
                </div>
                <div>
                  <span className="font-semibold">Skipped:</span>{" "}
                  {result.skipped ?? 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || !academicYear || !startDate || uploading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
