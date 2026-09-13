/**
 * Loads the nested main-timeline YAML from /public/content and turns it into a
 * safe JS object for the timeline renderer.
 *
 * Expected shape (see public/content/main-timeline.yaml):
 *   [
 *     { type: time-range, time_text, from, to, entries: [ ... ] },
 *     ...
 *   ]
 *
 * Each entry is a primary badge (Organization | Education | Research
 * Publication | International Conference) and may carry nested `projects`,
 * `links` (source links) and `stack` (tech-stack links).
 *
 *  - YAML is fetched at runtime and parsed lazily with js-yaml.
 *  - Local "./assets/..." image paths are resolved against PUBLIC_URL.
 *  - On failure we return { ranges: [] } instead of crashing the page.
 */

import { loadYaml } from "../utils/yaml";
import { parseDateInput, formatTimeframe } from "../utils/dates";

const YAML_PATH = `${process.env.PUBLIC_URL}/content/main-timeline.yaml`;

const STEP_TEXT_KEYS = [
  "badge",
  "title",
  "description",
  "date",
  "time",
  "location",
  "status",
  "id",
];

const STEP_IMAGE_KEYS = ["c_img", "image"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const str = (v) => (typeof v === "string" && v.length ? v : undefined);

// "./assets/x", "/assets/x" or "assets/x" -> `${PUBLIC_URL}/assets/x`; other
// strings (external http(s) urls etc.) are passed through untouched.
function resolveImage(value) {
  const s = str(value);
  if (!s) return undefined;
  for (const prefix of ["./assets/", "/assets/", "assets/"]) {
    if (s.startsWith(prefix)) {
      return `${process.env.PUBLIC_URL}/assets/${s.slice(prefix.length)}`;
    }
  }
  return s;
}

function sanitizeODetail(value) {
  if (!isObj(value)) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k && (typeof v === "string" || typeof v === "number" || typeof v === "boolean")) {
      out[k] = String(v);
    }
  }
  return Object.keys(out).length ? out : undefined;
}

// link: { url?, title?, text?, image? }
function sanitizeLink(value) {
  if (!isObj(value)) return undefined;
  const url = str(value.url);
  if (!url) return undefined;
  const out = { url };
  const title = str(value.title);
  if (title) out.title = title;
  const text = str(value.text);
  if (text) out.text = text;
  const image = resolveImage(value.image);
  if (image) out.image = image;
  return out;
}

function sanitizeLinks(value) {
  if (!Array.isArray(value)) return undefined;
  const out = [];
  for (const item of value) {
    const link = sanitizeLink(item);
    if (link) out.push(link);
  }
  return out.length ? out : undefined;
}

// project: { title?, description?, links? }
function sanitizeProject(value) {
  if (!isObj(value)) return undefined;
  const out = {};
  const title = str(value.title);
  if (title) out.title = title;
  const description = str(value.description);
  if (description) out.description = description;
  const links = sanitizeLinks(value.links);
  if (links) out.links = links;
  return Object.keys(out).length ? out : undefined;
}

function sanitizeProjects(value) {
  if (!Array.isArray(value)) return undefined;
  const out = [];
  for (const item of value) {
    const project = sanitizeProject(item);
    if (project) out.push(project);
  }
  return out.length ? out : undefined;
}

// timeframe: { date: "2025-03-10" } or { from, to } (to may be "present").
// Normalises to { from, to, kind, label, fromTs } for the renderer.
function sanitizeTimeframe(value) {
  if (!isObj(value)) return undefined;

  const dateRaw = str(value.date);
  const fromRaw = str(value.from);
  const toRaw = str(value.to);

  let from;
  let to;
  let kind;

  if (dateRaw) {
    from = parseDateInput(dateRaw);
    if (!from || from.kind !== "date") return undefined;
    to = from;
    kind = "event";
  } else if (fromRaw) {
    from = parseDateInput(fromRaw);
    if (!from || from.kind !== "date") return undefined;
    const toParsed = toRaw ? parseDateInput(toRaw) : null;
    if (toParsed && toParsed.kind === "present") {
      to = toParsed;
      kind = "ongoing";
    } else if (toParsed && toParsed.kind === "date") {
      to = toParsed;
      kind = toParsed.ts === from.ts ? "event" : "range";
    } else {
      to = from;
      kind = "event";
    }
  } else {
    return undefined;
  }

  return {
    from,
    to,
    kind,
    label: formatTimeframe({ from, to, kind }),
    fromTs: from.ts,
  };
}

function sanitizeEntry(value) {
  if (!isObj(value)) return null;

  const entry = {};
  for (const key of STEP_TEXT_KEYS) {
    const s = str(value[key]);
    if (s) entry[key] = s;
  }
  for (const key of STEP_IMAGE_KEYS) {
    const img = resolveImage(value[key]);
    if (img) entry[key] = img;
  }

  // Optional per-logo backdrop colour (any CSS colour or "transparent").
  // Lets light-mode- and dark-mode-designed logos each get a fitting plate.
  const cImgBg = str(value.c_img_bg);
  if (cImgBg) entry.c_img_bg = cImgBg;

  const timeframe = sanitizeTimeframe(value.timeframe);
  if (timeframe) entry.timeframe = timeframe;

  const oDetail = sanitizeODetail(value.o_detail);
  if (oDetail) entry.o_detail = oDetail;

  const projects = sanitizeProjects(value.projects);
  if (projects) entry.projects = projects;

  const links = sanitizeLinks(value.links);
  if (links) entry.links = links;

  const stack = sanitizeLinks(value.stack);
  if (stack) entry.stack = stack;

  return Object.keys(entry).length ? entry : null;
}

function sanitizeRange(value) {
  if (!isObj(value)) return null;

  const range = { type: "time-range" };
  const timeText = str(value.time_text);
  if (timeText) range.time_text = timeText;

  const timeframe = sanitizeTimeframe({ from: value.from, to: value.to });
  if (timeframe) range.timeframe = timeframe;

  const entries = [];
  if (Array.isArray(value.entries)) {
    for (const item of value.entries) {
      const entry = sanitizeEntry(item);
      if (entry) entries.push(entry);
    }
  }
  range.entries = entries;

  return range;
}

export function sanitizeTimeline(raw) {
  const ranges = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const range = sanitizeRange(item);
      if (range && range.entries.length) ranges.push(range);
    }
  }
  return { ranges };
}

export async function loadMainTimeline() {
  try {
    return sanitizeTimeline(await loadYaml(YAML_PATH));
  } catch (err) {
    console.warn(
      "[timeline] could not read the timeline YAML; showing an empty timeline.",
      err instanceof Error ? err.message : err
    );
    return { ranges: [] };
  }
}
