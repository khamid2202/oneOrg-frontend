import React, { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { CalendarDays } from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import BackButton from "../../../../Layouts/Buttons/BackButton.jsx";
import { useGlobalContext } from "../../../../Hooks/UseContext.jsx";
import PointsTable from "./PointsTable.jsx";

function PointReport() {
  const {
    classes = [],
    classesLoading,
    classesError,
    fetchStudentsForClassGroup,
    timetableData = [],
  } = useGlobalContext();
  const [dateMode, setDateMode] = useState("single");
  const [singleDate, setSingleDate] = useState(() => new Date());
  const [rangeDate, setRangeDate] = useState([null, null]);
  const [rangeStart, rangeEnd] = rangeDate;
  const [weeklyDate, setWeeklyDate] = useState(() => new Date());
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [isClassFilterOpen, setIsClassFilterOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const classFilterRef = useRef(null);
  const tableRef = useRef(null);
  const displayDateFormat = "MMM d, yyyy";
  const weeklyStart = useMemo(
    () => startOfWeek(weeklyDate, { weekStartsOn: 1 }),
    [weeklyDate],
  );
  const weeklyEnd = useMemo(
    () => endOfWeek(weeklyDate, { weekStartsOn: 1 }),
    [weeklyDate],
  );

  const classOptions = useMemo(() => {
    if (!Array.isArray(classes) || classes.length === 0) return [];

    return classes
      .map((group) => {
        const label = group?.class_pair || group?.name;
        if (!label) return null;
        return {
          key: group?.id || label,
          label,
          group,
        };
      })
      .filter(Boolean)
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true }),
      );
  }, [classes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        classFilterRef.current &&
        !classFilterRef.current.contains(event.target)
      ) {
        setIsClassFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateModeChange = (nextMode) => {
    if (nextMode === "range") {
      setRangeDate([null, null]);
      setDateMode("range");
      return;
    }

    if (nextMode === "weekly") {
      setWeeklyDate(singleDate || new Date());
      setDateMode("weekly");
      return;
    }

    setDateMode("single");
  };

  // Derive unique subjects and per-student subject totals, filtered by date
  const { subjects, studentPointsBySubject } = useMemo(() => {
    const subjectsSet = new Set();
    const pointsMap = {}; // { studentKey: { subject: totalPoints } }

    classStudents.forEach((student) => {
      const studentKey = student?.student_id || student?.id;
      if (!studentKey) return;

      pointsMap[studentKey] = {};

      (student?.points || []).forEach((point) => {
        // Skip exchange / conversion points (no subject)
        if (!point.subject) return;

        // Date filtering
        if (point.date) {
          const pointDate = new Date(point.date);
          pointDate.setHours(0, 0, 0, 0);

          if (dateMode === "single" && singleDate) {
            const selected = new Date(singleDate);
            selected.setHours(0, 0, 0, 0);
            if (pointDate.getTime() !== selected.getTime()) return;
          } else if (dateMode === "range" && rangeStart && rangeEnd) {
            const start = new Date(rangeStart);
            start.setHours(0, 0, 0, 0);
            const end = new Date(rangeEnd);
            end.setHours(0, 0, 0, 0);
            if (pointDate < start || pointDate > end) return;
          } else if (dateMode === "weekly") {
            const start = new Date(weeklyStart);
            start.setHours(0, 0, 0, 0);
            const end = new Date(weeklyEnd);
            end.setHours(0, 0, 0, 0);
            if (pointDate < start || pointDate > end) return;
          }
        }

        subjectsSet.add(point.subject);
        pointsMap[studentKey][point.subject] =
          (pointsMap[studentKey][point.subject] || 0) + point.points;
      });
    });

    return {
      subjects: Array.from(subjectsSet).sort(),
      studentPointsBySubject: pointsMap,
    };
  }, [
    classStudents,
    dateMode,
    singleDate,
    rangeStart,
    rangeEnd,
    weeklyStart,
    weeklyEnd,
  ]);

  // Get unique subjects from timetable for the selected class (used in weekly mode)
  const weeklySubjects = useMemo(() => {
    if (dateMode !== "weekly" || !selectedClass) return [];

    const classPair = selectedClass?.class_pair || selectedClass?.name || "";
    const classId = selectedClass?.id;

    const subjectSet = new Set();
    timetableData.forEach((item) => {
      const match =
        (classId && String(item.group_id) === String(classId)) ||
        (classPair && item.class_pair === classPair);
      if (match && item.subject) subjectSet.add(item.subject);
    });

    return Array.from(subjectSet).sort();
  }, [dateMode, selectedClass, timetableData]);

  const dateRangeLabel = useMemo(() => {
    const formatShort = (dateValue) =>
      format(dateValue, "dd-MMM").toLowerCase();

    if (dateMode === "range") {
      if (rangeStart && rangeEnd) {
        return `${formatShort(rangeStart)}  →  ${formatShort(rangeEnd)}`;
      }
      if (rangeStart) {
        return `${formatShort(rangeStart)}  →  ${formatShort(rangeStart)}`;
      }
      return "";
    }

    if (dateMode === "weekly") {
      return `${formatShort(weeklyStart)}  →  ${formatShort(weeklyEnd)}`;
    }

    if (singleDate) {
      const dayLabel = formatShort(singleDate);
      return `${dayLabel}  →  ${dayLabel}`;
    }

    return "";
  }, [dateMode, rangeStart, rangeEnd, weeklyStart, weeklyEnd, singleDate]);

  const handleCopyTableImage = async () => {
    if (!tableRef.current) return;
    if (!navigator.clipboard || typeof window.ClipboardItem === "undefined") {
      toast.error("Clipboard image copy is not supported in this browser.");
      return;
    }

    setCopyLoading(true);
    try {
      // Temporarily remove overflow clipping so the full table is visible
      const overflowEls = tableRef.current.querySelectorAll(
        ".overflow-x-auto, .overflow-hidden",
      );
      const savedStyles = [];
      overflowEls.forEach((el) => {
        savedStyles.push({
          el,
          overflow: el.style.overflow,
          maxWidth: el.style.maxWidth,
        });
        el.style.overflow = "visible";
        el.style.maxWidth = "none";
      });

      // Temporarily remove truncation on subject headers so text isn't clipped
      const truncateEls = tableRef.current.querySelectorAll(".truncate");
      const savedTruncateStyles = [];
      truncateEls.forEach((el) => {
        savedTruncateStyles.push({
          el,
          overflow: el.style.overflow,
          textOverflow: el.style.textOverflow,
          whiteSpace: el.style.whiteSpace,
          maxWidth: el.style.maxWidth,
        });
        el.style.overflow = "visible";
        el.style.textOverflow = "unset";
        el.style.whiteSpace = "nowrap";
        el.style.maxWidth = "none";
      });

      // Also expand the container so html2canvas captures full width
      const container = tableRef.current;
      const prevWidth = container.style.width;
      const prevOverflow = container.style.overflow;
      container.style.width = "max-content";
      container.style.overflow = "visible";

      // A scale of 3 provides high resolution without creating an excessively huge image
      // that might get aggressively compressed by clipboard managers or chat apps.
      const captureScale = 3;

      const canvas = await html2canvas(container, {
        scale: captureScale,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
      });

      // Restore original styles
      container.style.width = prevWidth;
      container.style.overflow = prevOverflow;
      savedStyles.forEach(({ el, overflow, maxWidth }) => {
        el.style.overflow = overflow;
        el.style.maxWidth = maxWidth;
      });
      savedTruncateStyles.forEach(
        ({ el, overflow, textOverflow, whiteSpace, maxWidth }) => {
          el.style.overflow = overflow;
          el.style.textOverflow = textOverflow;
          el.style.whiteSpace = whiteSpace;
          el.style.maxWidth = maxWidth;
        },
      );

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
            return;
          }
          reject(new Error("Failed to create image blob."));
        }, "image/png");
      });

      await navigator.clipboard.write([
        new window.ClipboardItem({ "image/png": blob }),
      ]);
      toast.success("Table image copied to clipboard.");
    } catch (err) {
      console.error("Failed to copy table image:", err);
      toast.error("Failed to copy table image.");
    } finally {
      setCopyLoading(false);
    }
  };

  const handleSelectClass = async (group) => {
    setSelectedClass(group);
    setIsClassFilterOpen(false);
    setStudentsLoading(true);
    setStudentsError("");
    try {
      const list = await fetchStudentsForClassGroup(group);
      setClassStudents(Array.isArray(list) ? list : []);
      console.log("Clicked class:", group);
      console.log("Students for selected class:", list || []);
    } catch (error) {
      console.error("Failed to load students for selected class:", error);
      setClassStudents([]);
      setStudentsError("Failed to load students for selected class.");
    } finally {
      setStudentsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className=" mx-auto space-y-6">
        <div className="relative flex items-center justify-center">
          <BackButton className="absolute left-0" />
          <h1 className="text-2xl font-semibold text-gray-900">Point Report</h1>
          <button
            onClick={handleCopyTableImage}
            disabled={copyLoading || !selectedClass}
            className="absolute right-0 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-purple-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copyLoading ? "Copying..." : "Copy Table Image"}
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 justify-between">
              <div className="w-full sm:flex-1 sm:max-w-3xl">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {dateMode === "single"
                    ? "Select date"
                    : dateMode === "range"
                      ? "Select range"
                      : "Select week"}
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <div className="relative" ref={classFilterRef}>
                    <button
                      type="button"
                      onClick={() => setIsClassFilterOpen((prev) => !prev)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                        selectedClass
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {selectedClass
                        ? selectedClass?.class_pair ||
                          selectedClass?.name ||
                          "Class"
                        : "Class"}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isClassFilterOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {isClassFilterOpen && (
                      <div className="absolute left-0 z-20 mt-1 w-64 rounded-md bg-white shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                        {classesLoading ? (
                          <div className="px-3 py-2 text-sm text-gray-600">
                            Loading classes...
                          </div>
                        ) : classesError ? (
                          <div className="px-3 py-2 text-sm text-red-700">
                            {classesError}
                          </div>
                        ) : classOptions.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-600">
                            No classes found.
                          </div>
                        ) : (
                          <div className="py-1">
                            {classOptions.map((option) => {
                              const active =
                                selectedClass?.id === option?.group?.id;
                              return (
                                <button
                                  key={option.key}
                                  type="button"
                                  onClick={() =>
                                    handleSelectClass(option.group)
                                  }
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                                    active
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                                      active
                                        ? "bg-blue-500 border-blue-500 text-white"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {active && (
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative w-full sm:flex-1">
                    {dateMode === "single" ? (
                      <DatePicker
                        selected={singleDate}
                        onChange={(date) => setSingleDate(date)}
                        placeholderText="Select date"
                        dateFormat={displayDateFormat}
                        className="min-w-[260px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        wrapperClassName="w-full"
                        showPopperArrow={false}
                      />
                    ) : dateMode === "range" ? (
                      <DatePicker
                        selectsRange
                        startDate={rangeStart}
                        endDate={rangeEnd}
                        onChange={(update) => setRangeDate(update)}
                        placeholderText="Select date range"
                        dateFormat={displayDateFormat}
                        className="min-w-[260px] rounded-lg border border-gray-200 px-3 py-2  text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        wrapperClassName="w-full"
                        showPopperArrow={false}
                        monthsShown={2}
                      />
                    ) : (
                      <DatePicker
                        selected={weeklyDate}
                        onChange={(date) => setWeeklyDate(date)}
                        placeholderText="Select week"
                        dateFormat={displayDateFormat}
                        className="min-w-[260px] rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        wrapperClassName="w-full"
                        showPopperArrow={false}
                        showWeekPicker
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="inline-flex shrink-0 rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => handleDateModeChange("single")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    dateMode === "single"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  One day
                </button>
                <button
                  type="button"
                  onClick={() => handleDateModeChange("weekly")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    dateMode === "weekly"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => handleDateModeChange("range")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    dateMode === "range"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Range
                </button>
              </div>
            </div>
          </div>
        </div>

        {!selectedClass && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-center rounded-lg border border-blue-100 bg-blue-50 px-4 py-6 text-sm text-blue-700">
              Please choose a CLASS to view the point report.
            </div>
          </div>
        )}

        {selectedClass && (
          <div ref={tableRef}>
            <PointsTable
              students={classStudents}
              subjects={dateMode === "weekly" ? weeklySubjects : subjects}
              studentPointsBySubject={studentPointsBySubject}
              loading={studentsLoading}
              error={studentsError}
              dateRangeLabel={dateRangeLabel}
              className={
                selectedClass?.class_pair || selectedClass?.name || "class"
              }
            />
          </div>
        )}

        <style>{`
          .react-datepicker {
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            font-family: inherit;
          }
          .react-datepicker__header {
            background: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
          }
          .react-datepicker__day--selected,
          .react-datepicker__day--keyboard-selected,
          .react-datepicker__day--in-range,
          .react-datepicker__day--in-selecting-range,
          .react-datepicker__day--range-start,
          .react-datepicker__day--range-end {
            background-color: #2563eb;
            color: #fff;
          }
        `}</style>
      </div>
    </div>
  );
}

export default PointReport;
