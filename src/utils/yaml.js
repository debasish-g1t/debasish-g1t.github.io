/**
 * Fetches a YAML file from the public/ directory and parses it with js-yaml.
 *
 * js-yaml is loaded lazily (its own chunk) so the main bundle stays small, and
 * every loader in the app shares the same import-once behaviour.
 */
export async function loadYaml(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`could not load ${url} (HTTP ${response.status})`);
  }
  const text = await response.text();
  const yamlModule = await import("js-yaml");
  const load =
    yamlModule.load ||
    (yamlModule.default && yamlModule.default.load) ||
    yamlModule.default;
  return load(text);
}
