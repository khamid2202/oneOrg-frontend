import React, { useEffect, useMemo, useState } from "react";
import { useGlobalContext } from "../../../Hooks/UseContext.jsx";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderBoard() {
  const {
    studentsWithPoints,
    studentsWithPointsLoading,
    fetchStudentsWithPoints,
  } = useGlobalContext();

  const [query, setQuery] = useState("");

  // Initial load and polling
  useEffect(() => {
    let active = true;
    const fetchAndSchedule = () => {
      fetchStudentsWithPoints(query.trim());
      if (active) {
        setTimeout(fetchAndSchedule, 10000);
      }
    };
    fetchAndSchedule();
    return () => {
      active = false;
    };
  }, [query, fetchStudentsWithPoints]);

  const sorted = useMemo(() => {
    return [...(studentsWithPoints || [])].sort(
      (a, b) => Number(b.total_points || 0) - Number(a.total_points || 0),
    );
  }, [studentsWithPoints]);

  // Determine if we are doing a "silent" update or a first-time load
  const isInitialLoading = studentsWithPointsLoading && sorted.length === 0;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
        <div className="w-64">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header - Styled like a table but using Divs for easier animation */}
        <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Student</div>
          <div className="col-span-3">Class</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        <div className="relative min-h-[200px]">
          {isInitialLoading ? (
            <div className="p-12 text-center text-gray-400 animate-pulse">
              Loading Leaderboard...
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No students found
            </div>
          ) : (
            <div className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {sorted.map((s, idx) => (
                  <motion.div
                    key={s.student_id || s.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    // These styles ensure the row "pops" out of the flat list
                    style={{
                      position: "relative",
                      zIndex: 1, // Base z-index
                    }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 35, // Very slow, deliberate movement
                        damping: 15, // Smooth stop with no jitter
                        mass: 1.5, // Feels "heavy" and premium
                      },
                    }}
                    // This logic adds a shadow and lift while the row is reordering
                    whileLayout={{
                      zIndex: 50, // Forces the moving row to the front
                      scale: 1.02, // Slightly grows so it looks like it's "closer" to the user
                      boxShadow: "0px 10px 30px rgba(0,0,0,0.1)", // Adds depth
                      backgroundColor: "#fff", // Ensures it doesn't look transparent while passing over
                    }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-t border-gray-50 bg-white"
                  >
                    <div className="col-span-1 font-mono text-gray-400">
                      {idx + 1}
                    </div>
                    <div className="col-span-6 font-medium text-gray-900">
                      {s.full_name || s.name || "Unnamed Student"}
                    </div>
                    <div className="col-span-3 text-gray-500 text-sm">
                      {s.group?.class_pair || s.class_pair || "-"}
                    </div>
                    <div className="col-span-2 text-right font-bold text-indigo-600">
                      {Number(s.total_points || 0).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
