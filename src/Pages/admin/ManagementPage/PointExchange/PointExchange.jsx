import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../../Library/RequestMaker";
import { endpoints } from "../../../../Library/Endpoints";
import BackButton from "../../../../Layouts/Buttons/BackButton.jsx";
import ExchangeHistory from "./ExchangeHistory";

function PointExchange() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [exchangeRate, setExchangeRate] = useState("10");
  const [dollarAmount, setDollarAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (!selectedStudent) {
        setResults([]);
      }
      setError("");
      return undefined;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(endpoints.GET_STUDENTS_WITH_POINTS, {
          q: trimmed,
        });
        const list = res?.data?.students || res?.data?.data || [];
        setResults(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to search students.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [query, selectedStudent]);

  const displayName = (student) =>
    student?.full_name ||
    [student?.first_name, student?.last_name].filter(Boolean).join(" ") ||
    student?.name ||
    "Unnamed";

  const totalPoints = Number(selectedStudent?.total_points ?? 0);
  const parsedRate = Number(exchangeRate);
  const parsedDollars = Number(dollarAmount);
  const effectiveRate = Number.isFinite(parsedRate) ? parsedRate : 0;
  const effectiveDollars = Number.isFinite(parsedDollars) ? parsedDollars : 0;
  const pointsDelta = effectiveDollars * effectiveRate;
  const pointsDeltaRounded = Number(pointsDelta.toFixed(2));
  const pointsAmountDisplay = Math.abs(pointsDeltaRounded).toFixed(2);
  const isAddingPoints = effectiveDollars < 0;

  const handleExchange = async () => {
    if (!selectedStudent) return;
    if (effectiveRate <= 0 || !Number.isFinite(effectiveRate)) {
      toast.error("Enter a valid exchange rate.");
      return;
    }
    if (Math.abs(pointsDeltaRounded) <= 0) {
      toast.error("Enter a dollar amount greater than 0.");
      return;
    }
    if (!isAddingPoints && pointsDeltaRounded > totalPoints) {
      toast.error("Points to retrieve exceed total points.");
      return;
    }

    if (Math.abs(effectiveDollars) > 500) {
      const confirmed = window.confirm(
        "This exchange is over $500. Do you want to continue?",
      );
      if (!confirmed) return;
    }

    const studentId = selectedStudent?.student_id || selectedStudent?.id;
    const groupId =
      selectedStudent?.group?.id ||
      selectedStudent?.group_id ||
      selectedStudent?.student_group_id ||
      null;

    if (!studentId) {
      toast.error("Missing student id.");
      return;
    }

    setSubmitting(true);
    try {
      const reason = isAddingPoints ? "change to Points" : "change to Dollars";
      const pointsPayload = isAddingPoints
        ? Math.abs(pointsDeltaRounded)
        : -Math.abs(pointsDeltaRounded);

      await api.post(endpoints.EXCHANGE_POINTS_BULK, [
        {
          student_id: studentId,
          group_id: groupId,
          subject_id: null,
          points: pointsPayload,
          reason,
        },
      ]);
      toast.success("Exchange recorded.");
      setSelectedStudent(null);
      setDollarAmount("");
    } catch (submitError) {
      toast.error(
        submitError?.response?.data?.message || "Failed to record exchange.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto p-4  ">
      {/* When no student is selected: header+search in one block, history in another */}
      {!selectedStudent && (
        <div className="flex flex-col flex-1">
          <div className="sticky top-0 z-20 bg-white flex-none shadow-sm">
            <div className="relative mb-8 text-center">
              <BackButton className="absolute left-0" />
              <h1 className="text-2xl font-bold text-gray-900">
                Convert points
              </h1>
            </div>

            {/* Search Section */}
            <div className="space-y-4 relative">
              {/* Search Input */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by student name or class..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-gray-900 shadow-lg shadow-gray-200/50 ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-slate-400 transition-shadow"
                />
                {loading && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Results (overlay) */}

              <div className="absolute left-0 right-0 mt-2 z-30 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 max-h-[60vh] overflow-auto">
                {error && !loading && (
                  <div className="flex items-center gap-3 p-4 text-red-600">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {!loading && !error && results.length === 0 && query.trim() && (
                  <div className="flex flex-col items-center py-12 text-gray-400">
                    <svg
                      className="mb-3 h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm">No students found</p>
                  </div>
                )}

                {!loading && !error && results.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {results.map((student) => (
                      <button
                        type="button"
                        key={student?.student_id || student?.id}
                        onClick={() => {
                          setSelectedStudent(student);
                          setQuery("");
                        }}
                        className="group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-semibold text-lg group-hover:from-slate-200 group-hover:to-slate-300 transition-colors">
                          {displayName(student).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {displayName(student)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student?.group?.class_pair || "No class"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-gray-900">
                            {Number(student?.total_points ?? 0)}
                          </span>
                          <span className="text-xs text-gray-400">points</span>
                        </div>
                        <svg
                          className="h-5 w-5 text-gray-300 group-hover:text-slate-600 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <ExchangeHistory />
          </div>
        </div>
      )}

      {/* Exchange Module */}
      {selectedStudent && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
          {/* Student Header */}
          <div className="bg-gradient-to-r from-slate-600 to-slate-800 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white font-bold text-xl backdrop-blur-sm">
                  {displayName(selectedStudent).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {displayName(selectedStudent)}
                  </h2>
                  <p className="text-sm text-slate-300">
                    {selectedStudent?.group?.class_pair || "No class"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setDollarAmount("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 backdrop-blur-sm"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Points Balance */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Current Balance
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {totalPoints}
                </span>
                <span className="text-sm text-gray-400">points</span>
              </div>
            </div>
          </div>

          {/* Exchange Form */}
          <div className="p-6 space-y-5">
            {/* Mode Indicator */}
            <div
              className={`flex items-center gap-3 rounded-xl p-4 ${
                isAddingPoints
                  ? "bg-emerald-50 text-emerald-700"
                  : effectiveDollars > 0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-gray-50 text-gray-500"
              }`}
            >
              {isAddingPoints ? (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Adding points (student pays dollars)
                  </span>
                </>
              ) : effectiveDollars > 0 ? (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Retrieving points (giving dollars)
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    Enter a dollar amount to begin
                  </span>
                </>
              )}
            </div>

            {/* Input Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Exchange Rate
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={exchangeRate}
                    onChange={(event) => setExchangeRate(event.target.value)}
                    className="w-full rounded-xl border-0 bg-gray-50 py-3.5 pl-4 pr-20 text-gray-900 ring-1 ring-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-400 transition-all"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-gray-400">
                    pts / $1
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Dollar Amount
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={dollarAmount}
                    onChange={(event) => setDollarAmount(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border-0 bg-gray-50 py-3.5 pl-8 pr-4 text-gray-900 ring-1 ring-gray-200 placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-slate-400 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Use negative (-) to add points instead
                </p>
              </div>
            </div>

            {/* Result Display */}
            {effectiveDollars !== 0 && (
              <div
                className={`rounded-xl p-5 ${
                  isAddingPoints
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-amber-500 to-orange-500"
                }`}
              >
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-medium opacity-90">
                    {isAddingPoints ? "Points to Add" : "Points to Retrieve"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {pointsAmountDisplay}
                    </span>
                    <span className="text-sm opacity-75">points</span>
                  </div>
                </div>
                {!isAddingPoints && pointsDeltaRounded > totalPoints && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm text-white">
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Exceeds available balance
                  </div>
                )}
              </div>
            )}

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleExchange}
              disabled={submitting || effectiveDollars === 0}
              className={`w-full rounded-xl py-4 text-sm font-semibold shadow-lg transition-all ${
                submitting || effectiveDollars === 0
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 shadow-none"
                  : isAddingPoints
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-slate-500/30 hover:shadow-slate-500/50 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : (
                <span>
                  {effectiveDollars === 0
                    ? "Enter amount to continue"
                    : isAddingPoints
                      ? `Add ${pointsAmountDisplay} Points`
                      : `Exchange for $${Math.abs(effectiveDollars).toFixed(2)}`}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PointExchange;
