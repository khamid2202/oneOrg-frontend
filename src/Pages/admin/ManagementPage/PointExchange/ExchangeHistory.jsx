import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../../Library/RequestMaker.jsx";
import { endpoints } from "../../../../Library/Endpoints.jsx";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  User,
  Clock,
  ArrowRightLeft,
} from "lucide-react";

// Formatting Helpers
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return d;
  }
};

function ExchangeHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          endpoints.GET_POINTS,
          {},
          { withCredentials: true },
        );
        const raw = res?.data?.points || [];
        const filtered = raw.filter(
          (p) =>
            p.reason === "change to Dollars" || p.reason === "change to Points",
        );

        filtered.sort(
          (a, b) =>
            new Date(b.created_at || b.date) - new Date(a.created_at || a.date),
        );
        if (mounted) setItems(filtered);
      } catch (err) {
        if (mounted) setError(err?.message || "Failed to load history");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered Items for Search
  const filteredItems = useMemo(() => {
    return items.filter(
      (it) =>
        it.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.student_id?.toString().includes(searchTerm),
    );
  }, [items, searchTerm]);

  // Derived Stats
  const stats = useMemo(() => {
    const toDollars = items.filter((i) => i.reason === "change to Dollars");
    const toPoints = items.filter((i) => i.reason === "change to Points");
    return {
      toDollarsCount: toDollars.length,
      toPointsCount: toPoints.length,
      totalPointsExchanged: items.reduce(
        (acc, curr) => acc + Math.abs(curr.points),
        0,
      ),
    };
  }, [items]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-slate-500 font-medium">Synchronizing records...</p>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl pt-5">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex justify-center items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-indigo-200 shadow-lg">
              <ArrowRightLeft className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 lg:text-3xl">
              Exchange History
            </h1>
          </div>
        </div>

        {/* <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <Download size={18} /> Export CSV
            </button>
          </div> */}
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
        {/* TABLE TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between bg-white">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Active Filters:
            </span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black text-slate-600">
              ALL CONVERSIONS
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <th className="py-5 px-8">Processed Date</th>
                <th className="py-5 px-6">Student Entity</th>
                <th className="py-5 px-6">Class Group</th>
                <th className="py-5 px-6">Conversion Direction</th>
                <th className="py-5 px-6">Amount</th>
                <th className="py-5 px-8">Authorized By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((it) => {
                const isToDollars = it.reason === "change to Dollars";
                return (
                  <tr
                    key={it.id}
                    className="group hover:bg-slate-50/80 transition-all"
                  >
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={14} className="text-slate-300" />
                        <span className="text-sm font-medium">
                          {fmtDate(it.created_at || it.date)}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase border border-slate-200">
                          {it.student_name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {it.student_name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            REF: #{it.student_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-600 shadow-sm">
                        {it.class_pair || `${it.group_grade}-${it.group_class}`}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <DirectionBadge type={it.reason} />
                    </td>
                    <td className="py-5 px-6">
                      <div
                        className={`text-sm font-black ${isToDollars ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {isToDollars ? "-" : "+"}
                        {Math.abs(it.points).toLocaleString()}
                        <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">
                          pts
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span className="text-sm font-semibold text-slate-600">
                          {it.created_by || it.teacher_name}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-800">
              No records match your query
            </p>
            <p className="text-slate-500 text-sm">
              Try adjusting your search terms or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-components
const StatCard = ({
  title,
  value,
  icon,
  bg = "bg-white",
  border = "border-slate-100",
  sub,
}) => (
  <div
    className={`${bg} ${border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group`}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <h2 className="text-3xl font-black text-slate-800">{value}</h2>
    {sub && (
      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
        {sub}
      </p>
    )}
  </div>
);

const DirectionBadge = ({ type }) => {
  const isToDollars = type === "change to Dollars";
  const styles = isToDollars
    ? "bg-rose-50 text-rose-700 border-rose-100"
    : "bg-emerald-50 text-emerald-700 border-emerald-100";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-tight ${styles}`}
    >
      {isToDollars ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
      {isToDollars ? "Points → Dollars" : "Dollars → Points"}
    </div>
  );
};

const HistoryIcon = ({ color, bg }) => (
  <div className={`${bg} p-1 rounded-md`}>
    <ArrowRightLeft className={`${color} w-4 h-4`} />
  </div>
);

const CoinsIcon = () => (
  <div className="text-amber-500 bg-amber-50 p-1 rounded-md">
    <ArrowRightLeft className="w-4 h-4" />
  </div>
);

export default ExchangeHistory;
