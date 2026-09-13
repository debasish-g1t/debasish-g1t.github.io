import React, { useMemo } from "react";
import "./TimelineBar.css";
import { formatDuration } from "../../utils/dates";

/**
 * Single-line title preview. Long titles scroll horizontally (marquee) within
 * the fixed-width tooltip instead of wrapping vertically.
 */
function MarqueeText({ children }) {
  const text = String(children ?? "");
  const scroll = text.length > 24;

  return (
    <span className="marquee">
      <span className={scroll ? "marquee__inner marquee__inner--scroll" : "marquee__inner"}>
        {text}
      </span>
    </span>
  );
}

/**
 * Horizontal navigation bar shown at the very top. Each dimmed dot marks an
 * activity's start timestamp (colour-coded by category); hovering reveals its
 * date, clicking scrolls to that entry in the left timeline. Year markers sit
 * below the rail for reference.
 */
export default function TimelineBar({
  flatEntries = [],
  categories = [],
  activeIndex = -1,
  activeYear = null,
  onSelect,
}) {
  const colorMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.color])),
    [categories]
  );

  const dots = useMemo(() => {
    return flatEntries
      .map((entry, index) => ({
        entry,
        index,
        ts: entry?.timeframe?.fromTs,
      }))
      .filter((dot) => typeof dot.ts === "number" && Number.isFinite(dot.ts));
  }, [flatEntries]);

  const bounds = useMemo(() => {
    if (!dots.length) return null;
    const min = Math.min(...dots.map((d) => d.ts));
    const max = Math.max(...dots.map((d) => d.ts), Date.now());
    return {
      min,
      max,
      span: Math.max(1, max - min),
      minYear: new Date(min).getFullYear(),
      maxYear: new Date(max).getFullYear(),
    };
  }, [dots]);

  const yearMarks = useMemo(() => {
    if (!bounds) return [];
    const marks = [];
    for (let year = bounds.minYear; year <= bounds.maxYear; year += 1) {
      const ts = new Date(year, 0, 1).getTime();
      marks.push({ year, pct: ((ts - bounds.min) / bounds.span) * 100 });
    }
    return marks;
  }, [bounds]);

  if (!dots.length || !bounds) return null;

  const position = (ts) => ((ts - bounds.min) / bounds.span) * 100;

  const tooltipAlign = (pct) => {
    if (pct < 22) return "start";
    if (pct > 78) return "end";
    return "center";
  };

  const activeDot = dots.find((dot) => dot.index === activeIndex);
  const activePct = activeDot ? position(activeDot.ts) : 0;
  const activeDuration = activeDot
    ? formatDuration(activeDot.entry.timeframe?.from, activeDot.entry.timeframe?.to)
    : "";

  // Highlight only the currently active entry's duration span.
  const activeSegment = (() => {
    if (!activeDot) return null;
    const tf = activeDot.entry.timeframe;
    if (!tf || tf.kind === "event") return null;
    const fromPct = position(activeDot.ts);
    const toTs = tf.to?.kind === "present" ? bounds.max : tf.to?.ts;
    if (toTs == null || toTs <= activeDot.ts) return null;
    const toPct = Math.min(100, position(toTs));
    const width = toPct - fromPct;
    if (width <= 0.1) return null;
    return {
      left: fromPct,
      width,
      color: colorMap[activeDot.entry.badge] || "var(--accent)",
    };
  })();

  return (
    <nav className="timeline-bar" aria-label="Timeline navigation">
      <div className="timeline-bar__inner">
        <div className="timeline-bar__brand" aria-hidden="true">
          <span className="timeline-bar__brand-text">timeline</span>
        </div>
        <div className="timeline-bar__track">
          <span className="timeline-bar__rail" aria-hidden="true" />
          <span
            className="timeline-bar__progress"
            style={{ width: `${activePct}%` }}
            aria-hidden="true"
          />

          {yearMarks.map((mark) => (
            <span
              key={mark.year}
              className={`timeline-bar__mark${
                mark.year === activeYear ? " is-active" : ""
              }`}
              style={{ left: `${mark.pct}%` }}
              aria-hidden="true"
            >
              <span className="timeline-bar__mark-label">{mark.year}</span>
            </span>
          ))}

          {activeSegment && (
            <span
              className="timeline-bar__duration"
              style={{
                left: `${activeSegment.left}%`,
                width: `${activeSegment.width}%`,
              }}
              aria-hidden="true"
            >
              <span className="timeline-bar__duration-label">
                {activeDuration || activeDot?.entry?.timeframe?.label}
              </span>
              <span className="timeline-bar__duration-bar" />
            </span>
          )}

          {activeSegment && (
            <span
              className="timeline-bar__segment"
              style={{
                left: `${activeSegment.left}%`,
                width: `${activeSegment.width}%`,
                "--dot-color": activeSegment.color,
              }}
              aria-hidden="true"
            />
          )}

          {dots.map(({ entry, index, ts }) => {
            const pct = position(ts);
            const color = colorMap[entry.badge] || "var(--accent)";
            return (
              <button
                key={index}
                type="button"
                className={`timeline-bar__dot${
                  index === activeIndex ? " is-active" : ""
                }`}
                style={{ left: `${pct}%`, "--dot-color": color }}
                onClick={() => onSelect?.(index)}
                aria-label={`Jump to ${entry.title || entry.timeframe.label}`}
              >
                <span
                  className={`timeline-bar__tooltip timeline-bar__tooltip--${tooltipAlign(pct)}`}
                >
                  {entry.title && <MarqueeText>{entry.title}</MarqueeText>}
                  <span className="timeline-bar__tooltip-date">
                    {entry.timeframe.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
