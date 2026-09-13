import React, { useEffect, useState } from "react";
import "./ControlPanel.css";
import { useTheme } from "../../theme/ThemeProvider";

// Read the theme's status codes ("[200 OK]" / "[301 MOVED]") so the filter
// labels stay in sync with terminal.css.
function useStatusCodes() {
  const [codes, setCodes] = useState({ ongoing: "[200 OK]", complete: "[301 MOVED]" });
  useEffect(() => {
    if (typeof document === "undefined") return;
    const read = (name) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim()
        .replace(/^"|"$/g, "");
    const ongoing = read("--status-ongoing");
    const complete = read("--status-complete");
    if (ongoing || complete) {
      setCodes({
        ongoing: ongoing || "[200 OK]",
        complete: complete || "[301 MOVED]",
      });
    }
  }, []);
  return codes;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToBottom() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
}

function ArrowUpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="m5 12 7 7 7-7" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Left-hand control panel: quick navigation + search + category filters.
 */
const STATUS_FILTERS = [
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

export default function ControlPanel({
  categories,
  active,
  onToggle,
  activeStatus,
  onToggleStatus,
  query,
  onQueryChange,
  onRestartTour,
}) {
  const { mode, setMode } = useTheme();
  const statusCodes = useStatusCodes();
  const isDark = mode !== "light";
  const statusCode = (id) =>
    id === "active" ? statusCodes.ongoing : statusCodes.complete;

  return (
    <div className="control-panel">
      <div className="control-panel__header">
        <h3 className="control-panel__title">Control panel</h3>
        <div className="control-panel__actions">
          <button
            type="button"
            className="control-panel__action"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            data-tooltip="Scroll to top"
          >
            <ArrowUpIcon />
          </button>
          <button
            type="button"
            className="control-panel__action"
            onClick={scrollToBottom}
            aria-label="Scroll to bottom"
            data-tooltip="Scroll to bottom"
          >
            <ArrowDownIcon />
          </button>
          <button
            type="button"
            className="control-panel__action"
            onClick={() => setMode(isDark ? "light" : "dark")}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            data-tooltip={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className="control-panel__action control-panel__action--tour"
            onClick={onRestartTour}
            aria-label="Replay the tour"
            data-tooltip="Replay the tour"
          >
            <HelpIcon />
          </button>
        </div>
      </div>

      <div className="control-panel__search">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search roles, events, papers…"
          className="control-panel__search-input"
          aria-label="Search timeline"
        />
      </div>

      <div className="control-panel__section">
        <h4 className="control-panel__section-title">Type</h4>
        <div className="control-panel__list">
          {categories.map((category) => (
            <label
              key={category.id}
              className="control-panel__item"
              style={{ "--cat-color": category.color }}
            >
              <input
                type="checkbox"
                checked={!!active[category.id]}
                onChange={() => onToggle(category.id)}
              />
              <span className="control-panel__check" aria-hidden="true" />
              <span className="control-panel__label">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="control-panel__section">
        <h4 className="control-panel__section-title">Status</h4>
        <div className="control-panel__list">
          {STATUS_FILTERS.map((status) => (
            <label key={status.id} className="control-panel__item">
              <input
                type="checkbox"
                checked={!!activeStatus?.[status.id]}
                onChange={() => onToggleStatus(status.id)}
              />
              <span className="control-panel__check" aria-hidden="true" />
              <span className="control-panel__label">{status.label}</span>
              <span className="control-panel__code">
                {statusCode(status.id)}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
