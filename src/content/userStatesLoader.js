import { loadYaml } from "../utils/yaml";

const STATES_PATH = `${process.env.PUBLIC_URL}/content/user_states.yaml`;

const str = (v) => (typeof v === "string" && v.length ? v : undefined);

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

function sanitizeState(value) {
  if (!value || typeof value !== "object") return null;

  const isCurrent = value.current === true;
  const year = isCurrent ? new Date().getFullYear() : Number(value.year);
  if (!Number.isInteger(year) || year < 1900) return null;

  return {
    year,
    current: isCurrent,
    label: str(value.label) || `Year ${year}`,
    description: str(value.description) || "",
    image: resolveImage(value.image),
  };
}

function sanitizeContacts(value) {
  if (!Array.isArray(value)) return [];
  const contacts = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const label = str(item.label);
    const contactValue = str(item.value);
    const url = str(item.url);
    if (label && contactValue && url) {
      contacts.push({ label, value: contactValue, url });
    }
  }
  return contacts;
}

function sanitizePerson(value) {
  if (!value || typeof value !== "object") return {};
  return {
    name: str(value.name) || "Portfolio",
    image: resolveImage(value.image),
    tagline: str(value.tagline) || "",
    contacts: sanitizeContacts(value.contacts),
  };
}

export function sanitizeUserStates(raw) {
  if (!raw || typeof raw !== "object") {
    return { person: {}, states: [] };
  }

  const states = [];
  if (Array.isArray(raw.states)) {
    for (const item of raw.states) {
      const state = sanitizeState(item);
      if (state) states.push(state);
    }
  }

  // Keep ascending by year so the "latest" state is the last one.
  states.sort((a, b) => a.year - b.year);

  // The current-year state (if any) is the default shown at the top.
  const defaultState =
    states.find((s) => s.current) ||
    states[states.length - 1] || {
      year: new Date().getFullYear(),
      label: "Portfolio",
      description: "",
    };

  return {
    person: sanitizePerson(raw.person),
    defaultState,
    states,
  };
}

export async function loadUserStates() {
  const raw = await loadYaml(STATES_PATH);
  return sanitizeUserStates(raw);
}
