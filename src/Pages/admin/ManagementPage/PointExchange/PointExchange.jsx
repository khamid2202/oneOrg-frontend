import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../../../Library/RequestMaker";
import { endpoints } from "../../../../Library/Endpoints";
import BackButton from "../../../../Layouts/Buttons/BackButton.jsx";
import ExchangeHistory from "./ExchangeHistory";
import {
  Search,
  History,
  ArrowRightLeft,
  X,
  Plus,
  Minus,
  Info,
  AlertCircle,
} from "lucide-react";

function PointExchange() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [exchangeRate, setExchangeRate] = useState("10");
  const [dollarAmount, setDollarAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (!selectedStudent) setResults([]);
      setError("");
      return;
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
        setError(err?.response?.data?.message || "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [query, selectedStudent]);

  const displayName = (s) => s?.full_name || s?.name || "Student";
  const totalPoints = Number(selectedStudent?.total_points ?? 0);
  const effectiveRate = Number(exchangeRate) || 0;
  const effectiveDollars = Number(dollarAmount) || 0;
  const pointsDelta = effectiveDollars * effectiveRate;
  const isAddingPoints = effectiveDollars < 0;

  const handleExchange = async () => {
    if (!selectedStudent || effectiveRate <= 0 || Math.abs(pointsDelta) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSubmitting(true);
    try {
      const studentId = selectedStudent?.student_id || selectedStudent?.id;
      const reason = isAddingPoints ? "change to Points" : "change to Dollars";

      await api.post(endpoints.EXCHANGE_POINTS_BULK, [
        {
          student_id: studentId,
          group_id: selectedStudent?.group?.id || selectedStudent?.group_id,
          points: isAddingPoints
            ? Math.abs(pointsDelta)
            : -Math.abs(pointsDelta),
          reason,
        },
      ]);

      toast.success("Exchange completed successfully");
      setSelectedStudent(null);
      setDollarAmount("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Exchange failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-[15px]">
      {/* UPPER PART: Header & Search (Based on image) */}
      <div className="flex-none p-2 md:p-4 border-b border-slate-100">
        <div className="mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BackButton />
              <div>
                <h1 className="text-lg font-black text-slate-800 tracking-tight">
                  Convert Points
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Manage student currency exchanges
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg font-bold text-xs transition-all border border-slate-200"
            >
              <History size={15} />
              <span>History</span>
            </button>
          </div>

          <div className="max-w-2xl mx-auto group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by student name or class group..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white border border-indigo-100 rounded-lg py-2 pl-8 pr-3 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all text-base font-medium shadow-sm"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOWER PART: Results or Exchange Module */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-slate-50/30">
        <div className="max-w-3xl mx-auto">
          {!selectedStudent ? (
            <div className="grid gap-2">
              {results.length > 0 ? (
                results.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudent(student);
                      setQuery("");
                    }}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-2 text-left">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-base border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {displayName(student).charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">
                          {displayName(student)}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          {student?.group?.class_pair || "No Group Assigned"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-800">
                        {student.total_points}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        Pts
                      </p>
                    </div>
                  </button>
                ))
              ) : query.trim() && !loading ? (
                <div className="text-center py-12">
                  <p className="text-slate-400 font-medium">
                    No students found matching your search.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-300 font-medium italic">
                    Start typing to search for a student...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Active Student Banner */}
              <div className="bg-slate-900 p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black backdrop-blur-md">
                    {displayName(selectedStudent).charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight">
                      {displayName(selectedStudent)}
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      {selectedStudent?.group?.class_pair}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4">
                {/* Balance & Form Content (Kept from previous version) */}
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg mb-4 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-indigo-100 text-indigo-600 rounded-md">
                      <ArrowRightLeft size={14} />
                    </div>
                    <span className="font-bold text-slate-600 text-xs">
                      Balance
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">
                      {totalPoints}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      pts
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-2 mb-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Exchange Rate
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-md py-2 px-2 font-black text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
                        pts/$
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                      Dollar Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xs">
                        $
                      </span>
                      <input
                        type="text"
                        placeholder="0.00"
                        value={dollarAmount}
                        onChange={(e) => setDollarAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-md py-2 pl-6 pr-2 font-black text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
                      />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mt-1">
                      <Info size={10} /> Use negative (-) to add points
                    </p>
                  </div>
                </div>

                {/* Result Card & Button Logic */}
                {effectiveDollars !== 0 && (
                  <div
                    className={`p-2 rounded-lg mb-4 border transition-all ${
                      isAddingPoints
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isAddingPoints ? (
                          <Plus size={15} />
                        ) : (
                          <Minus size={15} />
                        )}
                        <span className="font-black text-sm">
                          {isAddingPoints ? "Buying Points" : "Spending Points"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black">
                          {Math.abs(pointsDelta).toFixed(0)}
                        </p>
                        <p className="text-[10px] font-bold uppercase opacity-70">
                          Points
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleExchange}
                  disabled={
                    submitting ||
                    !dollarAmount ||
                    (!isAddingPoints && Math.abs(pointsDelta) > totalPoints)
                  }
                  className={`w-full py-2 rounded-lg font-black text-base transition-all shadow-md flex items-center justify-center gap-2 ${
                    submitting ||
                    !dollarAmount ||
                    (!isAddingPoints && Math.abs(pointsDelta) > totalPoints)
                      ? "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                      : isAddingPoints
                        ? "bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600"
                        : "bg-indigo-600 text-white shadow-indigo-500/20 hover:bg-indigo-700"
                  }`}
                >
                  {submitting ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="relative w-full max-w-sm bg-white h-full shadow-md animate-in slide-in-from-right duration-200">
            <div className="h-full overflow-y-auto">
              <ExchangeHistory />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PointExchange;
