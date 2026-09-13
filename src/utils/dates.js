/**
 * Small, dependency-free date helpers shared by the timeline and state loaders.
 *
 * Dates in the YAML content are written as human-friendly strings and can be
 * one of three shapes:
 *   - "2025"           (year precision)
 *   - "2025-03"        (month precision)
 *   - "2025-03-10"     (day precision)
 *   - "present" / "now" (open-ended upper bound)
 *
 * Everything is normalised to a plain object so the UI never has to reason
 * about the raw strings again.
 */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const pad = (n) => String(n).padStart(2, "0");

/**
 * Parse a date-ish string. Returns null for anything unrecognised, or an
 * object like { kind, year, month, day, precision, iso, ts }.
 */
export function parseDateInput(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;

  if (/^(present|now|current|today)$/i.test(s)) {
    return { kind: "present", precision: "present", ts: Infinity };
  }

  const m = s.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!m) return null;

  const year = Number(m[1]);
  const month = m[2] ? Math.min(12, Math.max(1, Number(m[2]))) : 1;
  const day = m[3] ? Math.min(31, Math.max(1, Number(m[3]))) : 1;
  const precision = m[3] ? "day" : m[2] ? "month" : "year";

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  return {
    kind: "date",
    year,
    month,
    day,
    precision,
    iso: `${year}-${pad(month)}-${pad(day)}`,
    ts: date.getTime(),
  };
}

function formatSingle(parsed, withDay) {
  if (!parsed || parsed.kind === "present") return "Present";
  if (parsed.precision === "year") return String(parsed.year);
  const monthLabel = `${MONTHS_SHORT[parsed.month - 1]} ${parsed.year}`;
  if (parsed.precision === "day" && withDay) {
    return `${parsed.day} ${monthLabel}`;
  }
  return monthLabel;
}

/**
 * Turn a normalised timeframe ({ from, to, kind }) into the floating label.
 *   - event   -> "10 Mar 2025"
 *   - range   -> "Jun 2024 – Aug 2024"
 *   - ongoing -> "Aug 2024 – Present"
 */
export function formatTimeframe(timeframe) {
  if (!timeframe) return "";
  if (timeframe.kind === "event") {
    return formatSingle(timeframe.from, true);
  }
  const fromLabel = formatSingle(timeframe.from, false);
  const toLabel =
    timeframe.kind === "ongoing" ? "Present" : formatSingle(timeframe.to, false);
  return `${fromLabel} – ${toLabel}`;
}

/**
 * Human duration between two parsed dates (or "present").
 * Returns strings like "2 years", "10 months", "1 year 4 months".
 * `from`/`to` are objects produced by parseDateInput ({ ts, kind, ... }).
 */
export function formatDuration(from, to) {
  if (!from || typeof from.ts !== "number") return "";
  const start = new Date(from.ts);
  const isPresent = !to || to.kind === "present" || typeof to.ts !== "number";
  const end = isPresent ? new Date() : new Date(to.ts);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
  if (end < start) return "";

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(
      end.getFullYear(),
      end.getMonth(),
      0
    ).getDate();
    days = daysInPrevMonth - start.getDate() + end.getDate();
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (remMonths > 0)
    parts.push(`${remMonths} ${remMonths === 1 ? "month" : "months"}`);
  if (!parts.length && days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }
  if (!parts.length) return "1 month";
  return parts.join(" ");
}

/**
 * Does a timestamp fall inside a state's [from, to] window?
 * `to` may be Infinity for "present".
 */
export function timestampInRange(ts, state) {
  if (ts == null) return false;
  const from = state.fromTs ?? state.from?.ts ?? -Infinity;
  const to = state.toTs ?? state.to?.ts ?? Infinity;
  return ts >= from && ts <= to;
}
