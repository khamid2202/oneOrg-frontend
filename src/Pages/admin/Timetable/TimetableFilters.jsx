import React from "react";
import MultiSelectDropdown from "../../../Layouts/MultiSelectDropdown.jsx";

export default function TimetableFilters({ options, filters, updateFilter }) {
  const { classOptions, teacherOptions, dayOptions } = options;

  return (
    <div className="bg-white border rounded-xl p-3 md:p-4 shadow-sm">
      <div className="flex gap-3 items-stretch lg:items-end flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Class</label>
          <MultiSelectDropdown
            label="All classes"
            allSelectedLabel="All classes"
            options={classOptions.map((o) => ({
              key: o.value,
              label: o.label,
            }))}
            selected={filters.classes}
            onChange={(v) => updateFilter("classes", v)}
            width="w-64"
            activeColor="blue"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Teacher</label>
          <MultiSelectDropdown
            label="All teachers"
            allSelectedLabel="All teachers"
            options={teacherOptions.map((o) => ({
              key: o.value,
              label: o.label,
            }))}
            selected={filters.teachers}
            onChange={(v) => updateFilter("teachers", v)}
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
            selected={filters.days}
            onChange={(v) => updateFilter("days", v)}
            width="w-48"
            activeColor="blue"
          />
        </div>
      </div>
    </div>
  );
}
