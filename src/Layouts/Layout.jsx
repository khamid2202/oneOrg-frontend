import React, { useState } from "react";
import Navbar, { MobileNavbar } from "./Navbar";
import { Outlet } from "react-router-dom";

function LayoutWithHeader() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col h-dvh bg-gray-50 text-gray-900">
      <div className="flex flex-1 overflow-hidden">
        <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

        {/* Main content area */}
        <main className="flex-1 min-h-0 overflow-auto transition-all duration-300 max-w-full">
          <Outlet />
        </main>
      </div>
      <MobileNavbar />
    </div>
  );
}

export default LayoutWithHeader;
