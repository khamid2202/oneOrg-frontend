import React, { useMemo, useState } from "react";

/* ── Helpers ── */

const pointColor = (value) =>
  value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-400";

const totalColor = (value) =>
  value > 0 ? "text-green-600" : value < 0 ? "text-red-600" : "text-gray-700";

const formatPoints = (value) =>
  value > 0 ? `+${value}` : value === 0 ? "0" : `${value}`;

const getTotalPoints = (pointsBySubject = {}) =>
  Object.values(pointsBySubject).reduce((sum, value) => sum + value, 0);

/* ── Sub-components ── */

function PointCell({ value }) {
  return (
    <td
      className={`w-[82px] border border-slate-400 px-1 py-2 text-center align-middle text-[11px] ${pointColor(value)}`}
    >
      {formatPoints(value)}
    </td>
  );
}

function TotalCell({ value }) {
  return (
    <td
      className={`border border-slate-500 bg-blue-50 px-2 py-2 text-center align-middle text-[11px] font-bold ${totalColor(value)}`}
    >
      {formatPoints(value)}
    </td>
  );
}

function StudentRow({ student, subjects, pointsBySubject, rowNumber, total }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="w-[46px] border border-slate-400 px-1 py-2 text-center align-middle text-[11px] font-semibold text-slate-700">
        {rowNumber}
      </td>
      <td className="border border-slate-400 px-2 py-2 text-center align-middle text-[11px] text-slate-700">
        {student?.student_id || student?.id || "-"}
      </td>
      <td className="min-w-[220px] border border-slate-400 px-2 py-2 align-middle text-[11px] font-medium text-slate-900 whitespace-nowrap">
        {student?.full_name || student?.name || "Unnamed student"}
      </td>
      {subjects.map((subject) => (
        <PointCell key={subject} value={pointsBySubject[subject] || 0} />
      ))}
      <TotalCell value={total} />
    </tr>
  );
}

/* ── Main table ── */

export default function PointsTable({
  students,
  subjects,
  studentPointsBySubject,
  loading,
  error,
  dateRangeLabel,
  className: selectedClassName,
}) {
  const [totalSortOrder, setTotalSortOrder] = useState("desc");

  const sortedStudents = useMemo(() => {
    const list = [...students];
    list.sort((studentA, studentB) => {
      const keyA = studentA?.student_id || studentA?.id;
      const keyB = studentB?.student_id || studentB?.id;
      const totalA = getTotalPoints(studentPointsBySubject[keyA] || {});
      const totalB = getTotalPoints(studentPointsBySubject[keyB] || {});

      if (totalA !== totalB) {
        return totalSortOrder === "asc" ? totalA - totalB : totalB - totalA;
      }

      const nameA = studentA?.full_name || studentA?.name || "";
      const nameB = studentB?.full_name || studentB?.name || "";
      return nameA.localeCompare(nameB);
    });

    return list;
  }, [students, studentPointsBySubject, totalSortOrder]);

  const toggleTotalSortOrder = () => {
    setTotalSortOrder((current) => (current === "asc" ? "desc" : "asc"));
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-600">
        Loading students...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-600">
        No students found for this class.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Students in {selectedClassName}
        </h2>
        {dateRangeLabel && (
          <div className="mb-3 text-sm font-medium text-slate-600">
            {dateRangeLabel}
          </div>
        )}
        <span className="text-sm text-gray-500">{students.length} total</span>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-500">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse text-[11px]">
            <thead className="bg-blue-100">
              <tr>
                <th className="w-[46px] border border-slate-500 px-1 py-2 text-center align-middle font-bold text-slate-800">
                  No.
                </th>
                <th className="w-[50px] border border-slate-500 px-2 py-2 text-center align-middle font-bold text-slate-800">
                  ID
                </th>
                <th className="min-w-[220px] border border-slate-500 px-2 py-2 text-left align-middle font-bold text-slate-800">
                  Ism/Familya
                </th>
                {subjects.map((subject) => (
                  <th
                    key={subject}
                    className="w-[82px] border border-slate-500 px-1 py-2 text-center align-middle text-[11px] font-bold text-slate-800"
                  >
                    <div
                      className="mx-auto truncate max-w-[74px] leading-4"
                      title={subject}
                    >
                      {subject}
                    </div>
                  </th>
                ))}
                <th className="w-[90px] border border-slate-500 bg-blue-200 px-2 py-2 text-center align-middle font-bold text-slate-900">
                  <button
                    type="button"
                    onClick={toggleTotalSortOrder}
                    className="inline-flex w-full items-center justify-center gap-1 font-bold"
                    title={`Sort by total (${totalSortOrder})`}
                  >
                    <span>Total</span>
                    <span>{totalSortOrder === "asc" ? "↑" : "↓"}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sortedStudents.map((student, index) => {
                const studentKey = student?.student_id || student?.id;
                const pointsBySubject =
                  studentPointsBySubject[studentKey] || {};
                const total = getTotalPoints(pointsBySubject);
                return (
                  <StudentRow
                    key={
                      studentKey ||
                      `${student?.full_name || "student"}-${index}`
                    }
                    student={student}
                    subjects={subjects}
                    pointsBySubject={pointsBySubject}
                    rowNumber={index + 1}
                    total={total}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
