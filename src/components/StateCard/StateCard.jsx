import React from "react";
import "./StateCard.css";

/**
 * The fixed right-hand card. It reflects the active year's state and shows that
 * year as the reference (stickers are derived from the timeline content by the
 * parent).
 */
export default function StateCard({ person, state, fallbackImage }) {
  const image = state?.image || person?.image || fallbackImage;
  const name = person?.name || "Portfolio";
  const label = state?.label || "Portfolio";
  const description = state?.description || person?.tagline || "";
  const stickers = state?.stickers?.length ? state.stickers : ["Active"];
  const year = state?.year != null ? String(state.year) : null;

  return (
    <div className="state-card">
      <div className="state-card__photo" aria-hidden="true">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span className="state-card__photo-fallback">{name.charAt(0)}</span>
        )}
      </div>

      <div className="state-card__clock">
        <span className="state-card__date">Year</span>
        <span className="state-card__time">{year || "—"}</span>
      </div>

      <div className="state-card__body">
        <p className="state-card__name">{name}</p>
        <h2 className="state-card__label">{label}</h2>
        {description && <p className="state-card__description">{description}</p>}
      </div>

      <div className="state-card__stickers">
        {stickers.map((sticker) => (
          <span key={sticker} className="state-card__sticker">
            {sticker}
          </span>
        ))}
      </div>
    </div>
  );
}
