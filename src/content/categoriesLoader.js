import { loadYaml } from "../utils/yaml";

const CATEGORIES_PATH = `${process.env.PUBLIC_URL}/content/categories.yaml`;

const str = (v) => (typeof v === "string" && v.length ? v : undefined);

function sanitizeCategory(value) {
  if (!value || typeof value !== "object") return null;
  const id = str(value.id);
  if (!id) return null;
  return {
    id,
    label: str(value.label) || id,
    color: str(value.color) || "#22d3ee",
  };
}

export function sanitizeCategories(raw) {
  const categories = [];
  if (raw && Array.isArray(raw.categories)) {
    for (const item of raw.categories) {
      const category = sanitizeCategory(item);
      if (category) categories.push(category);
    }
  }
  return { categories };
}

export async function loadCategories() {
  const raw = await loadYaml(CATEGORIES_PATH);
  return sanitizeCategories(raw);
}
