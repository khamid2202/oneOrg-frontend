import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../../Library/RequestMaker.jsx";
import { endpoints } from "../../../../Library/Endpoints.jsx";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Clock,
  ArrowRightLeft,
} from "lucide-react";

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
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

  const filteredItems = useMemo(() => {
    return items.filter(
      (it) =>
        it.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.student_id?.toString().includes(searchTerm),
    );
  }, [items, searchTerm]);

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-slate-400 text-sm font-medium">
            Loading records...
          </p>
        </div>
      </div>
    );

  return (
    <div className="w-full flex flex-col h-full bg-white">
      {/* HEADER SECTION */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
            <ArrowRightLeft className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Exchange History
          </h1>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="space-y-4 mb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search name or ID..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Active Filters
            </span>
            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase">
              All Conversions
            </span>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-6">Student Entity</th>
              <th className="py-3 px-4 text-center">Group</th>
              <th className="py-3 px-4">Direction</th>
              <th className="py-3 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredItems.map((it) => {
              const isToDollars = it.reason === "change to Dollars";
              return (
                <tr
                  key={it.id}
                  className="group hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm leading-tight">
                        {it.student_name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase">
                        REF: #{it.student_id}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                      {it.class_pair || `${it.group_grade}-${it.group_class}`}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <DirectionBadge type={it.reason} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div
                      className={`text-sm font-black ${isToDollars ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {isToDollars ? "-" : "+"}
                      {Math.abs(it.points)}
                      <span className="ml-1 text-[10px] opacity-60">PT</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Search size={32} className="text-slate-200 mb-2" />
            <p className="text-slate-400 text-sm font-medium">
              No records found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const DirectionBadge = ({ type }) => {
  const isToDollars = type === "change to Dollars";
  const styles = isToDollars
    ? "bg-rose-50 text-rose-600 border-rose-100"
    : "bg-emerald-50 text-emerald-600 border-emerald-100";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tight ${styles}`}
    >
      {isToDollars ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
      {isToDollars ? "Points → $" : "$ → Points"}
    </div>
  );
};

export default ExchangeHistory;
