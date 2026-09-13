import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Timeline.css";
import TimelineEntry from "./TimelineEntry";
import FloatingDate from "./FloatingDate";

/**
 * Left-hand, scrollable timeline (presentational). Renders the already-filtered
 * `flatEntries` (current → past) and owns the scroll-spy: while the page
 * scrolls it finds the last entry whose top crossed a reference line and
 * reports it upward through `onActive`.
 */
export default function Timeline({ flatEntries = [], onActive, loading = false, colorMap = {} }) {
  const [active, setActive] = useState(null);
  const entriesRef = useRef(null);
  const onActiveRef = useRef(onActive);
  onActiveRef.current = onActive;

  const activeIndex = useMemo(() => {
    if (!active) return -1;
    return flatEntries.indexOf(active);
  }, [active, flatEntries]);

  useEffect(() => {
    if (!flatEntries.length) {
      setActive(null);
      onActiveRef.current?.(null);
      return;
    }

    let raf = 0;

    const compute = () => {
      // At the very top we're at "now" — no specific entry is selected yet.
      if (window.scrollY <= 0) {
        setActive(null);
        onActiveRef.current?.(null);
        return;
      }

      const root = entriesRef.current;
      if (!root) return;
      const targets = root.querySelectorAll("[data-timeline-from]");
      if (!targets.length) return;

      const threshold = Math.max(120, window.innerHeight * 0.35);
      let current = null;

      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) current = el;
      });

      if (current) {
        const index = Number(current.dataset.timelineIndex);
        const step = flatEntries[index];
        setActive(step || null);
        onActiveRef.current?.(step || null);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [flatEntries]);

  return (
    <div className="timeline-view">
      <FloatingDate
        timeframe={active?.timeframe}
        fallback={flatEntries[0]?.timeframe?.label}
      />
      <div className="timeline-entries" ref={entriesRef}>
        {loading ? (
          <p className="timeline-loading">Loading timeline…</p>
        ) : flatEntries.length === 0 ? (
          <p className="timeline-loading">No items match the selected filters.</p>
        ) : (
          flatEntries.map((entry, index) => (
            <TimelineEntry
              key={index}
              item={entry}
              index={index}
              total={flatEntries.length}
              color={colorMap[entry.badge]}
              isActive={index === activeIndex}
            />
          ))
        )}
      </div>
    </div>
  );
}
