import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Upload } from "lucide-react";
import { useGlobalContext } from "../../../Hooks/UseContext.jsx";
import {
  DAYS,
  filterTimetableData,
  getDayName,
  buildGrid,
} from "./timetableUtils";
import TimetableFilters from "./TimetableFilters.jsx";
import TimetableTable from "./TimetableTable.jsx";
import UploadModal from "./UploadModal.jsx";

/* ─── Initial filter state ─── */
const EMPTY_FILTERS = { classes: [], teachers: [], days: [] };

function Timetable() {
  const {
    timetableData,
    timetableLoading: loading,
    timetableError: error,
    timetableDerived: options,
    refreshTimetable,
  } = useGlobalContext();

  /* ── Single filter-state object ── */
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const updateFilter = useCallback(
    (key, value) => setFilters((prev) => ({ ...prev, [key]: value })),
    [],
  );

  /* Prune stale filter values when available options change */
  useEffect(() => {
    setFilters((prev) => ({
      classes: prev.classes.filter((id) =>
        options.classOptions.some((o) => o.value === id),
      ),
      teachers: prev.teachers.filter((id) =>
        options.teacherOptions.some((o) => o.value === id),
      ),
      days: prev.days.filter((d) => options.dayOptions.includes(d)),
    }));
  }, [options]);

  /* ── Grouped memo: filtered data + grid + day lists ── */
  const { filtered, grid, filteredDayOptions, selectedDaysSorted } =
    useMemo(() => {
      const filtered = filterTimetableData(timetableData, filters);
      const grid = buildGrid(filtered);

      // Days actually present in the filtered set
      const daySet = new Set();
      filtered.forEach((item) => {
        const d = getDayName(item);
        if (DAYS.includes(d)) daySet.add(d);
      });
      const filteredDayOptions = DAYS.filter((d) => daySet.has(d));

      // Active day-filter values kept in canonical order
      const selectedDaysSorted =
        filters.days.length === 0
          ? []
          : options.dayOptions.filter((d) => filters.days.includes(d));

      return { filtered, grid, filteredDayOptions, selectedDaysSorted };
    }, [timetableData, filters, options.dayOptions]);

  /* ── Upload modal toggle ── */
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header + Filters (non-scrolling) */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 w-full">
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
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-sm transition-all hover:from-purple-700 hover:to-purple-600 whitespace-nowrap w-full sm:w-auto"
          >
            <Upload size={18} />
            Upload Timetable
          </button>
        </div>

        <TimetableFilters
          options={options}
          filters={filters}
          updateFilter={updateFilter}
        />

        {error && (
          <div className="flex items-center gap-2 text-red-600 mt-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Scrolling table */}
      <div className="flex-1 px-4 md:px-6 pb-4 md:pb-6 min-h-0">
        <TimetableTable
          loading={loading}
          grid={grid}
          filters={filters}
          filteredDayOptions={filteredDayOptions}
          selectedDaysSorted={selectedDaysSorted}
        />
      </div>

      {/* Upload modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={refreshTimetable}
        />
      )}
    </div>
  );
}

export default Timetable;
