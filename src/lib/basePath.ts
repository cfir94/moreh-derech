// Next's <Link>/router auto-prefix basePath for app routes, but static
// files under /public (our embedded sub-apps) are plain <a href> links and
// need it prepended manually. Keep this in sync with next.config.ts.
export const BASE_PATH = "/moreh-derech";

export function embedUrl(path: string) {
  return `${BASE_PATH}/embeds/${path.replace(/^\/+/, "")}`;
}
