import React, { useEffect, useState } from "react";
import "./BootOverlay.css";

const BOOT_LINES = [
  {
    text: "this is a living resume — an interactive timeline of research, open-source, education and work.",
  },
  {
    text: "each milestone fills one screen: scroll to travel through time, or jump anywhere with the year map on top.",
  },
  {
    text: "the left panel filters by type and status ([200 OK] active · [301 MOVED] completed).",
  },
  {
    text: "the focused milestone shows its status and your position in the timeline.",
  },
];

const BOOT_DURATION_MS = 8000;
const LEAVE_DURATION_MS = 450;

/**
 * Full-screen "boot" splash shown once on load. It explains what the site is,
 * what it shows, and how to explore it, then hands off to the timeline (and
 * the onboarding tour).
 */
export default function BootOverlay({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), BOOT_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(onDone, LEAVE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [leaving, onDone]);

  return (
    <div
      className={`boot-overlay${leaving ? " boot-overlay--leave" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the interactive portfolio"
    >
      <div className="boot-overlay__window">
        <div className="boot-overlay__titlebar" aria-hidden="true">
          <span className="boot-overlay__dot boot-overlay__dot--red" />
          <span className="boot-overlay__dot boot-overlay__dot--amber" />
          <span className="boot-overlay__dot boot-overlay__dot--green" />
          <span className="boot-overlay__title">debasish@portfolio — interactive timeline</span>
        </div>

        <div className="boot-overlay__body">
          <p
            className="boot-overlay__cmd boot-overlay__line"
            style={{ animationDelay: "250ms" }}
          >
            $ ./serve --resume --interactive
          </p>

          {BOOT_LINES.map((line, index) => (
            <p
              key={index}
              className="boot-overlay__line"
              style={{ animationDelay: `${650 + index * 500}ms` }}
            >
              {line.text}
            </p>
          ))}

          <p
            className="boot-overlay__prompt"
            style={{ animationDelay: `${650 + BOOT_LINES.length * 500}ms` }}
          >
            ❯ explore. every screen is one chapter.
            <span className="boot-overlay__caret" aria-hidden="true" />
          </p>
        </div>

        <div className="boot-overlay__actions">
          <button
            type="button"
            className="boot-overlay__cta"
            onClick={() => setLeaving(true)}
          >
            Explore timeline →
          </button>
          <button
            type="button"
            className="boot-overlay__skip"
            onClick={() => setLeaving(true)}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
