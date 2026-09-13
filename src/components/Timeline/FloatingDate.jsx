import React from "react";
import "./Timeline.css";

/**
 * Sticky "floating" date that lives at the top of the timeline pane. It shows
 * the timeframe of whichever entry is currently active, falling back to the
 * year range when nothing has been scrolled into view yet.
 */
export default function FloatingDate({ timeframe, fallback }) {
  return (
    <div className="floating-date" aria-hidden="true">
      <span className="floating-date__rail" />
      <span className="floating-date__label">
        {timeframe?.label || fallback || "Timeline"}
      </span>
    </div>
  );
}
