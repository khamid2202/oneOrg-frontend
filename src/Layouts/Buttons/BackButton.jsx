import React from "react";
import { useNavigate } from "react-router-dom";

function BackButton({ label = "Back", className = "", ...props }) {
  const navigate = useNavigate();

  const baseClassName =
    "inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 transition hover:border-gray-400 hover:text-gray-900";

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClassName} ${className}`.trim()}
      {...props}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </button>
  );
}

export default BackButton;
