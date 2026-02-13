import React from "react";
import {
  DAY_MAP,
  CELL_MIN_W,
  SKELETON_COLS,
  SKELETON_ROWS,
} from "./timetableUtils";

/** Threshold: if there are this many class columns or fewer, let the table
 *  auto-size instead of stretching to 100 % width. */
const AUTO_WIDTH_THRESHOLD = 3;

/* ─── Shared outer shell ─── */

function TableShell({ children, colCount }) {
  const tableWidth =
    colCount != null && colCount <= AUTO_WIDTH_THRESHOLD ? "" : "w-full";
  return (
    <div className="h-full overflow-auto bg-white rounded-xl shadow-sm border">
      <table className={`${tableWidth} border-collapse`}>{children}</table>
    </div>
  );
}

/* ─── Placeholder header (skeleton & empty states) ─── */

function PlaceholderHeader({ colCount, animated = false }) {
  return (
    <thead className="sticky top-0 z-20">
      <tr className="bg-gray-50 border-b">
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r sticky left-0 bg-gray-50 z-30">
          Day
        </th>
        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r sticky left-[100px] bg-gray-50 z-30">
          Period
        </th>
        {Array.from({ length: colCount }).map((_, i) => (
          <th
            key={i}
            className={`px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r ${CELL_MIN_W}`}
          >
            {animated ? (
              <div className="h-5 bg-gray-200 rounded animate-pulse mx-auto w-16" />
            ) : (
              <div className="h-5 w-16 mx-auto" />
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/* ─── Skeleton body ─── */

function SkeletonContent({ filters }) {
  const dayRows = filters.days.length === 0 ? SKELETON_ROWS : 1;
  const classCols = filters.classes.length > 0 ? 1 : SKELETON_COLS;

  return (
    <TableShell colCount={classCols}>
      <PlaceholderHeader colCount={classCols} animated />
      <tbody>
        {Array.from({ length: dayRows }).map((_, dayIdx) =>
          Array.from({ length: SKELETON_ROWS }).map((_, slotIdx) => (
            <tr key={`sk_${dayIdx}_${slotIdx}`} className="border-b">
              {slotIdx === 0 && (
                <td
                  rowSpan={SKELETON_ROWS}
                  className="px-4 py-3 text-sm font-medium text-gray-700 border-r align-top sticky left-0 bg-white"
                >
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
                </td>
              )}
              <td className="px-4 py-3 text-sm text-gray-600 border-r sticky left-[100px] bg-white">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
              </td>
              {Array.from({ length: classCols }).map((_, i) => (
                <td key={i} className="px-3 py-2 text-sm border-r align-top">
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </td>
              ))}
            </tr>
          )),
        )}
      </tbody>
    </TableShell>
  );
}

/* ─── Empty body ─── */

function EmptyContent() {
  return (
    <TableShell colCount={SKELETON_COLS}>
      <PlaceholderHeader colCount={SKELETON_COLS} />
      <tbody>
        <tr>
          <td colSpan={SKELETON_COLS + 2} className="px-8 py-16 text-center">
            <div className="text-gray-500">No timetable data available</div>
          </td>
        </tr>
      </tbody>
    </TableShell>
  );
}

/* ─── Data body ─── */

function DataContent({ grid, daysList }) {
  const { timeSlots, classesSorted, gridData } = grid;

  return (
    <TableShell colCount={classesSorted.length}>
      <tbody>
        {daysList.map((day) => {
          const dayIndex = DAY_MAP[day];
          return (
            <React.Fragment key={day}>
              {/* Day + class headers */}
              <tr className="bg-indigo-50 border-b">
                <td className="px-3 md:px-4 py-2 text-xs md:text-sm font-semibold text-gray-800 border-r sticky left-0 bg-indigo-50 z-10 whitespace-nowrap">
                  {day}
                </td>
                {classesSorted.map((cls) => (
                  <td
                    key={`${day}_cls_${cls.id}`}
                    className="px-3 md:px-4 py-2 text-center text-xs md:text-sm font-semibold text-gray-800 border-r bg-indigo-50 whitespace-nowrap"
                  >
                    {cls.class_pair}
                  </td>
                ))}
              </tr>

              {/* Time-slot rows */}
              {timeSlots.map((ts) => (
                <tr
                  key={`${day}_${ts.id}`}
                  className="border-b hover:bg-gray-50/50"
                >
                  <td className="px-2 py-2 text-center md:text-sm text-gray-600 border-r sticky left-0 bg-white whitespace-nowrap">
                    <div className="font-medium">{ts.slot}</div>
                  </td>

                  {classesSorted.map((cls) => {
                    const key = `${dayIndex}_${ts.id}_${cls.id}`;
                    const lesson = gridData.get(key);
                    return (
                      <td
                        key={`cell-${key}`}
                        className={`px-2 md:px-3 py-2 text-xs md:text-sm border-r align-top ${CELL_MIN_W}`}
                      >
                        {lesson ? (
                          <div className="space-y-1">
                            <div className="bg-gray-200 rounded-lg text-center font-semibold text-gray-900">
                              {lesson.subject}
                            </div>
                            <div className="text-center rounded-lg bg-gray-100 text-xs text-gray-600">
                              {lesson.teacher}
                            </div>
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
    </TableShell>
  );
}

/* ─── Main export ─── */

export default function TimetableTable({
  loading,
  grid,
  filters,
  filteredDayOptions,
  selectedDaysSorted,
}) {
  if (loading) return <SkeletonContent filters={filters} />;

  const { timeSlots, classesSorted } = grid;
  const hasData = classesSorted.length > 0 && timeSlots.length > 0;

  if (!hasData) return <EmptyContent />;

  const daysList =
    filters.days.length === 0 ? filteredDayOptions : selectedDaysSorted;

  return <DataContent grid={grid} daysList={daysList} />;
}
