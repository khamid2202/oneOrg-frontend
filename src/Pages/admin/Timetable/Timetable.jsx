import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../Library/RequestMaker.jsx";
import { endpoints } from "../../../Library/Endpoints.jsx";
import { Loader2, AlertCircle, Upload } from "lucide-react";
import MultiSelectDropdown from "../../../Layouts/MultiSelectDropdown.jsx";

const DAYS = ["Mon", "Tues", "Wed", "Thu", "Fri"];
const DAY_MAP = {
  Mon: 1,
  Tues: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
};
const DAY_BY_INDEX = Object.fromEntries(
  Object.entries(DAY_MAP).map(([key, value]) => [value, key]),
);

function Timetable() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timetableData, setTimetableData] = useState([]);
  const [refreshToken, setRefreshToken] = useState(0);

  // Filters
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadAcademicYear, setUploadAcademicYear] = useState("2025-2026");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    // Set loading immediately when filters change
    setLoading(true);

    const fetchTimetable = async () => {
      setError("");
      try {
        const params = { academic_year_id: 1 };

        const timetableRes = await api.get(endpoints.TIMETABLE, params);
        const timetable = timetableRes.data?.timetable || [];

        // Transform data: add missing fields that backend doesn't provide
        const transformedData = timetable.map((item) => ({
          ...item,
          // Add day_index if missing
          day_index: item.day_index ?? DAY_MAP[item.day],
          // Add time_id: create unique ID from time_slot
          time_id: item.time_id ?? `${item.start_time}-${item.end_time}`,
          // Add group_id: use the lesson id or create from grade+class
          group_id: item.group_id ?? `${item.grade}-${item.class}`,
        }));

        // console.log("timetable:", transformedData);
        setTimetableData(transformedData);
      } catch (err) {
        console.error(err);
        setError("Failed to load timetable data");
      } finally {
        setLoading(false);
      }
    };

    // Debounce academic year input
    const timer = setTimeout(() => {
      fetchTimetable();
    }, 300);

    return () => clearTimeout(timer);
  }, [refreshToken]);

  const getTeacherValue = (item) => {
    const teacherId = item.teacher_id ?? item.teacher?.id;
    if (teacherId !== undefined && teacherId !== null) {
      return String(teacherId);
    }
    const teacherName =
      typeof item.teacher === "string"
        ? item.teacher
        : item.teacher?.full_name || item.teacher?.name;
    return teacherName ? `name:${teacherName.toLowerCase()}` : "";
  };

  const getClassLabel = (item) =>
    item.class_pair ||
    (item.grade != null && item.class != null
      ? `${item.grade}-${item.class}`
      : `Group ${item.group_id}`);

  const classOptions = useMemo(() => {
    const map = new Map();
    timetableData.forEach((item) => {
      if (item.group_id === undefined || item.group_id === null) return;
      const value = String(item.group_id);
      if (!map.has(value)) {
        map.set(value, getClassLabel(item));
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [timetableData]);

  const teacherOptions = useMemo(() => {
    const map = new Map();
    timetableData.forEach((item) => {
      const value = getTeacherValue(item);
      if (!value) return;
      if (!map.has(value)) {
        const teacherId = item.teacher_id ?? item.teacher?.id;
        const teacherName =
          typeof item.teacher === "string"
            ? item.teacher
            : item.teacher?.full_name || item.teacher?.name;
        map.set(value, teacherName || `Teacher ${teacherId}`);
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label })).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }, [timetableData]);

  const dayOptions = useMemo(() => {
    const daySet = new Set();
    timetableData.forEach((item) => {
      const rawDay = item.day_index ?? DAY_MAP[item.day] ?? item.day;
      const dayName = DAY_BY_INDEX[Number(rawDay)] || rawDay;
      if (DAYS.includes(dayName)) daySet.add(dayName);
    });
    return DAYS.filter((day) => daySet.has(day));
  }, [timetableData]);

  useEffect(() => {
    setSelectedGroupIds((prev) =>
      prev.filter((id) => classOptions.some((option) => option.value === id)),
    );
  }, [classOptions]);

  useEffect(() => {
    setSelectedTeacherIds((prev) =>
      prev.filter((id) => teacherOptions.some((option) => option.value === id)),
    );
  }, [teacherOptions]);

  useEffect(() => {
    setSelectedDays((prev) => prev.filter((day) => dayOptions.includes(day)));
  }, [dayOptions]);

  const filteredTimetableData = useMemo(() => {
    let data = timetableData;

    if (selectedGroupIds.length > 0) {
      data = data.filter((item) =>
        selectedGroupIds.includes(String(item.group_id ?? "")),
      );
    }

    if (selectedTeacherIds.length > 0) {
      data = data.filter((item) =>
        selectedTeacherIds.includes(getTeacherValue(item)),
      );
    }

    if (selectedDays.length > 0) {
      data = data.filter((item) => {
        const itemDayIndex = item.day_index ?? DAY_MAP[item.day] ?? item.day;
        const itemDayName = DAY_BY_INDEX[Number(itemDayIndex)] || itemDayIndex;
        return selectedDays.includes(itemDayName);
      });
    }

    return data;
  }, [timetableData, selectedGroupIds, selectedTeacherIds, selectedDays]);

  const filteredDayOptions = useMemo(() => {
    const daySet = new Set();
    filteredTimetableData.forEach((item) => {
      const rawDay = item.day_index ?? DAY_MAP[item.day] ?? item.day;
      const dayName = DAY_BY_INDEX[Number(rawDay)] || rawDay;
      if (DAYS.includes(dayName)) daySet.add(dayName);
    });
    return DAYS.filter((day) => daySet.has(day));
  }, [filteredTimetableData]);

  const selectedDaysSorted = useMemo(() => {
    if (selectedDays.length === 0) return [];
    return dayOptions.filter((day) => selectedDays.includes(day));
  }, [dayOptions, selectedDays]);

  // Build grid structure: days × time slots × classes
  const { timeSlots, classesSorted, gridData } = useMemo(() => {
    // Extract unique time slots
    const timeSlotsMap = new Map();
    filteredTimetableData.forEach((item) => {
      if (!timeSlotsMap.has(item.time_id)) {
        timeSlotsMap.set(item.time_id, {
          id: item.time_id,
          start: item.start_time,
          end: item.end_time,
          slot: item.time_slot,
        });
      }
    });
    const timeSlots = Array.from(timeSlotsMap.values()).sort((a, b) =>
      (a.start || "").localeCompare(b.start || ""),
    );

    // Extract unique classes and sort them
    const classesMap = new Map();
    filteredTimetableData.forEach((item) => {
      if (!classesMap.has(item.group_id)) {
        classesMap.set(item.group_id, {
          id: item.group_id,
          class_pair: item.class_pair,
          grade: item.grade,
          class: item.class,
        });
      }
    });
    const classesSorted = Array.from(classesMap.values()).sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return (a.class || "")
        .toString()
        .localeCompare((b.class || "").toString());
    });

    // Build grid: Map<day_timeId_groupId, lesson>
    const gridData = new Map();
    filteredTimetableData.forEach((item) => {
      const key = `${item.day_index}_${item.time_id}_${item.group_id}`;
      gridData.set(key, item);
    });

    return { timeSlots, classesSorted, gridData };
  }, [filteredTimetableData]);

  // Handle file upload
  const handleUpload = async () => {
    if (!file || !uploadAcademicYear || !startDate) {
      setUploadError("Please fill in all required fields");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("academic_year", uploadAcademicYear);
      formData.append("start_date", startDate);
      if (endDate) formData.append("end_date", endDate);

      const res = await api.postForm(endpoints.TIMETABLE_UPLOAD, formData);
      setUploadResult(res.data || res);

      // Refresh timetable data after successful upload
      setTimeout(() => {
        setShowUploadModal(false);
        setFile(null);
        setStartDate("");
        setEndDate("");
        setUploadResult(null);
        setRefreshToken((prev) => prev + 1);
      }, 2000);
    } catch (err) {
      console.error(err);
      setUploadError(
        err.response?.data?.message ||
          "Upload failed. Please check the file format.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Non-scrolling part: Header and Filters - Fixed container */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 w-full">
        {/* Fixed header - won't be affected by table width */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Timetable
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Weekly schedule for all classes
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition whitespace-nowrap w-full sm:w-auto"
          >
            <Upload size={18} />
            Upload Timetable
          </button>
        </div>

        {/* Filters - also fixed width */}
        <div className="bg-white border rounded-xl p-3 md:p-4 shadow-sm">
          <div className="flex  gap-3 items-stretch lg:items-end flex-wrap">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Class</label>
              <MultiSelectDropdown
                label="All classes"
                allSelectedLabel="All classes"
                options={classOptions.map((option) => ({
                  key: option.value,
                  label: option.label,
                }))}
                selected={selectedGroupIds}
                onChange={setSelectedGroupIds}
                width="w-64"
                activeColor="blue"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Teacher</label>
              <MultiSelectDropdown
                label="All teachers"
                allSelectedLabel="All teachers"
                options={teacherOptions.map((option) => ({
                  key: option.value,
                  label: option.label,
                }))}
                selected={selectedTeacherIds}
                onChange={setSelectedTeacherIds}
                width="w-64"
                activeColor="blue"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Day</label>
              <MultiSelectDropdown
                label="All days"
                allSelectedLabel="All days"
                options={dayOptions}
                selected={selectedDays}
                onChange={setSelectedDays}
                width="w-48"
                activeColor="blue"
              />
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 mt-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Scrolling part: Table - Completely independent scrolling container */}
      <div className="flex-1 px-4 md:px-6 pb-4 md:pb-6 min-h-0">
        <div className="h-full overflow-auto bg-white rounded-xl shadow-sm border">
          {loading ? (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r sticky left-0 bg-gray-50 z-30">
                    Day
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r sticky left-[100px] bg-gray-50 z-30">
                    Period
                  </th>
                  {/* Skeleton class headers - show 1 if class selected, otherwise 6 */}
                  {Array.from({
                    length: selectedGroupIds.length > 0 ? 1 : 6,
                  }).map((_, i) => (
                    <th
                      key={`skeleton-header-${i}`}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r min-w-[180px]"
                    >
                      <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-16"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Skeleton rows - show 1 day if day filter, otherwise 6 days */}
                {Array.from({ length: selectedDays.length === 0 ? 6 : 1 }).map(
                  (_, dayIdx) =>
                    Array.from({ length: 6 }).map((_, slotIdx) => (
                      <tr
                        key={`skeleton_${dayIdx}_${slotIdx}`}
                        className="border-b"
                      >
                        {/* Day column - only show on first time slot */}
                        {slotIdx === 0 ? (
                          <td
                            rowSpan={6}
                            className="px-4 py-3 text-sm font-medium text-gray-700 border-r align-top sticky left-0 bg-white"
                          >
                            <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                          </td>
                        ) : null}

                        {/* Period column */}
                        <td className="px-4 py-3 text-sm text-gray-600 border-r sticky left-[100px] bg-white">
                          <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                        </td>

                        {/* Class cells - show 1 if class selected, otherwise 6 */}
                        {Array.from({
                          length: selectedGroupIds.length > 0 ? 1 : 6,
                        }).map((_, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-3 py-2 text-sm border-r align-top"
                          >
                            <div className="space-y-1">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    )),
                )}
              </tbody>
            </table>
          ) : classesSorted.length === 0 || timeSlots.length === 0 ? (
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r sticky left-0 bg-gray-50 z-30">
                    Day
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r sticky left-[100px] bg-gray-50 z-30">
                    Period
                  </th>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <th
                      key={`empty-header-${i}`}
                      className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r min-w-[180px]"
                    >
                      <div className="h-5 w-16 mx-auto"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center">
                    <div className="text-gray-500">
                      No timetable data available
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {(selectedDays.length === 0
                  ? filteredDayOptions
                  : selectedDaysSorted
                ).map((day) => {
                  const dayIndex = DAY_MAP[day];
                  return (
                    <React.Fragment key={day}>
                      {/* Class headers row for this day */}
                      <tr
                        key={`${day}_classes`}
                        className="bg-indigo-50 border-b"
                      >
                        <td className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-gray-800 border-r sticky left-0 bg-indigo-50 z-10 whitespace-nowrap">
                          {day}
                        </td>
                        {classesSorted.map((cls) => (
                          <td
                            key={`${day}_class_${cls.id}`}
                            className="px-3 md:px-4 py-2 text-center text-xs md:text-sm font-semibold text-gray-800 border-r bg-indigo-50 whitespace-nowrap"
                          >
                            {cls.class_pair}
                          </td>
                        ))}
                      </tr>
                      {/* Time slot rows */}
                      {timeSlots.map((timeSlot, slotIdx) => (
                        <tr
                          key={`${day}_${timeSlot.id}`}
                          className="border-b hover:bg-gray-50/50"
                        >
                          {/* Period column */}
                          <td className="px-2  py-2  text-center md:text-sm text-gray-600 border-r sticky left-0 bg-white whitespace-nowrap">
                            <div className="font-medium">{timeSlot.slot}</div>
                          </td>

                          {/* Class cells */}
                          {classesSorted.map((cls) => {
                            const key = `${dayIndex}_${timeSlot.id}_${cls.id}`;
                            const lesson = gridData.get(key);
                            return (
                              <td
                                key={`cell-${key}`}
                                className="px-2 md:px-3 py-2 text-xs md:text-sm border-r align-top min-w-[130px] "
                              >
                                {lesson ? (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-gray-900">
                                      {lesson.subject}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {lesson.teacher}
                                    </div>
                                    {lesson.room && (
                                      <div className="text-xs text-gray-500">
                                        Room {lesson.room}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-xs">—</div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-4 md:p-6 border-b">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Upload Timetable
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Upload an Excel file with timetable data
              </p>
            </div>

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
                  value={uploadAcademicYear}
                  onChange={(e) => setUploadAcademicYear(e.target.value)}
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
              {uploadError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={18} />
                  <span className="text-sm">{uploadError}</span>
                </div>
              )}

              {/* Success */}
              {uploadResult && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-2">
                    Upload Successful!
                  </div>
                  <div className="flex gap-4 text-sm text-green-700">
                    <div>
                      <span className="font-semibold">Inserted:</span>{" "}
                      {uploadResult.inserted ?? 0}
                    </div>
                    <div>
                      <span className="font-semibold">Updated:</span>{" "}
                      {uploadResult.updated ?? 0}
                    </div>
                    <div>
                      <span className="font-semibold">Skipped:</span>{" "}
                      {uploadResult.skipped ?? 0}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFile(null);
                  setStartDate("");
                  setEndDate("");
                  setUploadError("");
                  setUploadResult(null);
                }}
                disabled={uploading}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={
                  !file || !uploadAcademicYear || !startDate || uploading
                }
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
      )}
    </div>
  );
}

export default Timetable;
