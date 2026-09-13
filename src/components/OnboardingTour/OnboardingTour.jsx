import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import "./OnboardingTour.css";

const STEPS = [
  {
    target: ".timeline-bar",
    title: "Timeline overview",
    text: "Each dot is a milestone in Debasish's journey. Hover to see its date, or click to jump straight to it.",
    placement: "bottom",
  },
  {
    target: ".state-card",
    title: "About this period",
    text: "This card describes Debasish's role and the tags that summarise what he was doing during the highlighted year.",
    placement: "right",
  },
  {
    target: ".control-panel",
    title: "Search & filter",
    text: "Look up roles, projects, papers, or organisations, and toggle categories to focus on what interests you.",
    placement: "top",
  },
  {
    target: ".timeline-entry",
    title: "Browse his work",
    text: "Scroll through Debasish's timeline — each card is a role, project, publication, or event. The glowing card is currently selected.",
    placement: "left",
  },
];

function measure(target) {
  const el = document.querySelector(target);
  if (!el) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      top: vh * 0.3,
      left: vw * 0.3,
      width: vw * 0.4,
      height: 160,
      bottom: vh * 0.3 + 160,
      right: vw * 0.3 + vw * 0.4,
    };
  }
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
    bottom: r.bottom,
    right: r.right,
  };
}

const CALLOUT_W = 280;
const CALLOUT_H = 200;
const CALLOUT_PAD = 12;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Returns the callout's top-left position, clamped so it never leaves the
// viewport (which is what was causing it to be cut off).
function calloutPosition(placement, rect, gap = 16) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  let left;
  let top;

  switch (placement) {
    case "top":
      left = cx - CALLOUT_W / 2;
      top = rect.top - gap - CALLOUT_H;
      break;
    case "right":
      left = rect.right + gap;
      top = cy - CALLOUT_H / 2;
      break;
    case "left":
      left = rect.left - gap - CALLOUT_W;
      top = cy - CALLOUT_H / 2;
      break;
    case "bottom":
    default:
      left = cx - CALLOUT_W / 2;
      top = rect.bottom + gap;
      break;
  }

  return {
    left: clamp(left, CALLOUT_PAD, vw - CALLOUT_W - CALLOUT_PAD),
    top: clamp(top, CALLOUT_PAD, vh - CALLOUT_H - CALLOUT_PAD),
  };
}

const TOUR_COOKIE = "portfolio_tour_seen";
const TOUR_TTL_DAYS = 7;
// The production build always shows the tour (cookie ignored) so it can be
// previewed repeatedly while testing. Flip to false to always respect the cookie.
const IGNORE_COOKIE_IN_BUILD = true;

function setTourCookie() {
  const expires = new Date(
    Date.now() + TOUR_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `${TOUR_COOKIE}=1; expires=${expires}; path=/; SameSite=Lax`;
}

function hasTourCookie() {
  if (typeof document === "undefined") return false;
  const name = `${TOUR_COOKIE}=`;
  return document.cookie
    .split("; ")
    .some((part) => part.startsWith(name) && part.slice(name.length) === "1");
}

function shouldSkipTour() {
  if (IGNORE_COOKIE_IN_BUILD && process.env.NODE_ENV === "production") {
    return false;
  }
  return hasTourCookie();
}

export default function OnboardingTour({ restartToken = 0 }) {
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState(null);

  const dismiss = useCallback(() => {
    setStep(-1);
    setTourCookie();
  }, []);

  // Start the tour shortly after load (within the first 3 seconds), unless the
  // visitor has already seen it recently.
  useEffect(() => {
    if (shouldSkipTour()) return;
    // Start after the boot overlay has finished so the two don't overlap.
    const timer = setTimeout(() => setStep(0), 3600);
    return () => clearTimeout(timer);
  }, []);

  // Manual restart (triggered from the Control panel).
  useEffect(() => {
    if (restartToken <= 0) return;
    setStep(0);
  }, [restartToken]);

  // Lock body scroll while the tour is active.
  useEffect(() => {
    if (step < 0) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [step]);

  // Measure (and re-measure on resize/scroll) the current step's target.
  useLayoutEffect(() => {
    if (step < 0 || step >= STEPS.length) return;
    const target = STEPS[step].target;
    const update = () => setRect(measure(target));
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [step]);

  // Escape to dismiss.
  useEffect(() => {
    if (step < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, dismiss]);

  if (step < 0 || step >= STEPS.length || !rect) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="tour">
      <div className="tour__click" onClick={dismiss} aria-hidden="true" />

      <div
        className="tour__spotlight"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />

      <div
        className={`tour__callout tour__callout--${current.placement}`}
        style={calloutPosition(current.placement, rect)}
      >
        <span
          className={`tour__arrow tour__arrow--${current.placement}`}
          aria-hidden="true"
        />
        <div className="tour__body">
          <strong className="tour__title">{current.title}</strong>
          <p className="tour__text">{current.text}</p>
        </div>
        <div className="tour__controls">
          <span className="tour__counter">
            {step + 1} / {STEPS.length}
          </span>
          <button type="button" className="tour__skip" onClick={dismiss}>
            Skip
          </button>
          <button
            type="button"
            className="tour__next"
            onClick={() => (isLast ? dismiss() : setStep(step + 1))}
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
