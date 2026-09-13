import React, { useEffect, useState } from "react";
import "./Timeline.css";

const ORG_TAGS = [
  "Organization",
  "Education",
  "Research Publication",
  "International Conference",
];

// Read the theme's status codes (e.g. "[200 OK]") so they stay configurable in
// terminal.css while still being usable as DOM text next to the counter.
function useStatusText(ongoing) {
  const [text, setText] = useState(ongoing ? "[200 OK]" : "[301 MOVED]");
  useEffect(() => {
    if (typeof document === "undefined") return;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(ongoing ? "--status-ongoing" : "--status-complete")
      .trim()
      .replace(/^"|"$/g, "");
    if (value) setText(value);
  }, [ongoing]);
  return text;
}

/**
 * A single primary entry from a time-range. Nested projects / source links /
 * tech-stack links are rendered inline under the entry.
 */
export default function TimelineEntry({ item, index, total, color, isActive }) {
  const isOrg = ORG_TAGS.includes(item?.badge);
  const hasTimeframe = Boolean(item?.timeframe);
  const ongoing = item?.timeframe?.kind === "ongoing";
  const statusText = useStatusText(ongoing);

  return (
    <article
      className={`timeline-entry${isActive ? " timeline-entry--active" : ""}${
        ongoing ? " timeline-entry--ongoing" : ""
      }`}
      data-timeline-index={index}
      style={color ? { "--cat-color": color } : undefined}
      {...(hasTimeframe ? { "data-timeline-from": "" } : {})}
    >
      {isActive && (
        <span className="timeline-entry__status" aria-hidden="true">
          <span className="timeline-entry__status-tag">{statusText}</span>
          {total > 0 && (
            <span className="timeline-entry__status-count">
              {index + 1} / {total}
            </span>
          )}
        </span>
      )}

      {(hasTimeframe || item?.badge) && (
        <div className="timeline-entry__meta">
          {hasTimeframe && (
            <div className="timeline-entry__timeframe">
              <span className="timeline-entry__timeframe-dot" />
              {item.timeframe.label}
            </div>
          )}

          {item?.badge && (
            <span className="timeline-entry__badge">{item.badge}</span>
          )}
        </div>
      )}

      {item?.title && <h3 className="timeline-entry__title">{item.title}</h3>}
      {item?.description && (
        <p className="timeline-entry__description">{item.description}</p>
      )}
      {item?.image && (
        <img src={item.image} alt="" className="timeline-entry__image" />
      )}

      {isOrg && item?.c_img && (
        <div className="timeline-entry__org">
          <div className="timeline-entry__org-img">
            <img
              src={item.c_img}
              alt=""
              style={item.c_img_bg ? { background: item.c_img_bg } : undefined}
            />
          </div>
          {item?.o_detail && (
            <div className="timeline-entry__org-details">
              {Object.entries(item.o_detail).map(([key, value]) => (
                <div key={key} className="timeline-entry__org-line">
                  <span className="timeline-entry__org-key">{key}</span>
                  <span className="timeline-entry__org-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {item?.projects?.length ? (
        <div className="timeline-entry__projects">
          {item.projects.map((project, i) => (
            <div key={i} className="timeline-entry__project">
              {project?.title && <h4>{project.title}</h4>}
              {project?.description && <p>{project.description}</p>}
              {project?.links?.length ? (
                <div className="timeline-entry__links">
                  {project.links.map((link, j) => (
                    <a
                      key={j}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="timeline-entry__link"
                    >
                      {link?.image && <img src={link.image} alt="" />}
                      {link?.title && <span>{link.title}</span>}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {item?.stack?.length ? (
        <div className="timeline-entry__links">
          {item.stack.map((link, j) => (
            <a
              key={j}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="timeline-entry__link"
            >
              {link?.image && <img src={link.image} alt="" />}
              {link?.text && <span>{link.text}</span>}
            </a>
          ))}
        </div>
      ) : null}

      {item?.links?.length ? (
        <div className="timeline-entry__links">
          {item.links.map((link, j) => (
            <a
              key={j}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="timeline-entry__link"
            >
              {link?.image && <img src={link.image} alt="" />}
              {link?.text && <span>{link.text}</span>}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
