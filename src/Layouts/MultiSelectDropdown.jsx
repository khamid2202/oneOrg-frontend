import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * A reusable multi-select dropdown filter component.
 *
 * @param {Object} props
 * @param {string} props.label - The label shown on the button when nothing is selected (e.g., "Class", "Teacher")
 * @param {string} props.allSelectedLabel - The label shown when all options are selected (e.g., "All classes")
 * @param {Array} props.options - Array of options: [{ key: string, label: string }] or strings
 * @param {Array} props.selected - Array of selected keys
 * @param {Function} props.onChange - Called with the new array of selected keys
 * @param {string} props.align - Dropdown alignment: "left" or "right" (default: "left")
 * @param {string} props.width - Dropdown width class (default: "w-56")
 * @param {string} props.activeColor - Color scheme: "indigo" | "blue" (default: "indigo")
 */
function MultiSelectDropdown({
  label = "Filter",
  allSelectedLabel = "All selected",
  options = [],
  selected = [],
  onChange,
  align = "left",
  width = "w-56",
  activeColor = "indigo",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to { key, label } format
  const normalizedOptions = useMemo(() => {
    return options
      .map((opt) => {
        if (typeof opt === "string") {
          return { key: opt, label: opt };
        }
        if (opt && typeof opt === "object" && opt.key !== undefined) {
          return { key: opt.key, label: opt.label ?? opt.key };
        }
        return null;
      })
      .filter(Boolean);
  }, [options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSelected = (key) => selected.includes(key);
  const selectedCount = selected.length;
  const allSelected =
    normalizedOptions.length > 0 && selectedCount >= normalizedOptions.length;

  const handleToggle = (key) => {
    if (!onChange) return;
    const newSelected = isSelected(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (!onChange) return;
    onChange(normalizedOptions.map((opt) => opt.key));
  };

  const handleClearAll = () => {
    if (!onChange) return;
    onChange([]);
  };

  const buttonLabel = useMemo(() => {
    if (selectedCount === 0) return label;
    if (allSelected) return allSelectedLabel;
    return `${selectedCount} selected`;
  }, [selectedCount, allSelected, label, allSelectedLabel]);

  // Color schemes
  const colors = {
    indigo: {
      active: "border-indigo-500 bg-indigo-50 text-indigo-700",
      inactive:
        "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
      selectAllBtn: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
      clearBtn: "bg-slate-100 text-slate-600 hover:bg-slate-200",
      itemActive: "bg-indigo-50 text-indigo-700",
      itemInactive: "text-slate-700",
      checkbox: "bg-indigo-500 border-indigo-500",
    },
    blue: {
      active: "border-blue-500 bg-blue-50 text-blue-700",
      inactive: "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
      selectAllBtn: "bg-blue-50 text-blue-700 hover:bg-blue-100",
      clearBtn: "bg-gray-100 text-gray-600 hover:bg-gray-200",
      itemActive: "bg-blue-50 text-blue-700",
      itemInactive: "text-gray-700",
      checkbox: "bg-blue-500 border-blue-500",
    },
  };

  const colorScheme = colors[activeColor] || colors.indigo;

  if (normalizedOptions.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-2 ${
          selectedCount > 0 ? colorScheme.active : colorScheme.inactive
        }`}
      >
        {buttonLabel}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} z-20 mt-1 ${width} rounded-md bg-white shadow-lg border border-slate-200 max-h-60 overflow-y-auto`}
        >
          <div className="sticky top-0 bg-white border-b border-slate-100 p-2 flex gap-2">
            {!allSelected && (
              <button
                type="button"
                onClick={handleSelectAll}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium ${colorScheme.selectAllBtn}`}
              >
                Select All
              </button>
            )}
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={`flex-1 rounded px-2 py-1 text-xs font-medium ${colorScheme.clearBtn}`}
              >
                Clear
              </button>
            )}
          </div>
          <div className="py-1">
            {normalizedOptions.map((opt) => {
              const active = isSelected(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleToggle(opt.key)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                    active ? colorScheme.itemActive : colorScheme.itemInactive
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      active
                        ? `${colorScheme.checkbox} text-white`
                        : "border-slate-300"
                    }`}
                  >
                    {active && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;
