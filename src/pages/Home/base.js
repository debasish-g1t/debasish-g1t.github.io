import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./base.css";
import Timeline from "../../components/Timeline/Timeline";
import TimelineBar from "../../components/TimelineBar/TimelineBar";
import StateCard from "../../components/StateCard/StateCard";
import ControlPanel from "../../components/ControlPanel/ControlPanel";
import Contacts from "../../components/Contacts/Contacts";
import OnboardingTour from "../../components/OnboardingTour/OnboardingTour";
import BootOverlay from "../../components/BootOverlay/BootOverlay";
import { loadMainTimeline } from "../../content/mainTimelineLoader";
import { loadUserStates } from "../../content/userStatesLoader";
import { loadCategories } from "../../content/categoriesLoader";

const FALLBACK_IMAGE = `${process.env.PUBLIC_URL}/assets/icons/profile_logo.png`;

const BADGE_TO_STICKER = {
  Organization: "Employee",
  Education: "Student",
  "Research Publication": "Researcher",
  "International Conference": "Researcher",
};

const STICKER_ORDER = ["Active", "Student", "Graduate", "Employee", "Researcher"];

function entrySearchText(entry) {
  const parts = [
    entry.badge,
    entry.title,
    entry.description,
    entry.timeframe?.label,
  ];
  if (entry.o_detail) {
    for (const [key, value] of Object.entries(entry.o_detail)) {
      parts.push(key, value);
    }
  }
  for (const group of ["projects", "stack", "links"]) {
    if (Array.isArray(entry[group])) {
      for (const item of entry[group]) {
        parts.push(item.title, item.text, item.description);
      }
    }
  }
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function yearOf(entry) {
  if (!entry?.timeframe?.fromTs) return null;
  return new Date(entry.timeframe.fromTs).getFullYear();
}

/**
 * Derive the stickers for a year from the timeline content. The state YAML
 * only supplies the label / description / image — the tags come from here.
 */
function deriveStickers(entries, year) {
  const stickers = new Set();
  for (const entry of entries) {
    if (yearOf(entry) !== year) continue;

    const sticker = BADGE_TO_STICKER[entry.badge];
    if (sticker) stickers.add(sticker);

    if (entry.badge === "Education" && entry.timeframe?.kind !== "ongoing") {
      stickers.add("Graduate");
    }
    if (entry.timeframe?.kind === "ongoing") {
      stickers.add("Active");
    }
  }
  return STICKER_ORDER.filter((sticker) => stickers.has(sticker));
}

/**
 * For the current-year state there is no event content, so derive tags from
 * whatever is still ongoing right now.
 */
function deriveCurrentStickers(entries) {
  const stickers = new Set();
  for (const entry of entries) {
    if (entry.timeframe?.kind !== "ongoing") continue;

    const sticker = BADGE_TO_STICKER[entry.badge];
    if (sticker) stickers.add(sticker);
    stickers.add("Active");
  }
  if (stickers.size === 0) stickers.add("Active");
  return STICKER_ORDER.filter((sticker) => stickers.has(sticker));
}

const BaseHomeComp = () => {
  const [content, setContent] = useState(null);
  const [userStates, setUserStates] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeStep, setActiveStep] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [statusFilters, setStatusFilters] = useState({
    active: true,
    completed: true,
  });
  const [query, setQuery] = useState("");
  const [tourToken, setTourToken] = useState(0);
  const [showBoot, setShowBoot] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadMainTimeline().then((loaded) => {
      if (mounted) setContent(loaded);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    loadUserStates().then((data) => {
      if (mounted) setUserStates(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    loadCategories().then(({ categories: loaded }) => {
      if (!mounted) return;
      setCategories(loaded);
      setActiveFilters(
        Object.fromEntries(loaded.map((category) => [category.id, true]))
      );
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Endless scroll: at the bottom of the event list, keep scrolling down to
  // restart from the first event; at the top, scroll up to jump to the last.
  useEffect(() => {
    const onWheel = (event) => {
      if (document.documentElement.getAttribute("data-theme") !== "terminal") {
        return;
      }
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const nearBottom = window.scrollY >= maxScroll - 120;
      const nearTop = window.scrollY <= 120;
      if (event.deltaY > 0 && nearBottom) {
        event.preventDefault();
        const first = document.querySelector('[data-timeline-index="0"]');
        first?.scrollIntoView({ block: "start", behavior: "auto" });
      } else if (event.deltaY < 0 && nearTop) {
        event.preventDefault();
        window.scrollTo({ top: maxScroll, behavior: "auto" });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const onActive = useCallback((step) => setActiveStep(step), []);

  const toggleFilter = useCallback((id) => {
    setActiveFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleStatus = useCallback((id) => {
    setStatusFilters((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const restartTour = useCallback(() => {
    setTourToken((t) => t + 1);
  }, []);

  const dismissBoot = useCallback(() => setShowBoot(false), []);

  const colorMap = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [category.id, category.color])
      ),
    [categories]
  );

  const activeColor = useMemo(() => {
    if (!activeStep?.badge) return undefined;
    return colorMap[activeStep.badge] || undefined;
  }, [activeStep, colorMap]);

  const allEntries = useMemo(() => {
    if (!content) return [];
    const list = [];
    for (const range of content.ranges) {
      for (const entry of range.entries) list.push(entry);
    }
    return list;
  }, [content]);

  const flatEntries = useMemo(() => {
    if (!content) return [];
    const q = query.trim().toLowerCase();
    const list = [];
    for (const range of content.ranges) {
      for (const entry of range.entries) {
        if (activeFilters[entry.badge] === false) continue;
        const status =
          entry.timeframe?.kind === "ongoing" ? "active" : "completed";
        if (statusFilters[status] === false) continue;
        if (q && !entrySearchText(entry).includes(q)) continue;
        list.push(entry);
      }
    }
    return list;
  }, [content, activeFilters, statusFilters, query]);

  const activeIndex = useMemo(() => {
    if (!activeStep) return -1;
    return flatEntries.indexOf(activeStep);
  }, [activeStep, flatEntries]);

  const scrollToEntry = useCallback((index) => {
    const el = document.querySelector(`[data-timeline-index="${index}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const activeYear = useMemo(() => {
    return yearOf(activeStep) ?? userStates?.defaultState?.year ?? null;
  }, [activeStep, userStates]);

  const currentState = useMemo(() => {
    if (!userStates) return null;
    const state =
      userStates.states.find((s) => s.year === activeYear) ||
      userStates.defaultState;
    const stickers = state?.current
      ? deriveCurrentStickers(allEntries)
      : deriveStickers(allEntries, state?.year);
    return state ? { ...state, stickers } : null;
  }, [userStates, activeYear, allEntries]);

  return (
    <div
      className="app"
      style={activeColor ? { "--active-color": activeColor } : undefined}
    >
      <TimelineBar
        flatEntries={flatEntries}
        categories={categories}
        activeIndex={activeIndex}
        activeYear={activeYear}
        onSelect={scrollToEntry}
      />

      <div className="app-shell">
        <aside className="state-pane">
          <StateCard
            person={userStates?.person}
            state={currentState}
            fallbackImage={FALLBACK_IMAGE}
          />
          <div className="control-stack">
            <Contacts contacts={userStates?.person?.contacts} />
            <ControlPanel
              categories={categories}
              active={activeFilters}
              onToggle={toggleFilter}
              activeStatus={statusFilters}
              onToggleStatus={toggleStatus}
              query={query}
              onQueryChange={setQuery}
              onRestartTour={restartTour}
            />
          </div>
        </aside>

        <main className="timeline-pane">
          <Timeline
            flatEntries={flatEntries}
            onActive={onActive}
            loading={content === null}
            colorMap={colorMap}
          />
        </main>
      </div>

      {showBoot && <BootOverlay onDone={dismissBoot} />}
      <OnboardingTour restartToken={tourToken} />
    </div>
  );
};

export default BaseHomeComp;
