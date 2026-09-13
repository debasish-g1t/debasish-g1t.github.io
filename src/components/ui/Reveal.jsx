import React, { useEffect, useRef, useState } from "react";

/**
 * Reveals its children once they scroll into the viewport.
 *
 * Pure CSS transition (`opacity` / `transform`) driven by a single
 * IntersectionObserver per element — no per-frame JS, no animation library.
 * After an element is revealed the observer is disconnected.
 *
 * Falls back to always-visible when IntersectionObserver is unavailable.
 * `prefers-reduced-motion` disables the transition via CSS.
 */
const Reveal = ({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "reveal-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
